import { NextResponse } from "next/server";
import { deleteInstance } from "@/lib/evolution";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvolutionConfig, getUserOrgId } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, orgId } = await getUserOrgId(supabase);

    if (!user || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evolutionConfig = await getOrgEvolutionConfig(supabase, orgId);

    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: "instanceName required" },
        { status: 400 }
      );
    }

    await deleteInstance(instanceName, evolutionConfig);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Evolution delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
