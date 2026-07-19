"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { LogoutButton } from "@/features/auth/logout-button";
import { cn } from "@/lib/cn";

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-navy-800 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-500 text-sm font-bold text-white">
        CB
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Cronos Barber</p>
        <p className="text-xs text-navy-400">Painel Admin</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        if (!item.ready) {
          return (
            <div
              key={item.label}
              title="Em breve"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-500"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-navy-600">
                em breve
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-navy-500 text-white"
                : "text-navy-200 hover:bg-navy-800/70 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ nome }: { nome: string }) {
  return (
    <div className="border-t border-navy-800 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-navy-50">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{nome}</p>
          <p className="text-xs text-navy-400">Administrador</p>
        </div>
      </div>
      <div className="mt-3">
        <LogoutButton />
      </div>
    </div>
  );
}

export function AdminShell({ nome, children }: { nome: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-navy-800 bg-navy-900 lg:flex">
        <Brand />
        <NavList />
        <UserFooter nome={nome} />
      </aside>

      {/* Topbar (mobile) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-navy-800 bg-navy-900/80 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-navy-200 transition hover:bg-navy-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-500 text-xs font-bold text-white">
            CB
          </div>
          <span className="text-sm font-semibold">Cronos Barber</span>
        </div>
      </header>

      {/* Drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-navy-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pr-2">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-navy-300 transition hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <UserFooter nome={nome} />
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
