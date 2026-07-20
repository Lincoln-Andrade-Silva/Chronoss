"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";

function ymd(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function rangeParaDias(dias: number): [string, string] {
  const hoje = new Date();
  const ini = new Date();
  ini.setDate(ini.getDate() - (dias - 1));
  return [ymd(ini), ymd(hoje)];
}

const ATALHOS = [
  { label: "Hoje", dias: 1 },
  { label: "7 dias", dias: 7 },
  { label: "30 dias", dias: 30 },
];

export function PeriodNav({ inicio, fim }: { inicio: string; fim: string }) {
  const router = useRouter();

  function ir(novoInicio: string, novoFim: string) {
    router.push(`/admin/agenda?inicio=${novoInicio}&fim=${novoFim}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={inicio}
          onChange={(e) => e.target.value && ir(e.target.value, fim)}
          className="h-11 w-auto"
        />
        <span className="text-sm text-muted">até</span>
        <Input
          type="date"
          value={fim}
          onChange={(e) => e.target.value && ir(inicio, e.target.value)}
          className="h-11 w-auto"
        />
      </div>
      <div className="flex gap-2">
        {ATALHOS.map(({ label, dias }) => {
          const [i, f] = rangeParaDias(dias);
          const ativo = i === inicio && f === fim;
          return (
            <button
              key={dias}
              type="button"
              onClick={() => ir(i, f)}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-medium transition sm:flex-none",
                ativo
                  ? "border-transparent bg-brand text-white shadow-brand"
                  : "border-line text-muted hover:bg-surface hover:text-ink",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
