import { GoogleGenAI } from "@google/genai";

let _genai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }
  return _genai;
}

function textPart(text: string) {
  return [{ text }];
}

export async function generateResponse(
  systemPrompt: string,
  trainingMessages: { role: string; content: string }[],
  conversationHistory: { role: string; content: string }[],
  userMessage: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const model = options?.model || "gemini-2.0-flash";
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 1000;

  const contents: { role: string; parts: { text: string }[] }[] = [];

  for (const msg of trainingMessages) {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: textPart(msg.content),
    });
  }

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: textPart(msg.content),
    });
  }

  contents.push({
    role: "user",
    parts: textPart(userMessage),
  });

  const response = await getGenAI().models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  return response.text ?? "";
}

export async function analyzeSentiment(text: string): Promise<"positive" | "neutral" | "negative"> {
  const response = await getGenAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: textPart(`Analise o sentimento desta mensagem e responda APENAS com uma palavra: "positive", "neutral" ou "negative".\n\nMensagem: "${text}"`) }],
    config: {
      temperature: 0,
      maxOutputTokens: 10,
    },
  });

  const result = response.text?.toLowerCase().trim() || "neutral";

  if (result.includes("positive")) return "positive";
  if (result.includes("negative")) return "negative";
  return "neutral";
}
