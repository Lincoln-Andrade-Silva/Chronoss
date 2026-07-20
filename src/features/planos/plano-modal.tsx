"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button, Field, FormError, Input, Modal, Toggle } from "@/components/ui";
import type { Servico } from "@/db/schema";
import { cn } from "@/lib/cn";
import { formatDuracao } from "@/lib/format";
import { salvarPlano, type PlanoFormState } from "./actions";

export interface PlanoComServicos {
  id: string;
  nome: string;
  valor: string;
  diasValidade: number;
  ativo: boolean;
  servicoIds: string[];
}

function SubmitButton({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
    </Button>
  );
}

export function PlanoModal({
  plano,
  servicos,
  onClose,
}: {
  plano: PlanoComServicos | null;
  servicos: Servico[];
  onClose: () => void;
}) {
  const [state, formAction] = useFormState<PlanoFormState, FormData>(salvarPlano, {});
  const [ativo, setAtivo] = useState(plano?.ativo ?? true);
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(plano?.servicoIds ?? []),
  );

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  function toggleServico(id: string) {
    setSelecionados((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  return (
    <Modal open onClose={onClose} title={plano ? "Editar plano" : "Novo plano"}>
      <form action={formAction} className="mx-auto max-w-md space-y-5">
        {plano && <input type="hidden" name="id" value={plano.id} />}
        <input type="hidden" name="ativo" value={String(ativo)} />
        {Array.from(selecionados).map((id) => (
          <input key={id} type="hidden" name="servicoIds" value={id} />
        ))}

        <Field label="Nome" htmlFor="pl-nome">
          <Input
            id="pl-nome"
            name="nome"
            required
            defaultValue={plano?.nome ?? ""}
            placeholder="Ex: Plano Mensal"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor mensal (R$)" htmlFor="pl-valor">
            <Input
              id="pl-valor"
              name="valor"
              type="number"
              min={0}
              step="0.01"
              defaultValue={plano?.valor ?? "0"}
            />
          </Field>
          <Field label="Validade (dias)" htmlFor="pl-dias">
            <Input
              id="pl-dias"
              name="diasValidade"
              type="number"
              min={1}
              defaultValue={plano?.diasValidade ?? 30}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            Serviços inclusos
          </p>
          {servicos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum serviço cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {servicos.map((s) => {
                const incluido = selecionados.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleServico(s.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition",
                      incluido
                        ? "border-brand bg-brand/10 text-brand-light"
                        : "border-line text-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {incluido && <Check className="h-3.5 w-3.5" />}
                    {s.nome}
                    <span className="text-xs opacity-70">{formatDuracao(s.duracaoMinutos)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium">Ativo</p>
            <p className="text-xs text-muted">Disponível para novas assinaturas.</p>
          </div>
          <Toggle on={ativo} onClick={() => setAtivo(!ativo)} />
        </div>

        {state.error && <FormError>{state.error}</FormError>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton editando={!!plano} />
        </div>
      </form>
    </Modal>
  );
}
