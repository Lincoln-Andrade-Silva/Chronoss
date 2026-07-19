import { CalendarCheck, CheckCircle2, CreditCard, Users, XCircle } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

const RESUMO = [
  { label: "Agendados", icon: CalendarCheck },
  { label: "Finalizados", icon: CheckCircle2 },
  { label: "Cancelados", icon: XCircle },
  { label: "Planos ativos", icon: CreditCard },
  { label: "Clientes", icon: Users },
];

export default function AdminHome() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da barbearia. Os números entram na fase de Dashboard."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {RESUMO.map(({ label, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-300">{label}</span>
              <Icon className="h-4 w-4 text-navy-300" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-navy-600">--</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <p className="text-sm text-navy-200">
          Autenticação e proteção de rotas por papel estão ativas. As telas dos módulos
          (agenda, financeiro, relatórios, etc.) entram nas próximas fases.
        </p>
      </Card>
    </div>
  );
}
