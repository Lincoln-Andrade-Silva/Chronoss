-- FKs
ALTER TABLE "plano_servicos"
  ADD CONSTRAINT "plano_servicos_plano_id_fk"
  FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "plano_servicos"
  ADD CONSTRAINT "plano_servicos_servico_id_fk"
  FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "assinaturas"
  ADD CONSTRAINT "assinaturas_cliente_id_fk"
  FOREIGN KEY ("cliente_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "assinaturas"
  ADD CONSTRAINT "assinaturas_plano_id_fk"
  FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE RESTRICT;
--> statement-breakpoint

-- RLS: catálogo de planos legível por autenticados; escrita só no servidor.
ALTER TABLE "planos" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
GRANT SELECT ON "planos" TO authenticated;
--> statement-breakpoint
CREATE POLICY "planos_select_authenticated" ON "planos"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint

ALTER TABLE "plano_servicos" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
GRANT SELECT ON "plano_servicos" TO authenticated;
--> statement-breakpoint
CREATE POLICY "plano_servicos_select_authenticated" ON "plano_servicos"
  FOR SELECT TO authenticated USING (true);
--> statement-breakpoint

-- Assinaturas: cliente enxerga apenas as próprias; escrita só no servidor.
ALTER TABLE "assinaturas" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
GRANT SELECT ON "assinaturas" TO authenticated;
--> statement-breakpoint
CREATE POLICY "assinaturas_select_own" ON "assinaturas"
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = "cliente_id");
