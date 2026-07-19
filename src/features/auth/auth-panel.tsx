"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

type Tab = "login" | "cadastro";

export function AuthPanel({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <Card className="p-6 sm:p-8">
      {/* Marca no mobile (hero fica escondido) */}
      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-500 text-sm font-bold text-white">
          CB
        </div>
        <div className="leading-tight">
          <p className="font-semibold">Cronos Barber</p>
          <p className="text-xs text-navy-400">Sistema de Agendamento</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo</h2>
      <p className="mt-1 text-sm text-navy-300">Acesse sua conta ou crie uma nova.</p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-navy-800 bg-navy-950/60 p-1">
        {(["login", "cadastro"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              tab === value
                ? "bg-navy-500 text-white shadow"
                : "text-navy-300 hover:text-navy-100",
            )}
          >
            {value === "login" ? "Entrar" : "Cadastrar"}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "login" ? <LoginForm /> : <RegisterForm />}</div>
    </Card>
  );
}
