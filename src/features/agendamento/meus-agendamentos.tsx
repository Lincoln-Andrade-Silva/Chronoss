"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarPlus, Clock, Star, X } from "lucide-react";
import { Badge, Button, ConfirmModal } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import { cancelarAgendamento } from "./actions";

type StatusAg = "agendado" | "finalizado" | "cancelado";
type Tipo = "avulso" | "plano";

interface AgendamentoItem {
  id: string;
  grupoId: string | null;
  dataHoraISO: string;
  status: StatusAg;
  tipo: Tipo;
  valor: string;
  servicoNome: string;
  barbeiroNome: string;
  barbeiroFoto: string | null;
}

interface Marcacao {
  id: string;
  dataHoraISO: string;
  status: StatusAg;
  barbeiroNome: string;
  barbeiroFoto: string | null;
  temPlano: boolean;
  valorTotal: number;
  servicos: { nome: string; valor: string; tipo: Tipo }[];
}

function montarMarcacoes(items: AgendamentoItem[]): Marcacao[] {
  const ordenados = [...items].sort(
    (a, b) => new Date(a.dataHoraISO).getTime() - new Date(b.dataHoraISO).getTime(),
  );
  const mapa = new Map<string, Marcacao>();
  for (const item of ordenados) {
    const chave = item.grupoId ?? item.id;
    const m = mapa.get(chave);
    if (!m) {
      mapa.set(chave, {
        id: item.id,
        dataHoraISO: item.dataHoraISO,
        status: item.status,
        barbeiroNome: item.barbeiroNome,
        barbeiroFoto: item.barbeiroFoto,
        temPlano: item.tipo === "plano",
        valorTotal: Number(item.valor),
        servicos: [{ nome: item.servicoNome, valor: item.valor, tipo: item.tipo }],
      });
    } else {
      m.temPlano = m.temPlano || item.tipo === "plano";
      m.valorTotal += Number(item.valor);
      m.servicos.push({ nome: item.servicoNome, valor: item.valor, tipo: item.tipo });
    }
  }
  return [...mapa.values()];
}

function partesData(iso: string) {
  const d = new Date(iso);
  const opt = { timeZone: "America/Sao_Paulo" } as const;
  return {
    semana: d.toLocaleDateString("pt-BR", { weekday: "short", ...opt }).replace(".", ""),
    dia: d.toLocaleDateString("pt-BR", { day: "2-digit", ...opt }),
    mes: d.toLocaleDateString("pt-BR", { month: "short", ...opt }).replace(".", ""),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", ...opt }),
  };
}

function resumoData(iso: string): string {
  const p = partesData(iso);
  return `${p.dia}/${p.mes} às ${p.hora}`;
}

function StatusBadge({ status }: { status: StatusAg }) {
  if (status === "agendado") return <Badge tone="brand">Agendado</Badge>;
  if (status === "finalizado") return <Badge tone="success">Finalizado</Badge>;
  return <Badge tone="muted">Cancelado</Badge>;
}

function Avatar({ url, nome }: { url: string | null; nome: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={nome} className="h-7 w-7 shrink-0 rounded-full border border-line object-cover" />
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}

function Cartao({ marcacao, onCancelar }: { marcacao: Marcacao; onCancelar?: () => void }) {
  const p = partesData(marcacao.dataHoraISO);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center rounded-lg bg-surface px-3 py-1.5 leading-none">
            <span className="text-[10px] font-medium uppercase text-muted2">{p.semana}</span>
            <span className="text-lg font-bold">{p.dia}</span>
            <span className="text-[10px] uppercase text-muted2">{p.mes}</span>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Avatar url={marcacao.barbeiroFoto} nome={marcacao.barbeiroNome} />
              <span className="truncate">{marcacao.barbeiroNome}</span>
              {marcacao.temPlano && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-brand-light text-brand-light" />
              )}
            </p>
            <p className="mt-1 flex items-center gap-1.5 pl-0.5 text-[11px] text-muted2">
              <Clock className="h-3 w-3" />
              {p.hora}
            </p>
          </div>
        </div>
        <StatusBadge status={marcacao.status} />
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="space-y-1.5">
          {marcacao.servicos.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-light" />
                <span className="truncate">{s.nome}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  s.tipo === "plano" ? "text-emerald-400" : "text-muted",
                )}
              >
                {s.tipo === "plano" ? "Grátis" : formatBRL(s.valor)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted2">Total</span>
          <span className="text-sm font-bold">
            {marcacao.valorTotal === 0 ? (
              <span className="text-emerald-400">Grátis (plano)</span>
            ) : (
              formatBRL(marcacao.valorTotal)
            )}
          </span>
        </div>

        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-red-400"
          >
            <X className="h-4 w-4" />
            Cancelar agendamento
          </button>
        )}
      </div>
    </div>
  );
}

export function MeusAgendamentos({ items }: { items: AgendamentoItem[] }) {
  const [cancelar, setCancelar] = useState<Marcacao | null>(null);
  const [pending, startTransition] = useTransition();
  const agora = Date.now();

  const marcacoes = montarMarcacoes(items);
  const proximos = marcacoes.filter(
    (m) => m.status === "agendado" && new Date(m.dataHoraISO).getTime() > agora,
  );
  const historico = marcacoes.filter((m) => !proximos.includes(m));

  function confirmarCancelamento() {
    if (!cancelar) return;
    const id = cancelar.id;
    startTransition(async () => {
      await cancelarAgendamento(id);
      setCancelar(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-8 text-center">
        <p className="text-sm text-muted">Você ainda não tem agendamentos.</p>
        <Link
          href="/agendar"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-brand transition hover:bg-brand-dark"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar horário
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted2">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="text-sm text-muted">Nenhum agendamento futuro.</p>
        ) : (
          <div className="space-y-3">
            {proximos.map((m) => (
              <Cartao key={m.id} marcacao={m} onCancelar={() => setCancelar(m)} />
            ))}
          </div>
        )}
      </section>

      {historico.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted2">Histórico</h2>
          <div className="space-y-3">
            {historico.map((m) => (
              <Cartao key={m.id} marcacao={m} />
            ))}
          </div>
        </section>
      )}

      <ConfirmModal
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        onConfirm={confirmarCancelamento}
        loading={pending}
        title="Cancelar agendamento"
        confirmLabel="Cancelar agendamento"
        message={
          <>
            Deseja cancelar o agendamento de{" "}
            <strong className="text-ink">{cancelar?.servicos.map((s) => s.nome).join(", ")}</strong>
            {cancelar ? ` em ${resumoData(cancelar.dataHoraISO)}` : ""}?
          </>
        }
      />
    </div>
  );
}
