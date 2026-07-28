import { Card, CardContent } from "@/components/ui/card";
import { Workflow } from "lucide-react";

export default function AutomacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automações</h1>
        <p className="text-muted-foreground">
          Crie fluxos automatizados de atendimento
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            O editor de automações está sendo desenvolvido. Você poderá criar
            fluxos de boas-vindas, follow-up e agendamento automaticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
