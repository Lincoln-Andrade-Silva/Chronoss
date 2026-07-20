"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import { Avatar } from "./ui";

export interface ServicoDetalhe {
  nome: string;
  qtd: number;
  valor: number;
  comissao: number;
}

export interface ProfissionalDetalhe {
  id: string;
  nome: string;
  foto: string | null;
  pct: number;
  faturamento: number;
  comissao: number;
  servicos: ServicoDetalhe[];
}

export function RankingProfissional({
  itens,
  metrica,
}: {
  itens: ProfissionalDetalhe[];
  metrica: "faturamento" | "comissao";
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  const valorDe = (p: ProfissionalDetalhe) => (metrica === "faturamento" ? p.faturamento : p.comissao);
  const ordenados = [...itens].sort((a, b) => valorDe(b) - valorDe(a));
  const max = Math.max(1, ...ordenados.map(valorDe));

  if (ordenados.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">Nenhum atendimento no período.</p>;
  }

  return (
    <div className="space-y-2">
      {ordenados.map((p, idx) => {
        const exp = aberto === p.id;
        return (
          <div key={p.id} className="overflow-hidden rounded-lg border border-line/60">
            <button
              type="button"
              onClick={() => setAberto(exp ? null : p.id)}
              className="relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-surface/30"
            >
              <div
                className="absolute inset-y-0 left-0 bg-brand/10"
                style={{ width: `${Math.max((valorDe(p) / max) * 100, 4)}%` }}
              />
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface text-[11px] font-bold text-muted2">
                {idx + 1}
              </span>
              <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
                <Avatar url={p.foto} nome={p.nome} />
                <span className="truncate text-sm font-medium">{p.nome}</span>
              </div>
              <span className="relative shrink-0 text-sm font-bold">{formatBRL(valorDe(p))}</span>
              <ChevronDown
                className={cn("relative h-4 w-4 shrink-0 text-muted transition", exp && "rotate-180")}
              />
            </button>

            {exp && (
              <div className="border-t border-line bg-surface/20 px-3 py-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted2">
                      <th className="pb-1.5 text-left font-semibold">Serviço</th>
                      <th className="pb-1.5 text-right font-semibold">Qtd</th>
                      <th className="pb-1.5 text-right font-semibold">Valor</th>
                      <th className="pb-1.5 text-right font-semibold">Comissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40">
                    {p.servicos.map((s, i) => (
                      <tr key={i}>
                        <td className="py-1.5">{s.nome}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">{s.qtd}x</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">{formatBRL(s.valor)}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">{formatBRL(s.comissao)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-line font-bold">
                      <td className="pt-1.5">Total ({p.pct.toFixed(0)}%)</td>
                      <td className="pt-1.5" />
                      <td className="pt-1.5 text-right tabular-nums">{formatBRL(p.faturamento)}</td>
                      <td className="pt-1.5 text-right tabular-nums">{formatBRL(p.comissao)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
