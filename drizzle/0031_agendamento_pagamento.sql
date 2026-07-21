ALTER TYPE "status_agendamento" ADD VALUE IF NOT EXISTS 'estornado';--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "forma_pagamento" text DEFAULT 'presencial' NOT NULL;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "pagamento_status" text DEFAULT 'a_receber' NOT NULL;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "gateway_pagamento_id" text;