import { GoogleGenAI } from "@google/genai";

let _genai: GoogleGenAI | null = null;
let _genaiKey: string | undefined;

function getGenAI(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY não configurada. Defina no .env.local ou nas configurações.");
  }
  if (!_genai || _genaiKey !== key) {
    _genai = new GoogleGenAI({ apiKey: key });
    _genaiKey = key;
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
    apiKey?: string;
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

  const response = await getGenAI(options?.apiKey).models.generateContent({
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

export async function analyzeSentiment(
  text: string,
  apiKey?: string
): Promise<"positive" | "neutral" | "negative"> {
  const response = await getGenAI(apiKey).models.generateContent({
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
