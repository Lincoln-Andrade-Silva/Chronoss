import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { agendamentos } from "@/db/schema";
import { estornarPagamento, getPagamento, situacaoPagamento } from "@/lib/mercadopago";

/** Linhas (grupo ou agendamento único) de um cliente referenciadas por uma chave de pagamento. */
function alvoDoGrupo(clienteId: string, refKey: string) {
  return and(
    eq(agendamentos.clienteId, clienteId),
    or(eq(agendamentos.grupoId, refKey), eq(agendamentos.id, refKey)),
  );
}

/**
 * Consulta o pagamento no Mercado Pago e reflete o status no agendamento.
 * Usado no retorno do checkout e no webhook (type=payment) — inclusive estornos
 * feitos direto no painel do MP, que chegam como status "refunded".
 * Se `clienteIdEsperado` vier, valida que o pagamento é do próprio cliente.
 */
export async function reconciliarPagamentoAgendamento(
  paymentId: string,
  clienteIdEsperado?: string,
): Promise<void> {
  const pag = await getPagamento(paymentId).catch(() => null);
  if (!pag) return;

  const [clienteId, refKey] = (pag.external_reference ?? "").split(":");
  if (!clienteId || !refKey) return;
  if (clienteIdEsperado && clienteId !== clienteIdEsperado) return;

  const situacao = situacaoPagamento(pag.status);
  const set: Partial<typeof agendamentos.$inferInsert> = {
    pagamentoStatus: situacao,
    gatewayPagamentoId: String(pag.id),
  };
  // Estorno no gateway devolve o dinheiro: o atendimento vira "estornado".
  if (situacao === "estornado") set.status = "estornado";

  await db
    .update(agendamentos)
    .set(set)
    .where(and(alvoDoGrupo(clienteId, refKey), eq(agendamentos.formaPagamento, "online")));
}

/**
 * Estorna no MP (se houver pagamento online aprovado) as linhas indicadas e marca
 * o status como estornado. Presencial (sem id de gateway) apenas registra a devolução.
 */
export async function estornarAgendamento(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const linhas = await db
    .select({
      pagamentoStatus: agendamentos.pagamentoStatus,
      gatewayPagamentoId: agendamentos.gatewayPagamentoId,
    })
    .from(agendamentos)
    .where(inArray(agendamentos.id, ids));

  const pagamentosOnline = new Set(
    linhas
      .filter((l) => l.pagamentoStatus === "pago" && l.gatewayPagamentoId)
      .map((l) => l.gatewayPagamentoId as string),
  );

  for (const pagamentoId of pagamentosOnline) {
    await estornarPagamento(pagamentoId);
  }

  await db
    .update(agendamentos)
    .set({ status: "estornado", pagamentoStatus: "estornado" })
    .where(inArray(agendamentos.id, ids));
}
