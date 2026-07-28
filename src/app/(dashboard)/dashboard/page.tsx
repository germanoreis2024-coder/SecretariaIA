import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Conversas Hoje",
    value: "0",
    icon: MessageSquare,
    change: "+0%",
  },
  {
    title: "Mensagens Enviadas",
    value: "0",
    icon: Users,
    change: "+0%",
  },
  {
    title: "Tempo Médio Resposta",
    value: "0s",
    icon: Clock,
    change: "-0%",
  },
  {
    title: "Taxa de Satisfação",
    value: "0%",
    icon: TrendingUp,
    change: "+0%",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu atendimento
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} vs ontem
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Gráfico de mensagens aparecerá aqui
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sentimento dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Gráfico de sentimento aparecerá aqui
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma conversa ainda. Conecte seu WhatsApp para começar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
