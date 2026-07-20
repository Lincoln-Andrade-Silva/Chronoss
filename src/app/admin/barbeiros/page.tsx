import { desc } from "drizzle-orm";
import { db } from "@/db";
import { barbeiros } from "@/db/schema";
import { PageHeader } from "@/components/ui";
import { BarbeirosClient } from "@/features/barbeiros/barbeiros-client";

export const dynamic = "force-dynamic";

export default async function BarbeirosPage() {
  const lista = await db.select().from(barbeiros).orderBy(desc(barbeiros.criadoEm));

  return (
    <div>
      <PageHeader title="Barbeiros" description="Gerencie a equipe de profissionais da barbearia." />
      <BarbeirosClient barbeiros={lista} />
    </div>
  );
}
