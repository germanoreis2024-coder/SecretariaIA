const DEFAULT_EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const DEFAULT_EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export interface EvolutionConfig {
  apiUrl?: string;
  apiKey?: string;
}

function getHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: apiKey,
  };
}

function apiUrl(config: EvolutionConfig, path: string): string {
  const base = config.apiUrl || DEFAULT_EVOLUTION_API_URL;
  return `${base}${path}`;
}

async function apiCall<T>(
  path: string,
  config: EvolutionConfig,
  options?: RequestInit
): Promise<T> {
  const key = config.apiKey || DEFAULT_EVOLUTION_API_KEY;
  const response = await fetch(apiUrl(config, path), {
    headers: getHeaders(key),
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error (${response.status}): ${error}`);
  }
  return response.json();
}

// --- Instance Management ---

export interface CreateInstanceParams {
  instanceName: string;
  integration?: "WHATSAPP-BAILEYS" | "WHATSAPP-CLOUD-API";
  qrcode?: boolean;
  reject_call?: boolean;
  always_online?: boolean;
  webhook?: {
    url: string;
    events: string[];
  };
}

export async function createInstance(params: CreateInstanceParams, config: EvolutionConfig = {}) {
  return apiCall("/instance/create", config, {
    method: "POST",
    body: JSON.stringify({
      instanceName: params.instanceName,
      integration: params.integration || "WHATSAPP-BAILEYS",
      qrcode: params.qrcode ?? true,
      reject_call: params.reject_call ?? false,
      always_online: params.always_online ?? true,
      ...(params.webhook && { webhook: params.webhook }),
    }),
  });
}

export async function fetchInstances(config: EvolutionConfig = {}) {
  return apiCall("/instance/fetchInstances", config);
}

export async function getInstanceStatus(instance: string, config: EvolutionConfig = {}) {
  return apiCall(`/instance/connectionState/${instance}`, config);
}

export async function getQRCode(instance: string, config: EvolutionConfig = {}) {
  return apiCall(`/instance/connect/${instance}`, config);
}

export async function disconnectInstance(instance: string, config: EvolutionConfig = {}) {
  return apiCall(`/instance/logout/${instance}`, config, { method: "DELETE" });
}

export async function deleteInstance(instance: string, config: EvolutionConfig = {}) {
  return apiCall(`/instance/delete/${instance}`, config, { method: "DELETE" });
}

// --- Webhook Management ---

export interface WebhookConfig {
  url: string;
  events: string[];
}

export async function setWebhook(instance: string, config: EvolutionConfig, webhook: WebhookConfig) {
  return apiCall(`/webhook/set/${instance}`, config, {
    method: "POST",
    body: JSON.stringify(webhook),
  });
}

export async function getWebhook(instance: string, config: EvolutionConfig = {}) {
  return apiCall(`/webhook/find/${instance}`, config);
}

// --- Messaging ---

export interface SendTextResponse {
  key: { remoteJid: string; fromMe: boolean; id: string };
  message: { conversation: string };
  status: string;
}

export async function sendTextMessage(instance: string, to: string, text: string, config: EvolutionConfig = {}): Promise<SendTextResponse> {
  return apiCall(`/message/sendText/${instance}`, config, {
    method: "POST",
    body: JSON.stringify({ number: to, text, delay: 1000 }),
  });
}

export async function sendTextReply(
  instance: string,
  to: string,
  text: string,
  replyToMessageId: string,
  config: EvolutionConfig = {}
) {
  return apiCall(`/message/sendText/${instance}`, config, {
    method: "POST",
    body: JSON.stringify({
      number: to,
      text,
      delay: 1000,
      quoted: { key: { id: replyToMessageId } },
    }),
  });
}

export async function markRead(instance: string, remoteJid: string, messageId: string, config: EvolutionConfig = {}) {
  return apiCall(`/message/sendRead/${instance}`, config, {
    method: "POST",
    body: JSON.stringify({
      remoteJid,
      id: messageId,
      fromMe: false,
    }),
  });
}

export async function sendPresence(instance: string, remoteJid: string, presence: "composing" | "recording" | "paused", config: EvolutionConfig = {}) {
  return apiCall(`/chat/sendPresence/${instance}`, config, {
    method: "POST",
    body: JSON.stringify({ remoteJid, presence }),
  });
}
