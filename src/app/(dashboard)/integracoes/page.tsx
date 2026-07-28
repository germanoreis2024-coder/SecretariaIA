"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, QrCode, Wifi, WifiOff } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte seus canais de atendimento
        </p>
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
            <Button>
              <Plug className="mr-2 h-4 w-4" />
              Conectar WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Canais Conectados</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum canal conectado ainda
              </p>
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
                  <Badge variant={channel.is_active ? "default" : "secondary"}>
                    {channel.is_active ? "Conectado" : "Desconectado"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
