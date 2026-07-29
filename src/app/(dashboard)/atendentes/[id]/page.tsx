"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Brain,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";
import type { Agent, TrainingMessage } from "@/types";

export default function AgentTrainingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<TrainingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserMsg, setNewUserMsg] = useState("");
  const [newAssistantMsg, setNewAssistantMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    const [agentRes, msgRes] = await Promise.all([
      supabase.from("agents").select("*").eq("id", id).single(),
      supabase
        .from("training_messages")
        .select("*")
        .eq("agent_id", id)
        .order("created_at", { ascending: true }),
    ]);

    setAgent(agentRes.data);
    setMessages(msgRes.data || []);
    setLoading(false);
  }

  async function addTrainingPair() {
    if (!newUserMsg.trim() || !newAssistantMsg.trim()) return;
    setSaving(true);

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) return;

    const { error: err1 } = await supabase.from("training_messages").insert({
      org_id: member.org_id,
      agent_id: id,
      role: "user",
      content: newUserMsg.trim(),
    });

    const { error: err2 } = await supabase.from("training_messages").insert({
      org_id: member.org_id,
      agent_id: id,
      role: "assistant",
      content: newAssistantMsg.trim(),
    });

    if (!err1 && !err2) {
      setNewUserMsg("");
      setNewAssistantMsg("");
      loadData();
    }
    setSaving(false);
  }

  async function deleteMessage(messageId: string) {
    await supabase.from("training_messages").delete().eq("id", messageId);
    loadData();
  }

  const pairs: { user: TrainingMessage; assistant: TrainingMessage | null }[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({
        user: messages[i],
        assistant: messages[i + 1]?.role === "assistant" ? messages[i + 1] : null,
      });
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Carregando...</div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Atendente não encontrado</p>
        <Button onClick={() => router.push("/atendentes")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/atendentes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <Badge variant={agent.is_active ? "default" : "secondary"}>
              {agent.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {agent.model} | Temperatura: {agent.temperature} | Max tokens: {agent.max_tokens}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-violet-600" />
            Base de Conhecimento ({pairs.length} pares)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Nenhum treinamento ainda. Adicione pares de perguntas e respostas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pairs.map((pair, idx) => (
                <div key={pair.user.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <UserIcon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <p className="font-medium text-xs text-blue-600 mb-1">
                          Pergunta #{idx + 1}
                        </p>
                        <p className="whitespace-pre-wrap">{pair.user.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMessage(pair.user.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>

                  {pair.assistant && (
                    <div className="flex items-start gap-3 ml-4">
                      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-violet-50 rounded-lg px-3 py-2 text-sm">
                          <p className="font-medium text-xs text-violet-600 mb-1">
                            Resposta
                          </p>
                          <p className="whitespace-pre-wrap">{pair.assistant.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-6 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMessage(pair.assistant!.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Par de Treinamento
            </p>
            <div className="space-y-2">
              <Label>Pergunta do Cliente</Label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ex: Qual o horário de funcionamento?"
                value={newUserMsg}
                onChange={(e) => setNewUserMsg(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Resposta do Atendente</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ex: Nosso horário é segunda a sexta, das 8h às 18h."
                value={newAssistantMsg}
                onChange={(e) => setNewAssistantMsg(e.target.value)}
              />
            </div>
            <Button
              onClick={addTrainingPair}
              disabled={!newUserMsg.trim() || !newAssistantMsg.trim() || saving}
            >
              <Send className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
