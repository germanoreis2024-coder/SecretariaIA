import { NextResponse } from "next/server";
import { getInstanceStatus } from "@/lib/evolution";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvolutionConfig, getUserOrgId } from "@/lib/settings";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { user, orgId } = await getUserOrgId(supabase);

    if (!user || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evolutionConfig = await getOrgEvolutionConfig(supabase, orgId);

    const { searchParams } = new URL(request.url);
    const instance = searchParams.get("instance");

    if (!instance) {
      return NextResponse.json(
        { error: "instance parameter required" },
        { status: 400 }
      );
    }

    const status = await getInstanceStatus(instance, evolutionConfig);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Evolution status error:", error);
    return NextResponse.json(
      { error: "Instance not found" },
      { status: 404 }
    );
  }
}
