import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { integracoesPagamento, type IntegracaoPagamento } from "@/db/schema";

/** Config do gateway (linha única). Server-only — nunca expor o access_token no client. */
export async function getIntegracaoPagamento(): Promise<IntegracaoPagamento | null> {
  const [row] = await db
    .select()
    .from(integracoesPagamento)
    .where(eq(integracoesPagamento.id, 1));
  return row ?? null;
}

export async function getMpAccessToken(): Promise<string | null> {
  const cfg = await getIntegracaoPagamento();
  return cfg?.accessToken ?? null;
}

/** URL pública base usada em checkout/webhook. Config > env > headers da requisição. */
export async function getBaseUrl(): Promise<string> {
  const cfg = await getIntegracaoPagamento();
  if (cfg?.siteUrl) return cfg.siteUrl;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
