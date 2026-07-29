const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  };
}

function apiUrl(path: string): string {
  return `${EVOLUTION_API_URL}${path}`;
}

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: getHeaders(),
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

export async function createInstance(params: CreateInstanceParams) {
  return apiCall("/instance/create", {
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

export async function fetchInstances() {
  return apiCall("/instance/fetchInstances");
}

export async function getInstanceStatus(instance: string) {
  return apiCall(`/instance/connectionState/${instance}`);
}

export async function getQRCode(instance: string) {
  return apiCall(`/instance/connect/${instance}`);
}

export async function disconnectInstance(instance: string) {
  return apiCall(`/instance/logout/${instance}`, { method: "DELETE" });
}

export async function deleteInstance(instance: string) {
  return apiCall(`/instance/delete/${instance}`, { method: "DELETE" });
}

// --- Webhook Management ---

export interface WebhookConfig {
  url: string;
  events: string[];
}

export async function setWebhook(instance: string, config: WebhookConfig) {
  return apiCall(`/webhook/set/${instance}`, {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export async function getWebhook(instance: string) {
  return apiCall(`/webhook/find/${instance}`);
}

// --- Messaging ---

export interface SendTextResponse {
  key: { remoteJid: string; fromMe: boolean; id: string };
  message: { conversation: string };
  status: string;
}

export async function sendTextMessage(instance: string, to: string, text: string): Promise<SendTextResponse> {
  return apiCall(`/message/sendText/${instance}`, {
    method: "POST",
    body: JSON.stringify({ number: to, text, delay: 1000 }),
  });
}

export async function sendTextReply(
  instance: string,
  to: string,
  text: string,
  replyToMessageId: string
) {
  return apiCall(`/message/sendText/${instance}`, {
    method: "POST",
    body: JSON.stringify({
      number: to,
      text,
      delay: 1000,
      quoted: { key: { id: replyToMessageId } },
    }),
  });
}

export async function markRead(instance: string, remoteJid: string, messageId: string) {
  return apiCall(`/message/sendRead/${instance}`, {
    method: "POST",
    body: JSON.stringify({
      remoteJid,
      id: messageId,
      fromMe: false,
    }),
  });
}

export async function sendPresence(instance: string, remoteJid: string, presence: "composing" | "recording" | "paused") {
  return apiCall(`/chat/sendPresence/${instance}`, {
    method: "POST",
    body: JSON.stringify({ remoteJid, presence }),
  });
}
