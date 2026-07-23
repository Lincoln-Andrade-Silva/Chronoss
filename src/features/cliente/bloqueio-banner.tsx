import { Ban } from "lucide-react";
import { estadoBloqueio, mensagemBloqueio, type EntradaBloqueio } from "@/lib/bloqueio";

/** Aviso no topo das telas de cliente quando o acesso está bloqueado. Não renderiza nada se livre. */
export function BloqueioBanner({ entrada }: { entrada: EntradaBloqueio }) {
  const estado = estadoBloqueio(entrada);
  if (!estado.ativo) return null;

  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3">
      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <p className="text-sm text-red-400">{mensagemBloqueio(estado)}</p>
    </div>
  );
}
