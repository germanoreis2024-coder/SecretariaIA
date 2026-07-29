"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    conversations_today: 0,
    messages_total: 0,
    agents_active: 0,
    channels_active: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;
    const orgId = member.org_id;

    const today = new Date().toISOString().split("T")[0];

    const { count: conversationsToday } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", today);

    const { count: messagesTotal } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    const { count: agentsActive } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("is_active", true);

    const { count: channelsActive } = await supabase
      .from("channels")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("is_active", true);

    setMetrics({
      conversations_today: conversationsToday || 0,
      messages_total: messagesTotal || 0,
      agents_active: agentsActive || 0,
      channels_active: channelsActive || 0,
    });

    const { data: recentConversations } = await supabase
      .from("conversations")
      .select("id, contact_name, contact_phone, status, sentiment, updated_at, agent_id, agents(name)")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(5);

    setRecent(recentConversations || []);
  }

  const stats = [
    {
      title: "Conversas Hoje",
      value: String(metrics.conversations_today),
      icon: MessageSquare,
      change: "hoje",
    },
    {
      title: "Atendentes Ativos",
      value: String(metrics.agents_active),
      icon: Users,
      change: "de " + String(metrics.agents_active) + " no total",
    },
    {
      title: "Canais Conectados",
      value: String(metrics.channels_active),
      icon: Clock,
      change: metrics.channels_active > 0 ? "ativo" : "nenhum",
    },
    {
      title: "Mensagens",
      value: String(metrics.messages_total),
      icon: TrendingUp,
      change: "total acumulado",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu atendimento</p>
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
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma conversa ainda.{" "}
              <Link href="/integracoes" className="text-violet-600 hover:underline">
                Conecte seu WhatsApp
              </Link>{" "}
              para começar.
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {conv.contact_name || conv.contact_phone || "Desconhecido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.agents?.name ? `Atendente: ${conv.agents.name}` : ""}
                    </p>
                  </div>
                  <span className="text-xs capitalize px-2 py-1 rounded-full bg-muted">
                    {conv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
