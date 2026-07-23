ALTER TABLE "profiles" ADD COLUMN "bloqueado_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bloqueio_dias" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bloqueio_motivo" text;