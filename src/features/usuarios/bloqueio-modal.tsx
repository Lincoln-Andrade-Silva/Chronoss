"use client";

import { useState, useTransition } from "react";
import { Button, Field, FormError, Input, Modal, Textarea } from "@/components/ui";
import { bloquearUsuario } from "./actions";
import type { UsuarioRow } from "./usuarios-client";

export function BloqueioModal({
  usuario,
  onClose,
}: {
  usuario: UsuarioRow;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [dias, setDias] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    const diasNum = dias.trim() === "" ? null : Number(dias);
    startTransition(async () => {
      const res = await bloquearUsuario(usuario.id, motivo, diasNum);
      if (res.error) {
        setErro(res.error);
        return;
      }
      onClose();
    });
  }

  return (
    <Modal open onClose={onClose} title="Bloquear usuário">
      <div className="mx-auto max-w-sm space-y-5">
        <p className="text-sm text-muted">
          <strong className="text-ink">{usuario.nome}</strong> continuará conseguindo entrar, mas
          ficará impedido de agendar serviços e contratar novos planos. Poderá apenas cancelar um
          plano que já tenha.
        </p>

        <Field label="Motivo" htmlFor="bloq-motivo">
          <Textarea
            id="bloq-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo do bloqueio"
          />
        </Field>

        <Field label="Dias de bloqueio" htmlFor="bloq-dias">
          <Input
            id="bloq-dias"
            type="number"
            min={1}
            inputMode="numeric"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            placeholder="Deixe vazio para bloqueio permanente"
          />
        </Field>

        {erro && <FormError>{erro}</FormError>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={confirmar}>
            {pending ? "Bloqueando..." : "Bloquear"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
