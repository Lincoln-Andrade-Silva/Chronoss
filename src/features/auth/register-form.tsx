"use client";

import { useState } from "react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500";

export function RegisterForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, telefone, senha }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setErro(body?.error ?? "Não foi possível registrar.");
      setCarregando(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro("Conta criada, mas o login falhou. Tente entrar manualmente.");
      setCarregando(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nome completo" htmlFor="cad-nome">
        <div className="relative">
          <User className={iconClass} />
          <Input
            id="cad-nome"
            required
            placeholder="Seu nome"
            className="pl-10"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
      </Field>

      <Field label="Email" htmlFor="cad-email">
        <div className="relative">
          <Mail className={iconClass} />
          <Input
            id="cad-email"
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

      <Field label="WhatsApp / Telefone" htmlFor="cad-telefone">
        <div className="relative">
          <Phone className={iconClass} />
          <Input
            id="cad-telefone"
            type="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            className="pl-10"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
      </Field>

      <Field label="Senha" htmlFor="cad-senha" hint="(mín. 6 caracteres)">
        <div className="relative">
          <Lock className={iconClass} />
          <Input
            id="cad-senha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
      </Field>

      {erro && <FormError>{erro}</FormError>}

      <Button type="submit" disabled={carregando} className="w-full">
        {carregando ? "Criando conta..." : "Criar conta gratuita"}
      </Button>
    </form>
  );
}
