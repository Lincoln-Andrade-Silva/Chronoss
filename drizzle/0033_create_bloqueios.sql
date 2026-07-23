CREATE TABLE "bloqueios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"motivo" text NOT NULL,
	"dias" integer,
	"bloqueado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"desbloqueado_em" timestamp with time zone,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- FKs
ALTER TABLE "bloqueios"
  ADD CONSTRAINT "bloqueios_usuario_id_fk"
  FOREIGN KEY ("usuario_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "bloqueios"
  ADD CONSTRAINT "bloqueios_criado_por_id_fk"
  FOREIGN KEY ("criado_por_id") REFERENCES "profiles"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- Índice para o histórico por usuário.
CREATE INDEX "bloqueios_usuario_idx" ON "bloqueios" ("usuario_id");
--> statement-breakpoint

-- RLS: dados administrativos. Leitura/escrita só no servidor (role postgres, ignora RLS).
ALTER TABLE "bloqueios" ENABLE ROW LEVEL SECURITY;
