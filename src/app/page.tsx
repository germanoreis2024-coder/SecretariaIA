import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppSimulator } from "@/components/landing/whatsapp-simulator";
import {
  Bot,
  Brain,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  Sparkles,
  Quote,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Atendentes IA",
    description:
      "Crie múltiplos atendentes com personalidades diferentes para cada necessidade do seu negócio.",
  },
  {
    icon: Brain,
    title: "Treinamento Personalizado",
    description:
      "Ensine sua IA com exemplos reais de atendimento para respostas mais precisas.",
  },
  {
    icon: Zap,
    title: "Respostas Instantâneas",
    description:
      "Tempo de resposta em menos de 2 segundos. Seus clientes não precisam esperar.",
  },
  {
    icon: Shield,
    title: "Sentimento Inteligente",
    description:
      "A IA detecta o sentimento do cliente e adapta a abordagem automaticamente.",
  },
  {
    icon: Clock,
    title: "24/7 Disponível",
    description:
      "Atendimento automatizado que nunca dorme. Atenda seus clientes a qualquer hora.",
  },
  {
    icon: BarChart3,
    title: "Analytics Completo",
    description:
      "Relatórios detalhados de performance, satisfação e volume de atendimentos.",
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    features: ["100 mensagens/mês", "1 atendente IA", "1 canal WhatsApp"],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "R$ 57",
    period: "/mês",
    features: [
      "1.000 mensagens/mês",
      "3 atendentes IA",
      "2 canais WhatsApp",
      "Automações",
      "Analytics básico",
    ],
    cta: "Assinar Starter",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "R$ 157",
    period: "/mês",
    features: [
      "Mensagens ilimitadas",
      "10 atendentes IA",
      "5 canais WhatsApp",
      "Automações avançadas",
      "Analytics completo",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#050508] text-slate-100">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Header flutuante */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-600/30 transition-shadow group-hover:shadow-violet-500/50">
              <Bot className="h-5 w-5 text-white" />
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-0 blur-md transition-opacity group-hover:opacity-60" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Atende<span className="gradient-text">IA</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30 transition-all hover:shadow-violet-500/50">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="container mx-auto grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="animate-glow-pulse mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
              <Sparkles className="h-4 w-4" />
              Powered by Inteligência Artificial
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              Seu atendimento via WhatsApp,{" "}
              <span className="gradient-text">
                automatizado com IA
              </span>
            </h1>
            <p className="mb-8 text-lg text-slate-400 md:text-xl">
              Respostas instantâneas e personalizadas para seus clientes.
              24 horas por dia, 7 dias por semana, sem precisar de equipe humana.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-base shadow-xl shadow-violet-600/40 transition-all hover:shadow-violet-500/60"
                >
                  Teste 7 Dias Grátis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 px-8 text-base text-slate-200 backdrop-blur-md transition-colors hover:border-violet-500/50 hover:bg-white/10 hover:text-white"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <WhatsAppSimulator />
          </div>
        </div>
      </section>

      {/* Depoimento rápido */}
      <section className="relative px-4 py-10">
        <div className="container mx-auto max-w-3xl">
          <div className="glass-card glow-purple rounded-3xl p-8 text-center">
            <Quote className="mx-auto mb-4 h-8 w-8 text-violet-400" />
            <p className="text-lg font-medium leading-relaxed text-slate-200 md:text-xl">
              Reduzimos nosso tempo de resposta de{" "}
              <span className="gradient-text font-semibold">45 minutos para 3 segundos</span>.
              A AtendeIA transformou completamente nosso atendimento.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              — Equipe Comercial, Loja Exemplo
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-300">
              Funcionalidades
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Tudo que você precisa para{" "}
              <span className="gradient-text">automatizar</span>
            </h2>
            <p className="text-lg text-slate-400">
              Ferramentas poderosas para transformar seu atendimento
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card glow-card-hover group rounded-2xl p-6"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 ring-1 ring-violet-500/30 transition-colors group-hover:from-violet-600/40 group-hover:to-fuchsia-600/40">
                  <feature.icon className="h-6 w-6 text-violet-300" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet-300">
              Planos
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Planos simples e{" "}
              <span className="gradient-text">transparentes</span>
            </h2>
            <p className="text-lg text-slate-400">
              Comece grátis, escale quando precisar
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 backdrop-blur-md ${
                  plan.highlighted
                    ? "glow-purple border-violet-500/60 bg-violet-600/10 ring-1 ring-violet-500/40"
                    : "glass-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-600/40">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-100">
                  {plan.name}
                </h3>
                <div className="mb-6 mt-2">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 ring-1 ring-violet-500/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/50"
                        : "border-white/15 bg-white/5 text-slate-200 hover:border-violet-500/50 hover:bg-white/10 hover:text-white"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="glass-card glow-purple relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
            <h2 className="relative mb-4 text-3xl font-bold md:text-4xl">
              Pronto para{" "}
              <span className="gradient-text">transformar seu atendimento?</span>
            </h2>
            <p className="relative mb-8 text-lg text-slate-400">
              Comece hoje mesmo com 7 dias grátis. Sem cartão de crédito.
            </p>
            <Link href="/register" className="relative inline-block">
              <Button
                size="lg"
                className="group rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 text-base shadow-xl shadow-violet-600/40 transition-all hover:shadow-violet-500/60"
              >
                Começar Grátis Agora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-4 py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-300">
              Atende<span className="gradient-text">IA</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="transition-colors hover:text-slate-300">
              Entrar
            </Link>
            <Link href="/precos" className="transition-colors hover:text-slate-300">
              Preços
            </Link>
            <Link href="/register" className="transition-colors hover:text-slate-300">
              Criar conta
            </Link>
          </div>
          <p>© 2026 AtendeIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
