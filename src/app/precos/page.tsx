"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar",
    features: [
      "1 atendente IA",
      "1 canal WhatsApp",
      "100 mensagens/mês",
      "Treinamento básico",
    ],
    highlighted: false,
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "R$ 57",
    period: "/mês",
    description: "Para pequenos negócios",
    features: [
      "3 atendentes IA",
      "2 canais WhatsApp",
      "1.000 mensagens/mês",
      "Treinamento avançado",
      "Atalhos ilimitados",
      "Analytics básico",
    ],
    highlighted: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 157",
    period: "/mês",
    description: "Para empresas",
    features: [
      "10 atendentes IA",
      "5 canais WhatsApp",
      "Mensagens ilimitadas",
      "Treinamento avançado",
      "Atalhos ilimitados",
      "Analytics completo",
      "Automações avançadas",
      "Suporte prioritário",
    ],
    highlighted: false,
  },
];

export default function PrecosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubscribe(planId: string) {
    setLoading(planId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    const priceId =
      planId === "starter"
        ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      setLoading(null);
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm">
              🤖
            </div>
            <span className="text-xl font-bold">AtendeIA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Entrar
            </Link>
            <Link href="/register">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">Planos e Preços</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Simples e transparente
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Escolha o plano ideal para seu negócio. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-violet-600 shadow-lg shadow-violet-200 scale-105"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Mais Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {loading === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : plan.id === "free" ? (
                    "Começar Grátis"
                  ) : (
                    "Assinar Agora"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
