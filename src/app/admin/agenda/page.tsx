import { and, asc, eq, gte, lt } from "drizzle-orm";
import { Ban, CalendarCheck, CheckCircle2, DollarSign, Receipt } from "lucide-react";
import { db } from "@/db";
import { agendamentos, barbeiros, profiles, servicos } from "@/db/schema";
import { Badge, Card, PageHeader } from "@/components/ui";
import { instanteSlot } from "@/lib/disponibilidade";
import { formatBRL } from "@/lib/format";
import { PeriodNav } from "@/features/agenda/period-nav";

export const dynamic = "force-dynamic";

function hojeSP(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function dataHoraSP(dataHora: Date): string {
  return dataHora.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LinhaAgenda {
  id: string;
  dataHora: Date;
  status: "agendado" | "finalizado" | "cancelado";
  valor: string;
  clienteNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoNome: string;
}

function StatusBadge({ status }: { status: LinhaAgenda["status"] }) {
  if (status === "finalizado") return <Badge tone="success">Finalizado</Badge>;
  if (status === "cancelado") return <Badge tone="muted">Cancelado</Badge>;
  return <Badge tone="brand">Agendado</Badge>;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { inicio?: string; fim?: string };
}) {
  const hoje = hojeSP();
  let inicio = searchParams.inicio ?? hoje;
  let fim = searchParams.fim ?? inicio;
  if (fim < inicio) [inicio, fim] = [fim, inicio];

  const inicioTs = instanteSlot(inicio, "00:00");
  const fimTs = new Date(instanteSlot(fim, "00:00").getTime() + 24 * 60 * 60 * 1000);

  const rows: LinhaAgenda[] = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      valor: agendamentos.valor,
      clienteNome: profiles.nome,
      barbeiroId: barbeiros.id,
      barbeiroNome: barbeiros.nome,
      servicoNome: servicos.nome,
    })
    .from(agendamentos)
    .innerJoin(barbeiros, eq(agendamentos.barbeiroId, barbeiros.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(profiles, eq(agendamentos.clienteId, profiles.id))
    .where(and(gte(agendamentos.dataHora, inicioTs), lt(agendamentos.dataHora, fimTs)))
    .orderBy(asc(agendamentos.dataHora));

  const cancelados = rows.filter((r) => r.status === "cancelado");
  const finalizados = rows.filter((r) => r.status === "finalizado");
  const validos = rows.filter((r) => r.status !== "cancelado");
  const total = validos.reduce((soma, r) => soma + Number(r.valor), 0);
  const ticket = validos.length > 0 ? total / validos.length : 0;
  const taxaCancelamento = rows.length > 0 ? (cancelados.length / rows.length) * 100 : 0;

  const cards = [
    { label: "Faturamento", valor: formatBRL(total), icon: DollarSign },
    { label: "Atendimentos", valor: String(validos.length), icon: CalendarCheck },
    { label: "Finalizados", valor: String(finalizados.length), icon: CheckCircle2 },
    {
      label: "Taxa de cancelamento",
      valor: `${taxaCancelamento.toFixed(0)}%`,
      icon: Ban,
    },
    { label: "Ticket médio", valor: formatBRL(ticket), icon: Receipt },
  ];

  const grupos = new Map<string, { nome: string; itens: LinhaAgenda[] }>();
  for (const r of rows) {
    const grupo = grupos.get(r.barbeiroId) ?? { nome: r.barbeiroNome, itens: [] };
    grupo.itens.push(r);
    grupos.set(r.barbeiroId, grupo);
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Agendamentos e faturamento por período."
        action={<PeriodNav inicio={inicio} fim={fim} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ label, valor, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted">{label}</span>
              <Icon className="h-4 w-4 shrink-0 text-brand-light" />
            </div>
            <p className="mt-3 text-2xl font-bold">{valor}</p>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">Nenhum agendamento no período.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grupos.values()).map((grupo) => (
            <div key={grupo.nome}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted2">
                {grupo.nome}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="divide-y divide-line">
                  {grupo.itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4"
                    >
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">
                        {dataHoraSP(item.dataHora)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.clienteNome}</p>
                        <p className="text-sm text-muted">{item.servicoNome}</p>
                      </div>
                      <StatusBadge status={item.status} />
                      <span className="w-24 shrink-0 text-right font-semibold text-brand-light">
                        {formatBRL(item.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
