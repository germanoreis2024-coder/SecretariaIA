import { NextResponse } from "next/server";
import { deleteInstance } from "@/lib/evolution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: "instanceName required" },
        { status: 400 }
      );
    }

    await deleteInstance(instanceName);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Evolution delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
