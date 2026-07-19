import { Suspense } from "react";
import { AuthPanel } from "@/features/auth/auth-panel";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPanel defaultTab="login" />
    </Suspense>
  );
}
