"use client";

import { useEffect, useState } from "react";
import { Badge, Modal } from "@/components/ui";
import {
  historicoBloqueios,
  type BloqueioHistoricoItem,
  type BloqueioStatus,
} from "./actions";
import type { UsuarioRow } from "./usuarios-client";

const STATUS: Record<BloqueioStatus, { label: string; tone: "danger" | "muted" | "success" }> = {
  ativo: { label: "Ativo", tone: "danger" },
  expirado: { label: "Expirado", tone: "muted" },
  revogado: { label: "Desbloqueado", tone: "success" },
};

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function HistoricoModal({
  usuario,
  onClose,
}: {
  usuario: UsuarioRow;
  onClose: () => void;
}) {
  const [itens, setItens] = useState<BloqueioHistoricoItem[] | null>(null);

  useEffect(() => {
    let ativo = true;
    void historicoBloqueios(usuario.id).then((res) => {
      if (ativo) setItens(res);
    });
    return () => {
      ativo = false;
    };
  }, [usuario.id]);

  return (
    <Modal open onClose={onClose} title={`Histórico de bloqueios · ${usuario.nome}`}>
      {itens === null ? (
        <p className="py-6 text-center text-sm text-muted">Carregando...</p>
      ) : itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Nenhum bloqueio registrado.</p>
      ) : (
        <ul className="space-y-3">
          {itens.map((item) => {
            const status = STATUS[item.status];
            return (
              <li key={item.id} className="rounded-lg border border-line bg-surface/30 p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted2">
                    {formatData(item.bloqueadoEm)} →{" "}
                    {item.fim ? formatData(item.fim) : "sem prazo"}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="text-sm text-ink">{item.motivo}</p>
                {item.criadoPorNome && (
                  <p className="mt-1 text-xs text-muted">Por {item.criadoPorNome}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
