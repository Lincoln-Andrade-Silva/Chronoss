"use client";

import { useState } from "react";
import { TabBar, type TabItem } from "@/components/ui";
import type { Servico } from "@/db/schema";
import { AssinantesClient, type AssinanteRow } from "@/features/assinaturas/assinantes-client";
import type { OpcaoCliente, OpcaoPlano } from "@/features/assinaturas/assinatura-modal";
import { PlanosClient } from "@/features/planos/planos-client";
import type { PlanoComServicos } from "@/features/planos/plano-modal";

const TABS = [
  { key: "assinantes", label: "Clientes Assinantes", ready: true },
  { key: "planos", label: "Planos", ready: true },
] as const satisfies readonly TabItem[];

export function AssinaturasTabs({
  assinaturas,
  clientes,
  opcoesPlanos,
  planos,
  servicos,
}: {
  assinaturas: AssinanteRow[];
  clientes: OpcaoCliente[];
  opcoesPlanos: OpcaoPlano[];
  planos: PlanoComServicos[];
  servicos: Servico[];
}) {
  const [tab, setTab] = useState<string>("assinantes");

  return (
    <div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "assinantes" && (
        <AssinantesClient
          assinaturas={assinaturas}
          clientes={clientes}
          planos={opcoesPlanos}
        />
      )}
      {tab === "planos" && <PlanosClient planos={planos} servicos={servicos} />}
    </div>
  );
}
