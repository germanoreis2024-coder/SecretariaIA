"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, MessageSquare, CheckCircle } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    conversations: 0,
    messages: 0,
    resolved: 0,
    satisfaction: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("org_members").select("org_id").eq("user_id", user.id).single();
    if (!member) return;

    const { count: conversations } = await supabase
      .from("conversations").select("*", { count: "exact", head: true }).eq("org_id", member.org_id);
    const { count: resolved } = await supabase
      .from("conversations").select("*", { count: "exact", head: true }).eq("org_id", member.org_id).eq("status", "resolved");
    const { count: messages } = await supabase
      .from("messages").select("*", { count: "exact", head: true });

    setStats({
      conversations: conversations || 0,
      messages: messages || 0,
      resolved: resolved || 0,
      satisfaction: 0,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Métricas e relatórios de atendimento</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Conversas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.conversations}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Mensagens</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.messages}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolvidas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.resolved}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Satisfação</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.satisfaction > 0 ? `${stats.satisfaction}%` : "—"}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Volume de Mensagens</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Gráfico disponível após primeiros atendimentos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sentimento dos Clientes</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Gráfico disponível após primeiros atendimentos
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
