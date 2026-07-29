import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendTextMessage,
  markRead,
  sendPresence,
} from "@/lib/evolution";
import { generateResponse, analyzeSentiment } from "@/lib/gemini";

interface EvolutionWebhookBody {
  event: string;
  instance: string;
  data: {
    key: { remoteJid: string; fromMe: boolean; id: string };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: { text?: string };
    };
  };
}

export async function POST(request: Request) {
  try {
    const body: EvolutionWebhookBody = await request.json();
    const { event, instance, data } = body;

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

    const { data: channel } = await supabase
      .from("channels")
      .select("*, organizations(*)")
      .eq("evolution_instance_id", instance)
      .single();

    if (!channel) {
      return NextResponse.json({ ok: true });
    }

    const orgId = channel.org_id;
    const contactPhone = data.key.remoteJid.replace("@s.whatsapp.net", "");
    const contactName = data.pushName || contactPhone;

    let { data: conversation } = await supabase
      .from("conversations")
      .select("id, agent_id")
      .eq("org_id", orgId)
      .eq("channel_id", channel.id)
      .eq("contact_phone", contactPhone)
      .eq("status", "open")
      .single();

    if (!conversation) {
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

    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: messageText,
    });

    await markRead(instance, data.key.remoteJid, data.key.id);
    await sendPresence(instance, data.key.remoteJid, "composing");

    if (conversation.agent_id) {
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", conversation.agent_id)
        .single();

      if (agent) {
        const { data: shortcuts } = await supabase
          .from("shortcuts")
          .select("trigger, response")
          .eq("org_id", orgId)
          .eq("is_active", true);

        const triggerMatch = shortcuts?.find((s) =>
          messageText.toLowerCase().includes(s.trigger.toLowerCase())
        );

        let responseText: string;

        if (triggerMatch) {
          responseText = triggerMatch.response;
        } else {
          const { data: trainingMessages } = await supabase
            .from("training_messages")
            .select("role, content")
            .eq("agent_id", agent.id)
            .order("created_at", { ascending: true });

          const { data: historyMessages } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true })
            .limit(20);

          const startTime = Date.now();
          responseText = await generateResponse(
            agent.system_prompt ||
              "Você é um atendente virtual prestativo e simpático.",
            trainingMessages || [],
            historyMessages || [],
            messageText,
            {
              model: agent.model,
              temperature: agent.temperature,
              maxTokens: agent.max_tokens,
            }
          );
        }

        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          role: "assistant",
          content: responseText,
          model: agent.model,
        });

        await sendTextMessage(instance, contactPhone, responseText);
      }
    }

    const sentiment = await analyzeSentiment(messageText);

    await supabase
      .from("conversations")
      .update({ sentiment, updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Evolution webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
