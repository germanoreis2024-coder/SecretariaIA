import { NextResponse } from "next/server";
import { getInstanceStatus } from "@/lib/evolution";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instance = searchParams.get("instance");

  if (!instance) {
    return NextResponse.json(
      { error: "instance parameter required" },
      { status: 400 }
    );
  }

  try {
    const status = await getInstanceStatus(instance);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Evolution status error:", error);
    return NextResponse.json(
      { error: "Instance not found" },
      { status: 404 }
    );
  }
}
