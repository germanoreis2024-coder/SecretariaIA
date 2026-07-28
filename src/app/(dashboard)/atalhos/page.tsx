"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Zap, Trash2 } from "lucide-react";
import type { Shortcut } from "@/types";

export default function AtalhosPage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ trigger: "", response: "" });
  const supabase = createClient();

  useEffect(() => {
    loadShortcuts();
  }, []);

  async function loadShortcuts() {
    const { data } = await supabase
      .from("shortcuts")
      .select("*")
      .order("created_at", { ascending: false });
    setShortcuts(data || []);
    setLoading(false);
  }

  async function createShortcut() {
    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!member) return;

    await supabase.from("shortcuts").insert({
      org_id: member.org_id,
      trigger: newShortcut.trigger,
      response: newShortcut.response,
    });

    setDialogOpen(false);
    setNewShortcut({ trigger: "", response: "" });
    loadShortcuts();
  }

  async function deleteShortcut(id: string) {
    await supabase.from("shortcuts").delete().eq("id", id);
    loadShortcuts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atalhos</h1>
          <p className="text-muted-foreground">
            Respostas rápidas com gatilhos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Atalho
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Atalho</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Gatilho</Label>
                <Input
                  placeholder="Ex: /obrigado"
                  value={newShortcut.trigger}
                  onChange={(e) =>
                    setNewShortcut({ ...newShortcut, trigger: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Resposta</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Resposta que será enviada..."
                  value={newShortcut.response}
                  onChange={(e) =>
                    setNewShortcut({ ...newShortcut, response: e.target.value })
                  }
                />
              </div>
              <Button onClick={createShortcut} className="w-full">
                Criar Atalho
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : shortcuts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum atalho criado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <Card key={shortcut.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {shortcut.trigger}
                  </code>
                  <span className="text-muted-foreground mx-3">→</span>
                  <span className="text-sm">{shortcut.response}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteShortcut(shortcut.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
