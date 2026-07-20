"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { agendamentos } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/** Ids do agendamento e, se fizer parte de um grupo (multi-serviço), de todo o grupo. */
async function idsAlvo(id: string): Promise<string[]> {
  const [row] = await db
    .select({ grupoId: agendamentos.grupoId })
    .from(agendamentos)
    .where(eq(agendamentos.id, id));
  if (!row) return [];
  if (!row.grupoId) return [id];
  const linhas = await db
    .select({ id: agendamentos.id })
    .from(agendamentos)
    .where(eq(agendamentos.grupoId, row.grupoId));
  return linhas.map((l) => l.id);
}

export async function finalizarAgendamento(id: string): Promise<void> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return;
  await db.update(agendamentos).set({ status: "finalizado" }).where(inArray(agendamentos.id, ids));
  revalidatePath("/admin/agenda");
}

export async function cancelarAgendamentoAdmin(id: string): Promise<void> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return;
  await db.update(agendamentos).set({ status: "cancelado" }).where(inArray(agendamentos.id, ids));
  revalidatePath("/admin/agenda");
}

export async function excluirAgendamento(id: string): Promise<void> {
  await requireAdmin();
  const ids = await idsAlvo(id);
  if (ids.length === 0) return;
  await db.delete(agendamentos).where(inArray(agendamentos.id, ids));
  revalidatePath("/admin/agenda");
}
