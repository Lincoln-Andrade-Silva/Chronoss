import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { Percent, Scissors, Users } from "lucide-react";
import { db } from "@/db";
import { agendamentos, barbeiros, profiles, servicos } from "@/db/schema";
import { formatBRL } from "@/lib/format";
import { gerarDias, spYmd } from "./datas";
import { RankingExpansivel } from "./ranking-expansivel";
import { GraficoBarras, KpiGrid, Secao } from "./ui";

export async function PainelComissoes({
  inicio,
  fimExclusivo,
}: {
  inicio: Date;
  fimExclusivo: Date;
}) {
  const finalizados = await db
    .select({
      dataHora: agendamentos.dataHora,
      valor: agendamentos.valor,
      barbeiroId: agendamentos.barbeiroId,
      barbeiroNome: barbeiros.nome,
      barbeiroFoto: barbeiros.fotoUrl,
      comissao: barbeiros.comissaoPercentual,
      servicoNome: servicos.nome,
      clienteNome: profiles.nome,
    })
    .from(agendamentos)
    .innerJoin(barbeiros, eq(agendamentos.barbeiroId, barbeiros.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(profiles, eq(agendamentos.clienteId, profiles.id))
    .where(
      and(
        eq(agendamentos.status, "finalizado"),
        gte(agendamentos.dataHora, inicio),
        lt(agendamentos.dataHora, fimExclusivo),
      ),
    )
    .orderBy(asc(barbeiros.nome), desc(agendamentos.dataHora));

  const dias = gerarDias(inicio, fimExclusivo);
  const porDia = new Map<string, number>(dias.map((d) => [d, 0]));
  for (const r of finalizados) {
    const c = (Number(r.valor) * Number(r.comissao)) / 100;
    porDia.set(spYmd(r.dataHora), (porDia.get(spYmd(r.dataHora)) ?? 0) + c);
  }
  const serie = dias.map((dia) => ({ dia, valor: porDia.get(dia) ?? 0 }));

  const porBarbeiro = new Map<
    string,
    {
      id: string;
      nome: string;
      foto: string | null;
      pct: number;
      faturamento: number;
      comissao: number;
      servicos: Map<string, { qtd: number; valor: number; comissao: number }>;
    }
  >();
  for (const r of finalizados) {
    const a =
      porBarbeiro.get(r.barbeiroId) ??
      {
        id: r.barbeiroId,
        nome: r.barbeiroNome,
        foto: r.barbeiroFoto,
        pct: Number(r.comissao),
        faturamento: 0,
        comissao: 0,
        servicos: new Map<string, { qtd: number; valor: number; comissao: number }>(),
      };
    const c = (Number(r.valor) * Number(r.comissao)) / 100;
    a.faturamento += Number(r.valor);
    a.comissao += c;
    const sv = a.servicos.get(r.servicoNome) ?? { qtd: 0, valor: 0, comissao: 0 };
    sv.qtd += 1;
    sv.valor += Number(r.valor);
    sv.comissao += c;
    a.servicos.set(r.servicoNome, sv);
    porBarbeiro.set(r.barbeiroId, a);
  }
  const resumo = [...porBarbeiro.values()].sort((a, b) => b.comissao - a.comissao);
  const comissoesTotais = resumo.reduce((s, b) => s + b.comissao, 0);
  const faturamentoTotal = resumo.reduce((s, b) => s + b.faturamento, 0);
  const maxComissao = Math.max(1, ...resumo.map((b) => b.comissao));

  const comissaoItens = resumo.map((b) => ({
    id: b.id,
    nome: b.nome,
    foto: b.foto,
    destaque: formatBRL(b.comissao),
    sub: `${b.pct.toFixed(0)}% de comissão`,
    proporcao: (b.comissao / maxComissao) * 100,
    colValor: "Valor",
    colExtra: "Comissão",
    linhas: [...b.servicos.entries()]
      .sort((a, c) => c[1].comissao - a[1].comissao)
      .map(([nome, v]) => ({
        nome,
        qtd: v.qtd,
        valor: formatBRL(v.valor),
        extra: formatBRL(v.comissao),
      })),
    totalValor: formatBRL(b.faturamento),
    totalExtra: formatBRL(b.comissao),
    totalRotulo: `Total (${b.pct.toFixed(0)}%)`,
  }));

  return (
    <div className="space-y-6">
      <KpiGrid
        cards={[
          { label: "Comissões a pagar", valor: formatBRL(comissoesTotais), icon: Percent },
          { label: "Faturamento em serviços", valor: formatBRL(faturamentoTotal), icon: Scissors },
          { label: "Profissionais", valor: String(resumo.length), icon: Users },
        ]}
      />

      <Secao titulo="Comissões por dia">
        <GraficoBarras dados={serie} formato="moeda" />
      </Secao>

      <Secao titulo="Comissão por profissional">
        <RankingExpansivel itens={comissaoItens} vazio="Nenhum atendimento finalizado no período." />
      </Secao>
    </div>
  );
}
