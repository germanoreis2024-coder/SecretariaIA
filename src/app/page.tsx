import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, Shield, Clock, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm">
              🤖
            </div>
            AtendeIA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Bot className="h-4 w-4" />
            Powered by Inteligência Artificial
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Seu atendimento via WhatsApp,{" "}
            <span className="text-violet-600">automatizado com IA</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Respostas instantâneas e personalizadas para seus clientes.
            24 horas por dia, 7 dias por semana, sem precisar de equipe humana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Teste 7 Dias Grátis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Tudo que você precisa para automatizar
            </h2>
            <p className="text-muted-foreground text-lg">
              Ferramentas poderosas para transformar seu atendimento
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "Atendentes IA",
                description:
                  "Crie múltiplos atendentes com personalidades diferentes para cada necessidade do seu negócio.",
              },
              {
                icon: MessageSquare,
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
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis, escale quando precisar
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
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
                price: "R$ 97",
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
                price: "R$ 297",
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
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 border ${
                  plan.highlighted
                    ? "border-violet-500 shadow-lg ring-2 ring-violet-500"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-medium text-violet-600 mb-2">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-4 w-4 text-violet-600 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className="w-full"
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

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2026 AtendeIA. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
