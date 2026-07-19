import { Suspense } from "react";
import { AuthPanel } from "@/features/auth/auth-panel";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPanel defaultTab="cadastro" />
    </Suspense>
  );
}
