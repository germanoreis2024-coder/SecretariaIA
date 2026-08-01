import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgSettings, saveOrgSettings, isSettingKey } from "@/lib/settings";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const settings = await getOrgSettings(supabase, member.org_id);

  return NextResponse.json({
    settings: {
      gemini_api_key: settings.gemini_api_key || null,
      evolution_api_url: settings.evolution_api_url || null,
      evolution_api_key: settings.evolution_api_key || null,
    },
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    if (isSettingKey(key) && typeof value === "string") {
      updates[key] = value;
    }
  }

  await saveOrgSettings(supabase, member.org_id, updates);

  return NextResponse.json({ ok: true });
}
