"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500";

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("Email ou senha inválidos.");
      setCarregando(false);
      return;
    }

    // Navegacao completa para o middleware enxergar a sessao nos cookies.
    window.location.href = params.get("redirect") || "/";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="login-email">
        <div className="relative">
          <Mail className={iconClass} />
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </Field>

      <Field label="Senha" htmlFor="login-senha">
        <div className="relative">
          <Lock className={iconClass} />
          <Input
            id="login-senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
      </Field>

      {erro && <FormError>{erro}</FormError>}

      <Button type="submit" disabled={carregando} className="w-full">
        {carregando ? "Entrando..." : "Entrar na conta"}
      </Button>
    </form>
  );
}
