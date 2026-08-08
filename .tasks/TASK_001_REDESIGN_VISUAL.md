# TASK_001: Redesign Visual Moderno & Inovador (Dark SaaS / Glassmorphism)

## Objetivo
Transformar o visual da plataforma ATENDEIA (Landing Page, Layout do Dashboard e CSS global) em um design futurista, atraente e moderno de classe mundial, focado em Inteligência Artificial para WhatsApp.

## Estilo e Diretrizes de Design
- **Paleta de Cores**: Fundo Obsidian Dark (`#090d16` / `#050508`), detalhes em Violeta Neon (`#8b5cf6`), Fuchsia Glow (`#d946ef`) e Cyan Tech (`#06b6d4`).
- **Efeitos**: Glassmorphism (`backdrop-blur-md bg-white/[0.03] border border-white/10`), gradientes de texto, glow de fundo (`bg-violet-600/20 blur-3xl`).
- **Fontes & Ícones**: Uso de ícones `lucide-react` estilizados com badges de gradiente.

---

## 1. Alterações em `src/app/globals.css`
Adicionar classes utilitárias de Glassmorphism e gradientes no CSS global:

```css
@layer utilities {
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .glass-nav {
    background: rgba(9, 13, 22, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glow-purple {
    box-shadow: 0 0 50px -10px rgba(139, 92, 246, 0.3);
  }

  .gradient-text {
    background: linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

---

## 2. Alterações em `src/app/page.tsx` (Landing Page)
Reescrever a Landing Page para um layout Dark Futurista com:
- **Header Flutuante Glassmorphic**: Logo com ícone reluzente + Botões com efeitos hover.
- **Hero Section**:
  - Badge de IA com borda reluzente animada.
  - Título impactante com a classe `gradient-text`.
  - Simulador interativo do WhatsApp com IA (card no estilo WhatsApp Dark com mensagens instantâneas do robô respondendo a um cliente).
- **Cards de Funcionalidades**:
  - Utilizar a classe `glass-card` com efeitos hover de iluminação e borda violeta.
- **Cards de Preços**:
  - Destaque neon no plano Pro/Starter com selo "Mais Popular".

---

## 3. Alterações em `src/app/(dashboard)/layout.tsx` (Dashboard)
- Atualizar a Sidebar para o tema Dark com indicador de página ativa usando gradiente `bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border-l-2 border-violet-500 text-violet-300`.
- Fundo do conteúdo principal com tom suave obsidian `bg-[#090d16] text-slate-100`.

---

## Instruções de Compilação
Após fazer os ajustes nos arquivos acima, execute no terminal do projeto:
```bash
npm run build
```
Certifique-se de que o build concluiu sem erros!
