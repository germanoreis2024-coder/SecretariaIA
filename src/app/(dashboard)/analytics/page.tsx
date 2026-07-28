import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Relatórios e métricas de atendimento
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sem dados ainda</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Conecte seu WhatsApp e receba mensagens para começar a visualizar
            métricas detalhadas de atendimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
