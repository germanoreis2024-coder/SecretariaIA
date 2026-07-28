import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTextMessage } from "@/lib/evolution";

interface EvolutionWebhookBody {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text?: string;
      };
    };
  };
}

export async function POST(request: Request) {
  try {
    const body: EvolutionWebhookBody = await request.json();
    const { event, instance, data } = body;

    // Only process incoming text messages
    if (event !== "messages.upsert" || data.key.fromMe) {
      return NextResponse.json({ ok: true });
    }

    const messageText =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      "";

    if (!messageText) {
      return NextResponse.json({ ok: true });
    }

    const supabase = await createClient();

    // Find the channel by evolution instance ID
    const { data: channel } = await supabase
      .from("channels")
      .select("*, organizations(*)")
      .eq("evolution_instance_id", instance)
      .single();

    if (!channel) {
      console.error(`Channel not found for instance: ${instance}`);
      return NextResponse.json({ ok: true });
    }

    const orgId = channel.org_id;
    const contactPhone = data.key.remoteJid.replace("@s.whatsapp.net", "");
    const contactName = data.pushName || contactPhone;

    // Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id, agent_id")
      .eq("org_id", orgId)
      .eq("channel_id", channel.id)
      .eq("contact_phone", contactPhone)
      .eq("status", "open")
      .single();

    if (!conversation) {
      // Get the default agent for this channel
      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("org_id", orgId)
        .eq("channel_id", channel.id)
        .eq("is_active", true)
        .single();

      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          org_id: orgId,
          channel_id: channel.id,
          agent_id: agent?.id || null,
          contact_phone: contactPhone,
          contact_name: contactName,
        })
        .select("id, agent_id")
        .single();

      conversation = newConversation;
    }

    if (!conversation) {
      return NextResponse.json({ ok: true });
    }

    // Save incoming message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: messageText,
    });

    // If there's an agent, generate AI response
    if (conversation.agent_id) {
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", conversation.agent_id)
        .single();

      if (agent) {
        // TODO: Call the Gemini API here and send response via Evolution
        // For now, send a placeholder response
        await sendTextMessage({
          instance,
          to: contactPhone,
          text: "Obrigado por sua mensagem! Em breve um atendente irá responder.",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Evolution webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
