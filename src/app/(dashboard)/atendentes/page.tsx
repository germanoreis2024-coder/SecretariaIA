"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Bot, Power, PowerOff } from "lucide-react";
import type { Agent } from "@/types";

export default function AtendentesPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    personality: "",
    system_prompt: "",
  });
  const supabase = createClient();

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    const { data } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });
    setAgents(data || []);
    setLoading(false);
  }

  async function createAgent() {
    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) return;

    await supabase.from("agents").insert({
      org_id: member.org_id,
      name: newAgent.name,
      description: newAgent.description,
      personality: newAgent.personality,
      system_prompt: newAgent.system_prompt,
    });

    setDialogOpen(false);
    setNewAgent({ name: "", description: "", personality: "", system_prompt: "" });
    loadAgents();
  }

  async function toggleAgent(id: string, isActive: boolean) {
    await supabase.from("agents").update({ is_active: !isActive }).eq("id", id);
    loadAgents();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atendentes IA</h1>
          <p className="text-muted-foreground">
            Gerencie seus assistentes virtuais
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Atendente
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Atendente IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Maria - Atendente Comercial"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Breve descrição do atendente"
                  value={newAgent.description}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Personalidade</Label>
                <Input
                  placeholder="Ex: Simpática, profissional, usa linguagem formal"
                  value={newAgent.personality}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, personality: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Prompt de Sistema</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Instruções detalhadas para o atendente..."
                  value={newAgent.system_prompt}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, system_prompt: e.target.value })
                  }
                />
              </div>
              <Button onClick={createAgent} className="w-full">
                Criar Atendente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando...
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum atendente criado ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <Badge variant={agent.is_active ? "default" : "secondary"}>
                    {agent.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {agent.description || "Sem descrição"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Modelo: {agent.model} | Temp: {agent.temperature}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAgent(agent.id, agent.is_active)}
                >
                  {agent.is_active ? (
                    <PowerOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Power className="mr-2 h-4 w-4" />
                  )}
                  {agent.is_active ? "Desativar" : "Ativar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
