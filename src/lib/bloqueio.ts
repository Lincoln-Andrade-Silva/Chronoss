const MS_DIA = 24 * 60 * 60 * 1000;

export interface EntradaBloqueio {
  bloqueadoEm: Date | null;
  bloqueioDias: number | null;
  bloqueioMotivo: string | null;
}

export interface EstadoBloqueio {
  ativo: boolean;
  motivo: string | null;
  // Instante em que o bloqueio expira; null = permanente (ou sem bloqueio).
  ate: Date | null;
}

/** Deriva o estado atual do bloqueio: permanente, temporário vigente ou expirado. */
export function estadoBloqueio(
  entrada: EntradaBloqueio,
  agora: Date = new Date(),
): EstadoBloqueio {
  const { bloqueadoEm, bloqueioDias, bloqueioMotivo } = entrada;
  if (!bloqueadoEm) return { ativo: false, motivo: null, ate: null };

  // Sem dias = permanente.
  if (bloqueioDias == null) {
    return { ativo: true, motivo: bloqueioMotivo, ate: null };
  }

  const ate = new Date(bloqueadoEm.getTime() + bloqueioDias * MS_DIA);
  if (agora.getTime() >= ate.getTime()) {
    return { ativo: false, motivo: null, ate: null };
  }
  return { ativo: true, motivo: bloqueioMotivo, ate };
}

function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/** Mensagem exibida ao cliente bloqueado ao tentar agendar ou assinar. */
export function mensagemBloqueio(estado: EstadoBloqueio): string {
  const prazo = estado.ate
    ? `até ${formatarData(estado.ate)}`
    : "permanentemente";
  const motivo = estado.motivo?.trim();
  const base = `Seu acesso está bloqueado ${prazo}.`;
  return motivo ? `${base} Motivo: ${motivo}` : base;
}
