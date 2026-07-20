"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";

function ymd(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function PeriodNav({ inicio, fim }: { inicio: string; fim: string }) {
  const router = useRouter();

  function ir(novoInicio: string, novoFim: string) {
    router.push(`/admin/agenda?inicio=${novoInicio}&fim=${novoFim}`);
  }

  function atalho(dias: number) {
    const hoje = new Date();
    const ini = new Date();
    ini.setDate(ini.getDate() - (dias - 1));
    ir(ymd(ini), ymd(hoje));
  }

  const atalhoBtn =
    "inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink sm:flex-none";

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
        <button type="button" className={cn(atalhoBtn)} onClick={() => atalho(1)}>
          Hoje
        </button>
        <button type="button" className={cn(atalhoBtn)} onClick={() => atalho(7)}>
          7 dias
        </button>
        <button type="button" className={cn(atalhoBtn)} onClick={() => atalho(30)}>
          30 dias
        </button>
      </div>
    </div>
  );
}
