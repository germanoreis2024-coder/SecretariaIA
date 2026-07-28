const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  };
}

export interface SendTextParams {
  instance: string;
  to: string;
  text: string;
}

export interface SendTextResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation: string;
  };
  status: string;
}

export async function sendTextMessage({
  instance,
  to,
  text,
}: SendTextParams): Promise<SendTextResponse> {
  const response = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/${instance}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        number: to,
        text,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${error}`);
  }

  return response.json();
}

export interface CreateInstanceParams {
  instanceName: string;
  integration: "WHATSAPP-BAILEYS" | "WHATSAPP-CLOUD-API";
  qrcode?: boolean;
  reject_call?: boolean;
  always_online?: boolean;
  webhook?: {
    url: string;
    events: string[];
  };
}

export async function createInstance(params: CreateInstanceParams) {
  const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${error}`);
  }

  return response.json();
}

export async function getInstanceStatus(instance: string) {
  const response = await fetch(
    `${EVOLUTION_API_URL}/instance/connectionState/${instance}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${error}`);
  }

  return response.json();
}

export async function getQRCode(instance: string) {
  const response = await fetch(
    `${EVOLUTION_API_URL}/instance/connect/${instance}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${error}`);
  }

  return response.json();
}
