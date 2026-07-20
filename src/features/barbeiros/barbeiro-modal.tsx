"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ImagePlus } from "lucide-react";
import { Button, Field, FormError, Input, Modal, Toggle } from "@/components/ui";
import type { Barbeiro } from "@/db/schema";
import { salvarBarbeiro, type BarbeiroFormState } from "./actions";

function SubmitButton({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
    </Button>
  );
}

export function BarbeiroModal({
  barbeiro,
  onClose,
}: {
  barbeiro: Barbeiro | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState<BarbeiroFormState, FormData>(salvarBarbeiro, {});
  const [preview, setPreview] = useState<string | null>(barbeiro?.fotoUrl ?? null);
  const [ativo, setAtivo] = useState(barbeiro?.ativo ?? true);

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  function onFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <Modal open onClose={onClose} title={barbeiro ? "Editar barbeiro" : "Novo barbeiro"}>
      <form action={formAction} className="space-y-5">
        {barbeiro && <input type="hidden" name="id" value={barbeiro.id} />}
        <input type="hidden" name="ativo" value={String(ativo)} />

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Foto do barbeiro" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted2" />
            )}
          </div>
          <div>
            <label
              htmlFor="foto"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink transition hover:bg-surface2"
            >
              <ImagePlus className="h-4 w-4" />
              Foto
            </label>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onFotoChange}
              className="hidden"
            />
          </div>
        </div>

        <Field label="Nome" htmlFor="b-nome">
          <Input
            id="b-nome"
            name="nome"
            required
            defaultValue={barbeiro?.nome ?? ""}
            placeholder="Nome do barbeiro"
          />
        </Field>

        <Field label="Comissão (%)" htmlFor="b-comissao" hint="sobre o serviço">
          <Input
            id="b-comissao"
            name="comissao"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={barbeiro?.comissaoPercentual ?? "0"}
          />
        </Field>

        <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium">Ativo</p>
            <p className="text-xs text-muted">Disponível para agendamentos.</p>
          </div>
          <Toggle on={ativo} onClick={() => setAtivo(!ativo)} />
        </div>

        {state.error && <FormError>{state.error}</FormError>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton editando={!!barbeiro} />
        </div>
      </form>
    </Modal>
  );
}
