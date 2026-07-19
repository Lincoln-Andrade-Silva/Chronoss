import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Singleton de conexão: evita esgotar o pool no hot-reload do Next em dev.
// prepare:false é recomendado ao usar a Transaction Pooler do Supabase.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const client = globalForDb.__pgClient ?? postgres(env.DATABASE_URL, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.__pgClient = client;

export const db = drizzle(client, { schema });
export { client };
