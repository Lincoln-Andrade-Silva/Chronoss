import { CalendarCheck, History, UserCog } from "lucide-react";

const FEATURES = [
  { icon: CalendarCheck, text: "Agendamento online sem conflitos de horário" },
  { icon: UserCog, text: "Painel exclusivo para cada tipo de usuário" },
  { icon: History, text: "Histórico completo de atendimentos" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Hero: visivel apenas em telas grandes */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-950 to-black" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-navy-600/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-500 font-bold tracking-tight text-white">
            CB
          </div>
          <span className="text-lg font-semibold tracking-tight">Cronos Barber</span>
        </div>

        <div className="relative space-y-7">
          <span className="inline-flex items-center rounded-full border border-navy-700 bg-navy-800/60 px-3 py-1 text-xs font-medium tracking-wide text-navy-200">
            Sistema de Agendamento
          </span>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
            A arte do
            <br />
            corte <span className="text-navy-300">perfeito.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-navy-300">
            Gerencie agendamentos com elegância. Para clientes, barbeiros e administradores,
            em um só lugar.
          </p>
          <ul className="space-y-4 pt-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-navy-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-700 bg-navy-800/60 text-navy-200">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-navy-500">
          {new Date().getFullYear()} Cronos Barber. Todos os direitos reservados.
        </p>
      </aside>

      {/* Card de autenticacao */}
      <main className="relative flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-navy-500/10 blur-3xl" />
        <div className="relative w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
