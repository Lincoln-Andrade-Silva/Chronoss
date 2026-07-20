import { Suspense } from "react";
import { getBarbeariaBrand } from "@/lib/barbearia";
import { AuthPanel } from "@/features/auth/auth-panel";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const { nome, logoUrl } = await getBarbeariaBrand();
  const aviso =
    searchParams.erro === "inativo"
      ? "Seu acesso está inativo. Fale com a barbearia."
      : undefined;
  return (
    <Suspense fallback={null}>
      <AuthPanel defaultTab="login" nomeBarbearia={nome} logoUrl={logoUrl} aviso={aviso} />
    </Suspense>
  );
}
