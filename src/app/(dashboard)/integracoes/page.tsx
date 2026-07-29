"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plug, Wifi, WifiOff, Plus } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  phone_number: string | null;
  is_active: boolean;
  evolution_instance_id: string | null;
}

export default function IntegracoesPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", phone_number: "" });
  const supabase = createClient();

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    const { data } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });
    setChannels(data || []);
    setLoading(false);
  }

  async function createChannel() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;

    await supabase.from("channels").insert({
      org_id: member.org_id,
      name: newChannel.name,
      phone_number: newChannel.phone_number || null,
      is_active: false,
    });

    setDialogOpen(false);
    setNewChannel({ name: "", phone_number: "" });
    loadChannels();
  }

  async function deleteChannel(id: string) {
    await supabase.from("channels").delete().eq("id", id);
    loadChannels();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrações</h1>
          <p className="text-muted-foreground">Conecte seus canais de atendimento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Canal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Canal WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do canal</Label>
                <Input
                  placeholder="Ex: Comercial, Suporte, Vendas"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número de telefone (opcional)</Label>
                <Input
                  placeholder="+5511999999999"
                  value={newChannel.phone_number}
                  onChange={(e) => setNewChannel({ ...newChannel, phone_number: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Após criar, conecte via Evolution API na seção abaixo.
              </p>
              <Button onClick={createChannel} className="w-full">Adicionar Canal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Conecte sua conta WhatsApp via Evolution API
              </p>
            </div>
            <Button disabled>
              <Plug className="mr-2 h-4 w-4" />
              Configurar Evolution API (em breve)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Canais Cadastrados</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum canal cadastrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    {channel.is_active ? (
                      <Wifi className="h-5 w-5 text-green-500" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.phone_number || "Sem número"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.is_active ? "default" : "secondary"}>
                      {channel.is_active ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => deleteChannel(channel.id)}>
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
