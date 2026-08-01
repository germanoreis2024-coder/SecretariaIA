import { NextResponse } from "next/server";
import { fetchInstances } from "@/lib/evolution";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvolutionConfig, getUserOrgId } from "@/lib/settings";

export async function GET() {
  try {
    const supabase = await createClient();
    const { user, orgId } = await getUserOrgId(supabase);

    if (!user || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evolutionConfig = await getOrgEvolutionConfig(supabase, orgId);

    const instances = await fetchInstances(evolutionConfig);
    return NextResponse.json({ instances });
  } catch (error) {
    console.error("Evolution instances error:", error);
    return NextResponse.json(
      { error: "Evolution API not available" },
      { status: 503 }
    );
  }
}
