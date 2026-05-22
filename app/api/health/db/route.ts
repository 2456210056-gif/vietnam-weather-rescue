import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectMongo();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown MongoDB error";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
