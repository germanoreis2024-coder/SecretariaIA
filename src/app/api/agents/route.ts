import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's org
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Get user's org
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      org_id: member.org_id,
      name: body.name,
      description: body.description,
      personality: body.personality,
      system_prompt: body.system_prompt,
      model: body.model || "gemini-2.0-flash",
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1000,
      channel_id: body.channel_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agent }, { status: 201 });
}
