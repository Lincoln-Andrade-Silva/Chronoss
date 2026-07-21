"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, lt, ne } from "drizzle-orm";
import { db } from "@/db";
import { agendamentos, servicos } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { instanteSlot } from "@/lib/disponibilidade";
import { servicoCobertoPorPlano } from "@/lib/plano";
import { estornarAgendamento } from "@/features/agendamento/pagamento";

/** Ids do agendamento e, se fizer parte de um grupo (multi-serviço), de todo o grupo. */
async function idsAlvo(id: string): Promise<string[]> {
  const [row] = await db
    .select({ grupoId: agendamentos.grupoId })
    .from(agendamentos)
    .where(eq(agendamentos.id, id));
  if (!row) return [];
  if (!row.grupoId) return [id];
  const linhas = await db
    .select({ id: agendamentos.id })
    .from(agendamentos)
    .where(eq(agendamentos.grupoId, row.grupoId));
  return linhas.map((l) => l.id);
}

export async function finalizarAgendamento(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return {};

  // Não finaliza enquanto o pagamento online não foi concluído.
  const linhas = await db
    .select({ formaPagamento: agendamentos.formaPagamento, pagamentoStatus: agendamentos.pagamentoStatus })
    .from(agendamentos)
    .where(inArray(agendamentos.id, ids));
  const aguardando = linhas.some(
    (l) => l.formaPagamento === "online" && l.pagamentoStatus === "pendente",
  );
  if (aguardando) {
    return { error: "Pagamento online pendente: conclua o pagamento ou cancele o agendamento." };
  }

  await db.update(agendamentos).set({ status: "finalizado" }).where(inArray(agendamentos.id, ids));
  revalidatePath("/admin/agenda");
  return {};
}

export async function cancelarAgendamentoAdmin(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return {};

  const [ag] = await db
    .select({ pagamentoStatus: agendamentos.pagamentoStatus })
    .from(agendamentos)
    .where(eq(agendamentos.id, id));

  // Se foi pago online, cancelar implica estornar: reflete como estornado.
  if (ag?.pagamentoStatus === "pago") {
    try {
      await estornarAgendamento(ids);
    } catch (e) {
      console.error("Falha ao estornar no cancelamento (admin):", e);
      return { error: "Não foi possível estornar o pagamento. Tente novamente." };
    }
  } else {
    await db.update(agendamentos).set({ status: "cancelado" }).where(inArray(agendamentos.id, ids));
  }
  revalidatePath("/admin/agenda");
  return {};
}

/**
 * Estorna um atendimento: online chama o refund do MP; presencial só registra a
 * devolução. Serve para devolver dinheiro de um atendimento já finalizado ou pago.
 */
export async function estornarAgendamentoAdmin(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return {};
  try {
    await estornarAgendamento(ids);
  } catch (e) {
    console.error("Falha ao estornar atendimento:", e);
    return { error: "Não foi possível estornar no Mercado Pago. Tente novamente." };
  }
  revalidatePath("/admin/agenda");
  return {};
}

export async function excluirAgendamento(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return {};
  await db.delete(agendamentos).where(inArray(agendamentos.id, ids));
  revalidatePath("/admin/agenda");
  return {};
}

export interface NovoAtendimentoResult {
  ok?: boolean;
  error?: string;
}

/** Cria um atendimento pelo admin para um cliente, com um ou mais serviços em sequência. */
export async function criarAtendimentoAdmin(input: {
  barbeiroId: string;
  clienteId?: string;
  clienteAvulso?: string;
  servicoIds: string[];
  data: string;
  hora: string;
}): Promise<NovoAtendimentoResult> {
  await requireAdmin();
  const { barbeiroId, servicoIds, data, hora } = input;
  const clienteId = input.clienteId || null;
  const clienteAvulso = clienteId ? null : input.clienteAvulso?.trim() || null;

  if (!barbeiroId) return { error: "Selecione o profissional." };
  if (servicoIds.length === 0) return { error: "Selecione ao menos um serviço." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
    return { error: "Data ou horário inválidos." };
  }

  const servs = await db.select().from(servicos).where(inArray(servicos.id, servicoIds));
  const ordenados = servicoIds.map((id) => servs.find((s) => s.id === id));
  if (ordenados.some((s) => !s)) return { error: "Serviço não encontrado." };
  const servicosOrdenados = ordenados as (typeof servs)[number][];

  const duracaoTotal = servicosOrdenados.reduce((soma, s) => soma + s.duracaoMinutos, 0);
  const inicioBloco = instanteSlot(data, hora);
  const fimBloco = new Date(inicioBloco.getTime() + duracaoTotal * 60_000);

  // Conflito: bloco não pode sobrepor outro atendimento do barbeiro no dia.
  const inicioDia = instanteSlot(data, "00:00");
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
  const existentes = await db
    .select({ dataHora: agendamentos.dataHora, duracao: servicos.duracaoMinutos })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(agendamentos.barbeiroId, barbeiroId),
        ne(agendamentos.status, "cancelado"),
        gte(agendamentos.dataHora, inicioDia),
        lt(agendamentos.dataHora, fimDia),
      ),
    );
  const colide = existentes.some((e) => {
    const oInicio = new Date(e.dataHora);
    const oFim = new Date(oInicio.getTime() + e.duracao * 60_000);
    return inicioBloco < oFim && oInicio < fimBloco;
  });
  if (colide) return { error: "Esse horário conflita com outro atendimento do profissional." };

  const grupoId = servicosOrdenados.length > 1 ? crypto.randomUUID() : null;
  const linhas = [];
  let offset = 0;
  for (const servico of servicosOrdenados) {
    const inicio = new Date(inicioBloco.getTime() + offset * 60_000);
    const coberto = clienteId
      ? await servicoCobertoPorPlano(clienteId, servico.id, data, inicio)
      : false;
    linhas.push({
      clienteId,
      clienteAvulso,
      barbeiroId,
      servicoId: servico.id,
      grupoId,
      dataHora: inicio,
      valor: coberto ? "0" : servico.preco,
      tipo: coberto ? ("plano" as const) : ("avulso" as const),
      status: "agendado" as const,
    });
    offset += servico.duracaoMinutos;
  }

  try {
    await db.insert(agendamentos).values(linhas);
  } catch (err) {
    console.error("Falha ao criar atendimento:", err);
    return { error: "Não foi possível criar. Tente novamente." };
  }

  revalidatePath("/admin/agenda");
  return { ok: true };
}
