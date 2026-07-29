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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrg } from "@/lib/supabase/org-context";
import { Plug, Wifi, WifiOff, Plus, QrCode, Trash2, Loader2 } from "lucide-react";

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
  const [connecting, setConnecting] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pollInstance, setPollInstance] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", phone_number: "" });
  const [selectedInstance, setSelectedInstance] = useState("");
  const [existingInstances, setExistingInstances] = useState<string[]>([]);
  const supabase = createClient();
  const { org } = useOrg();
  const orgId = org?.id;

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (!pollInstance) return;
    const interval = setInterval(async () => {
      const status = await fetchInstanceStatus(pollInstance);
      if (status?.instance?.state === "open") {
        setPollInstance(null);
        setQrCode(null);
        setConnecting(null);
        await supabase
          .from("channels")
          .update({ is_active: true })
          .eq("evolution_instance_id", pollInstance);
        loadChannels();
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pollInstance]);

  async function loadChannels() {
    if (!orgId) return;
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setChannels(data || []);
    setLoading(false);
  }

  async function fetchInstancesFromAPI() {
    try {
      const res = await fetch("/api/evolution/instances");
      if (!res.ok) return [];
      const data = await res.json();
      return (data.instances || []).map((i: any) => i.instance.instanceName);
    } catch {
      return [];
    }
  }

  async function createChannel() {
    if (!orgId) return;

    const instanceName = `atendeia_${orgId.slice(0, 8)}_${Date.now().toString(36)}`;
    const webhookUrl = `${window.location.origin}/api/webhooks/evolution`;

    const res = await fetch("/api/evolution/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceName,
        webhookUrl,
      }),
    });

    if (!res.ok) {
      alert("Erro ao conectar Evolution API. Verifique se o servidor está rodando.");
      return;
    }

    const data = await res.json();

    await supabase.from("channels").insert({
      org_id: orgId,
      name: newChannel.name,
      phone_number: newChannel.phone_number || null,
      evolution_instance_id: instanceName,
      is_active: false,
    });

    if (data.qrcode?.code) {
      setQrCode(data.qrcode.code);
      setPollInstance(instanceName);
      setConnecting(instanceName);
    }

    setDialogOpen(false);
    setNewChannel({ name: "", phone_number: "" });
    loadChannels();
  }

  async function connectExisting(instanceName: string, channelId: string) {
    setConnecting(instanceName);
    const res = await fetch("/api/evolution/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.qrcode?.code) {
        setQrCode(data.qrcode.code);
        setPollInstance(instanceName);
        await supabase
          .from("channels")
          .update({ evolution_instance_id: instanceName })
          .eq("id", channelId);
      }
    }
  }

  async function fetchInstanceStatus(instanceName: string) {
    try {
      const res = await fetch(`/api/evolution/status?instance=${instanceName}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function disconnectChannel(channel: Channel) {
    if (channel.evolution_instance_id) {
      await fetch("/api/evolution/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: channel.evolution_instance_id }),
      });
    }
    await supabase
      .from("channels")
      .update({ is_active: false, evolution_instance_id: null })
      .eq("id", channel.id);
    loadChannels();
  }

  async function deleteChannel(channel: Channel) {
    if (channel.evolution_instance_id) {
      await fetch("/api/evolution/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: channel.evolution_instance_id }),
      });
    }
    await supabase.from("channels").delete().eq("id", channel.id);
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar WhatsApp</DialogTitle>
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
                Após criar, escaneie o QR Code com o WhatsApp para conectar.
              </p>
              <Button
                onClick={createChannel}
                className="w-full"
                disabled={!newChannel.name || connecting !== null}
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Criar Canal e Conectar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {qrCode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <QrCode className="h-10 w-10 mx-auto text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Escaneie o QR Code</h3>
                <p className="text-sm text-green-600">
                  Abra o WhatsApp no celular e escaneie o código abaixo
                </p>
              </div>
              <div className="inline-block bg-white p-4 rounded-xl shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                  alt="QR Code WhatsApp"
                  className="w-60 h-60 mx-auto"
                />
              </div>
              <p className="text-xs text-green-500 animate-pulse">
                Aguardando conexão...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            WhatsApp - Evolution API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              O Evolution API é um servidor self-hosted que gerencia a conexão
              com o WhatsApp.
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Instale o Docker Desktop no servidor</li>
              <li>Execute <code className="bg-muted px-1 rounded">docker compose up -d</code> na pasta raiz do projeto</li>
              <li>Configure <code className="bg-muted px-1 rounded">EVOLUTION_API_KEY</code> no .env.local</li>
              <li>Crie canais e escaneie o QR Code</li>
            </ol>
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
                        {channel.evolution_instance_id && (
                          <> · {channel.evolution_instance_id}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.is_active ? "default" : "secondary"}>
                      {channel.is_active ? "Conectado" : "Desconectado"}
                    </Badge>
                    {!channel.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectExisting(channel.evolution_instance_id || `channel_${channel.id}`, channel.id)}
                        disabled={connecting !== null}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Conectar
                      </Button>
                    )}
                    {channel.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectChannel(channel)}
                      >
                        Desconectar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChannel(channel)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
