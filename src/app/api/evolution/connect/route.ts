import { NextResponse } from "next/server";
import { createInstance, getQRCode, setWebhook } from "@/lib/evolution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instanceName, webhookUrl } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: "instanceName required" },
        { status: 400 }
      );
    }

    const result = await createInstance({
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      reject_call: true,
      always_online: true,
      ...(webhookUrl && {
        webhook: {
          url: webhookUrl,
          events: ["messages.upsert", "connection.update", "qrcode.updated"],
        },
      }),
    });

    let qrcode = null;
    try {
      const qrResult = await getQRCode(instanceName);
      qrcode = qrResult;
    } catch {
      // QR code may not be immediately available
    }

    return NextResponse.json({
      instance: result,
      qrcode,
    });
  } catch (error: any) {
    console.error("Evolution connect error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect" },
      { status: 500 }
    );
  }
}
