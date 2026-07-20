import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assinaturas, planoServicos, planos, profiles, servicos } from "@/db/schema";
import { PageHeader } from "@/components/ui";
import { AssinaturasTabs } from "@/features/assinaturas/assinaturas-tabs";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const [assinRows, listaPlanos, vinculos, clientes, listaServicos] = await Promise.all([
    db
      .select({
        id: assinaturas.id,
        clienteId: assinaturas.clienteId,
        clienteNome: profiles.nome,
        clienteEmail: profiles.email,
        dataInicio: assinaturas.dataInicio,
        planoId: assinaturas.planoId,
        planoNome: planos.nome,
        status: assinaturas.status,
      })
      .from(assinaturas)
      .innerJoin(profiles, eq(assinaturas.clienteId, profiles.id))
      .innerJoin(planos, eq(assinaturas.planoId, planos.id))
      .orderBy(desc(assinaturas.dataInicio)),
    db.select().from(planos).orderBy(asc(planos.nome)),
    db.select().from(planoServicos),
    db
      .select({ id: profiles.id, nome: profiles.nome })
      .from(profiles)
      .where(eq(profiles.tipo, "cliente"))
      .orderBy(asc(profiles.nome)),
    db.select().from(servicos).where(eq(servicos.ativo, true)).orderBy(asc(servicos.nome)),
  ]);

  const assinantes = assinRows.map((r) => ({
    id: r.id,
    clienteId: r.clienteId,
    clienteNome: r.clienteNome,
    clienteEmail: r.clienteEmail,
    dataInicioISO: r.dataInicio.toISOString(),
    planoId: r.planoId,
    planoNome: r.planoNome,
    status: r.status,
  }));

  const planosCompletos = listaPlanos.map((p) => ({
    id: p.id,
    nome: p.nome,
    valor: p.valor,
    diasValidade: p.diasValidade,
    ativo: p.ativo,
    servicoIds: vinculos.filter((v) => v.planoId === p.id).map((v) => v.servicoId),
  }));

  const opcoesPlanos = planosCompletos
    .filter((p) => p.ativo)
    .map((p) => ({ id: p.id, nome: p.nome }));

  return (
    <div>
      <PageHeader
        title="Assinaturas"
        description="Clientes assinantes e planos da barbearia."
      />
      <AssinaturasTabs
        assinaturas={assinantes}
        clientes={clientes}
        opcoesPlanos={opcoesPlanos}
        planos={planosCompletos}
        servicos={listaServicos}
      />
    </div>
  );
}
