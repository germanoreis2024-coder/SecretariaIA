"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, User } from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  contact_phone: string | null;
  contact_name: string | null;
  status: "open" | "resolved" | "pending";
  sentiment: "positive" | "neutral" | "negative" | null;
  updated_at: string;
  created_at: string;
  agents: { name: string } | null;
}

export default function MensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("conversations")
      .select("*, agents(name)")
      .eq("org_id", member.org_id)
      .order("updated_at", { ascending: false })
      .limit(50);

    setConversations((data as unknown as Conversation[]) || []);
    setLoading(false);
  }

  const statusColor: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    resolved: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground">Acompanhe as conversas em tempo real</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma conversa encontrada</p>
            <p className="text-sm text-muted-foreground">
              As conversas aparecerão aqui quando clientes interagirem com seus canais.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card key={conv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {conv.contact_name || conv.contact_phone || "Desconhecido"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {conv.contact_phone || "—"}
                      {conv.agents && (
                        <> · Atendente: {conv.agents.name}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {conv.sentiment && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {conv.sentiment === "positive" ? "😊" : conv.sentiment === "negative" ? "😞" : "😐"}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[conv.status] || ""}`}>
                    {conv.status === "open" ? "Aberta" : conv.status === "pending" ? "Pendente" : "Resolvida"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
