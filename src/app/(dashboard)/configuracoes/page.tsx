"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/lib/supabase/org-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Building2, LogOut, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-gray-100 text-gray-700" },
  starter: { label: "Starter", color: "bg-violet-100 text-violet-700" },
  pro: { label: "Pro", color: "bg-amber-100 text-amber-700" },
};

function ConfiguracoesContent() {
  const { org, loading: orgLoading } = useOrg();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [success, setSuccess] = useState(searchParams.get("success") === "true");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (success) {
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [success]);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
    }
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName, company_name: companyName })
        .eq("id", user.id);
    }
    setSaving(false);
  }

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setPortalLoading(false);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const planInfo = planLabels[org?.plan || "free"] || planLabels.free;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil e assinatura</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5" />
          Assinatura ativada com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organização
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orgLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">{org?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">
                Slug: {org?.slug || "—"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano e Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={planInfo.color}>{planInfo.label}</Badge>
                {org?.subscription_status === "active" && (
                  <span className="text-xs text-green-600">Ativo</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {org?.plan === "free"
                  ? "Plano gratuito com funcionalidades básicas"
                  : org?.plan === "starter"
                  ? "Até 3 atendentes e 1.000 mensagens/mês"
                  : "Até 10 atendentes e mensagens ilimitadas"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {org?.plan === "free" ? (
                <Button onClick={() => router.push("/precos")}>
                  Fazer Upgrade
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={openPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Gerenciar
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium text-lg">
                {org?.plan === "pro" ? "∞" : org?.plan === "starter" ? "3" : "1"}
              </p>
              <p className="text-muted-foreground text-xs">Atendentes</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium text-lg">
                {org?.plan === "pro" ? "5" : org?.plan === "starter" ? "2" : "1"}
              </p>
              <p className="text-muted-foreground text-xs">Canais</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium text-lg">
                {org?.plan === "pro" ? "∞" : org?.plan === "starter" ? "1k" : "100"}
              </p>
              <p className="text-muted-foreground text-xs">Msg/mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Sair da conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>Sair</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Carregando...</div>}>
      <ConfiguracoesContent />
    </Suspense>
  );
}
