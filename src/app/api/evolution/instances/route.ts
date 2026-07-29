import { NextResponse } from "next/server";
import { fetchInstances } from "@/lib/evolution";

export async function GET() {
  try {
    const instances = await fetchInstances();
    return NextResponse.json({ instances });
  } catch (error) {
    console.error("Evolution instances error:", error);
    return NextResponse.json(
      { error: "Evolution API not available" },
      { status: 503 }
    );
  }
}
