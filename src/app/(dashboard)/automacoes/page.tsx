"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Automation } from "@/types";

export default function AutomacoesPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAutomation, setNewAutomation] = useState({ name: "", type: "welcome" as Automation["type"] });
  const supabase = createClient();

  useEffect(() => {
    loadAutomations();
  }, []);

  async function loadAutomations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: member } = await supabase
      .from("org_members").select("org_id").eq("user_id", user.id).single();
    if (!member) { setLoading(false); return; }

    const { data } = await supabase
      .from("automations").select("*")
      .eq("org_id", member.org_id)
      .order("created_at", { ascending: false });
    setAutomations(data || []);
    setLoading(false);
  }

  async function createAutomation() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: member } = await supabase
      .from("org_members").select("org_id").eq("user_id", user.id).single();
    if (!member) return;

    await supabase.from("automations").insert({
      org_id: member.org_id,
      name: newAutomation.name,
      type: newAutomation.type,
    });
    setDialogOpen(false);
    setNewAutomation({ name: "", type: "welcome" });
    loadAutomations();
  }

  async function toggleAutomation(id: string, active: boolean) {
    await supabase.from("automations").update({ is_active: !active }).eq("id", id);
    loadAutomations();
  }

  async function deleteAutomation(id: string) {
    await supabase.from("automations").delete().eq("id", id);
    loadAutomations();
  }

  const typeLabels: Record<string, string> = {
    welcome: "Boas-vindas",
    follow_up: "Follow-up",
    schedule: "Agendada",
    custom: "Personalizada",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automações</h1>
          <p className="text-muted-foreground">Automatize respostas e fluxos de atendimento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Nova Automação
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Automação</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newAutomation.name} onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newAutomation.type} onValueChange={(v) => setNewAutomation({ ...newAutomation, type: v as Automation["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Mensagem de Boas-vindas</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="schedule">Agendada</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createAutomation} className="w-full">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : automations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma automação criada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {automations.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{a.name}</CardTitle>
                  <Badge variant={a.is_active ? "default" : "secondary"}>
                    {a.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Tipo: {typeLabels[a.type] || a.type}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleAutomation(a.id, a.is_active)}>
                    {a.is_active ? <PowerOff className="mr-1 h-4 w-4" /> : <Power className="mr-1 h-4 w-4" />}
                    {a.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteAutomation(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
