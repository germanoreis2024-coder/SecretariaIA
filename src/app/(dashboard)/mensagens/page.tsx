import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, BarChart3, Workflow } from "lucide-react";
import Link from "next/link";

export default function MensagensPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground">
          Treine seus atendentes com exemplos de mensagens
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/atendentes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <CardTitle className="text-lg">Atendentes IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie seus atendentes virtuais
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/atalhos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Atalhos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Respostas rápidas com gatilhos personalizados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/automacoes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Automações</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fluxos automatizados de atendimento
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Relatórios e métricas de atendimento
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
