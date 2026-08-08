"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Check, CheckCheck, SendHorizontal, Sparkles } from "lucide-react"

type Message = {
  id: number
  from: "user" | "bot"
  text: string
}

const BOT_REPLIES = [
  "Olá! 👋 Sou a IA da AtendeIA. Como posso ajudar você hoje?",
  "Entendi! Vou verificar isso para você agora mesmo. Um momento... ⏳",
  "Perfeito! Já registrei seu pedido e um atendente humano será acionado se necessário. 🤝",
  "Fico feliz em ajudar! Tem mais alguma pergunta? 😊",
]

const QUICK_ACTIONS = ["Qual o horário de atendimento?", "Quero falar com um humano", "Fazer um orçamento"]

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "bot", text: BOT_REPLIES[0] },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [replyIndex, setReplyIndex] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: trimmed }])
    setInput("")
    setIsTyping(true)

    const reply = BOT_REPLIES[replyIndex % BOT_REPLIES.length]
    setReplyIndex((i) => i + 1)

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now(), from: "bot", text: reply }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="glass-card glow-purple w-full max-w-md rounded-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">
            <Bot className="h-5 w-5 text-white" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d1322] bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">AtendeIA Bot</p>
            <p className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online agora
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-violet-300">
          <Sparkles className="h-3 w-3" /> IA Ativa
        </span>
      </div>

      <div
        ref={scrollRef}
        className="mb-4 flex h-80 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120]/80 p-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`animate-message-in flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.from === "user"
                  ? "rounded-br-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                  : "rounded-bl-sm border border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {msg.text}
              {msg.from === "user" && (
                <span className="mt-1 flex justify-end gap-0.5 text-[10px] text-white/60">
                  <CheckCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="animate-message-in flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3.5 py-3">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => sendMessage(action)}
            className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:border-violet-500/60 hover:bg-violet-500/20"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage(input)
          }}
          placeholder="Digite sua mensagem..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          aria-label="Enviar mensagem"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-transform hover:scale-105"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Check className="h-3 w-3 text-emerald-400" />
        Respondendo instantaneamente com base no seu treinamento
      </p>
    </div>
  )
}
