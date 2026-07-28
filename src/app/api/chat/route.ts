import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResponse, analyzeSentiment } from "@/lib/gemini";
import type { Message, Agent, Conversation } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, message, agentId } = body;

    if (!conversationId || !message || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get agent config
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get training messages
    const { data: trainingMessages } = await supabase
      .from("training_messages")
      .select("role, content")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true });

    // Get conversation history (last 20 messages)
    const { data: historyMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    const startTime = Date.now();

    // Generate AI response
    const aiResponse = await generateResponse(
      agent.system_prompt || "Você é um atendente virtual prestativo e simpático.",
      trainingMessages || [],
      historyMessages || [],
      message,
      {
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.max_tokens,
      }
    );

    const latencyMs = Date.now() - startTime;

    // Analyze sentiment
    const sentiment = await analyzeSentiment(message);

    // Save assistant message
    const { data: savedMessage } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
        model: agent.model,
        latency_ms: latencyMs,
      })
      .select()
      .single();

    // Update conversation with latest sentiment
    await supabase
      .from("conversations")
      .update({ sentiment, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({
      message: savedMessage,
      sentiment,
      latencyMs,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
