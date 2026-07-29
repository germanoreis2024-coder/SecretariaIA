"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Bot,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import type { Agent, Channel } from "@/types";

interface AgentWithChannel extends Agent {
  channels: { name: string } | null;
}

const MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Rápido)" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Balanceado)" },
  { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro (Máxima qualidade)" },
];

const defaultPrompt = `Você é um atendente virtual prestativo e simpático.
Sempre responda em português brasileiro de forma clara e educada.
Use as informações do treinamento para responder com precisão.
Se não souber responder, peça desculpas e ofereça ajuda humana.`;

export default function AtendentesPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentWithChannel[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    personality: "",
    system_prompt: defaultPrompt,
    model: "gemini-2.0-flash",
    temperature: 0.7,
    max_tokens: 1000,
    channel_id: "",
    fallback_message: "",
  });
  const supabase = createClient();

  useEffect(() => {
    Promise.all([loadAgents(), loadChannels()]);
  }, []);

  async function loadAgents() {
    const { data } = await supabase
      .from("agents")
      .select("*, channels(name)")
      .order("created_at", { ascending: false });
    setAgents((data as AgentWithChannel[]) || []);
    setLoading(false);
  }

  async function loadChannels() {
    const { data } = await supabase
      .from("channels")
      .select("id, name, phone_number, org_id, type, evolution_instance_id, is_active, created_at")
      .eq("is_active", true);
    setChannels((data as Channel[]) || []);
  }

  function openCreate() {
    setEditingAgent(null);
    setForm({
      name: "",
      description: "",
      personality: "",
      system_prompt: defaultPrompt,
      model: "gemini-2.0-flash",
      temperature: 0.7,
      max_tokens: 1000,
      channel_id: "",
      fallback_message: "",
    });
    setDialogOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent);
    setForm({
      name: agent.name,
      description: agent.description || "",
      personality: agent.personality || "",
      system_prompt: agent.system_prompt || defaultPrompt,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      channel_id: agent.channel_id || "",
      fallback_message: agent.fallback_message || "",
    });
    setDialogOpen(true);
  }

  async function saveAgent() {
    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) return;

    const payload = {
      name: form.name,
      description: form.description || null,
      personality: form.personality || null,
      system_prompt: form.system_prompt || null,
      model: form.model,
      temperature: form.temperature,
      max_tokens: form.max_tokens,
      channel_id: form.channel_id || null,
      fallback_message: form.fallback_message || null,
    };

    if (editingAgent) {
      await supabase.from("agents").update(payload).eq("id", editingAgent.id);
    } else {
      await supabase.from("agents").insert({
        ...payload,
        org_id: member.org_id,
      });
    }

    setDialogOpen(false);
    setEditingAgent(null);
    loadAgents();
  }

  async function toggleAgent(id: string, isActive: boolean) {
    await supabase.from("agents").update({ is_active: !isActive }).eq("id", id);
    loadAgents();
  }

  async function deleteAgent(id: string) {
    await supabase.from("agents").delete().eq("id", id);
    setDeleteConfirm(null);
    loadAgents();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atendentes IA</h1>
          <p className="text-muted-foreground">
            Gerencie seus assistentes virtuais com IA
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Atendente
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">Nenhum atendente criado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu primeiro atendente IA para começar a automatizar
            </p>
            <Button onClick={openCreate}>Criar Atendente</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{agent.model}</p>
                    </div>
                  </div>
                  <Badge variant={agent.is_active ? "default" : "secondary"}>
                    {agent.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {agent.description || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>Temp: {agent.temperature}</span>
                  <span>Max: {agent.max_tokens}</span>
                  {agent.channels?.name && <span>Canal: {agent.channels.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAgent(agent.id, agent.is_active)}
                  >
                    {agent.is_active ? (
                      <PowerOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Power className="mr-1 h-3 w-3" />
                    )}
                    {agent.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(agent)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/atendentes/${agent.id}`)}
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Treinar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(agent.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? "Editar Atendente" : "Criar Atendente IA"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Maria - Atendente Comercial"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Breve descrição do atendente"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Personalidade</Label>
              <Input
                placeholder="Ex: Simpática, profissional, usa linguagem formal"
                value={form.personality}
                onChange={(e) => setForm({ ...form, personality: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Modelo de IA</Label>
              <Select
                value={form.model}
                onValueChange={(v) => setForm({ ...form, model: v ?? form.model })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperatura: {form.temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={form.temperature}
                  onChange={(e) =>
                    setForm({ ...form, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Preciso (0)</span>
                  <span>Criativo (2)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  min={100}
                  max={8000}
                  step={100}
                  value={form.max_tokens}
                  onChange={(e) =>
                    setForm({ ...form, max_tokens: parseInt(e.target.value) || 1000 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Canal WhatsApp (opcional)</Label>
              <Select
                value={form.channel_id}
                onValueChange={(v) => setForm({ ...form, channel_id: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum canal</SelectItem>
                  {channels.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name} {ch.phone_number ? `(${ch.phone_number})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prompt de Sistema</Label>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                placeholder="Instruções detalhadas para o atendente..."
                value={form.system_prompt}
                onChange={(e) =>
                  setForm({ ...form, system_prompt: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem de Fallback (quando não souber responder)</Label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Desculpe, não entendi. Vou transferir para um atendente humano."
                value={form.fallback_message}
                onChange={(e) =>
                  setForm({ ...form, fallback_message: e.target.value })
                }
              />
            </div>

            <Button onClick={saveAgent} className="w-full">
              {editingAgent ? "Salvar Alterações" : "Criar Atendente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Atendente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza? O treinamento associado também será removido.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteAgent(deleteConfirm)}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
