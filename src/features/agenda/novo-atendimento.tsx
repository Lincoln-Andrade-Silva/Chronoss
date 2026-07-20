"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Field, FormError, Input, Modal, Select, Toggle } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatBRL, formatDuracao } from "@/lib/format";
import { criarAtendimentoAdmin } from "./actions";

interface Opcao {
  id: string;
  nome: string;
  fotoUrl?: string | null;
}

interface ServicoOpcao {
  id: string;
  nome: string;
  preco: string;
  duracaoMinutos: number;
}

function hojeSP(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function agoraSP(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NovoAtendimento({
  barbeiros,
  clientes,
  servicos,
}: {
  barbeiros: Opcao[];
  clientes: Opcao[];
  servicos: ServicoOpcao[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [clienteAvulso, setClienteAvulso] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [data, setData] = useState(hojeSP());
  const [hora, setHora] = useState(agoraSP());
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  function abrir() {
    setClienteId("");
    setClienteAvulso("");
    setBarbeiroId("");
    setServicoIds([]);
    setData(hojeSP());
    setHora(agoraSP());
    setErro(null);
    setAberto(true);
  }

  function toggleServico(id: string) {
    setServicoIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const selecionados = servicoIds
    .map((id) => servicos.find((s) => s.id === id))
    .filter((s): s is ServicoOpcao => Boolean(s));
  const duracaoTotal = selecionados.reduce((s, x) => s + x.duracaoMinutos, 0);
  const total = selecionados.reduce((s, x) => s + Number(x.preco), 0);

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarAtendimentoAdmin({
        barbeiroId,
        clienteId,
        clienteAvulso,
        servicoIds,
        data,
        hora,
      });
      if (res.error) {
        setErro(res.error);
        return;
      }
      setAberto(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button className="h-11 w-full sm:w-auto" onClick={abrir}>
        <Plus className="h-4 w-4" />
        Atendimento rápido
      </Button>

      {aberto && (
        <Modal open onClose={() => setAberto(false)} title="Novo atendimento">
          <div className="mx-auto max-w-sm space-y-5">
            <Field label="Cliente">
              <Select
                value={clienteId}
                onChange={setClienteId}
                options={[
                  { value: "", label: "Sem cadastro" },
                  ...clientes.map((c) => ({ value: c.id, label: c.nome })),
                ]}
              />
              {!clienteId && (
                <Input
                  className="mt-2"
                  value={clienteAvulso}
                  onChange={(e) => setClienteAvulso(e.target.value)}
                  placeholder="Nome do cliente (opcional)"
                />
              )}
            </Field>

            <Field label="Profissional">
              <Select
                value={barbeiroId}
                onChange={setBarbeiroId}
                withAvatar
                options={[
                  { value: "", label: "Selecione o profissional" },
                  ...barbeiros.map((b) => ({ value: b.id, label: b.nome, avatarUrl: b.fotoUrl })),
                ]}
              />
            </Field>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                Serviços
              </p>
              {servicos.length === 0 ? (
                <p className="text-sm text-muted">Nenhum serviço cadastrado.</p>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-0.5">
                  {servicos.map((s) => {
                    const sel = servicoIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "rounded-lg border p-3 transition",
                          sel ? "border-brand/40 bg-surface" : "border-line",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Toggle on={sel} onClick={() => toggleServico(s.id)} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.nome}</p>
                            <p className="truncate text-xs text-muted">
                              {formatDuracao(s.duracaoMinutos)} · {formatBRL(s.preco)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {selecionados.length > 0 && (
                <p className="mt-2 text-xs text-muted">
                  {selecionados.length} {selecionados.length === 1 ? "serviço" : "serviços"} ·{" "}
                  {formatDuracao(duracaoTotal)} · {formatBRL(total)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Data" htmlFor="na-data">
                <Input id="na-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </Field>
              <Field label="Horário" htmlFor="na-hora">
                <Input id="na-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </Field>
            </div>

            {erro && <FormError>{erro}</FormError>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={enviando || !barbeiroId || servicoIds.length === 0}
                onClick={salvar}
              >
                {enviando ? "Salvando..." : "Criar atendimento"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
