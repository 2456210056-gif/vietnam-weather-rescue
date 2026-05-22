import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { SOSSignal } from "@/models/SOSSignal";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  await connectMongo();
  const signals = await SOSSignal.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .exec();

  return NextResponse.json({
    signals: signals.map(serializeSOSSignal)
  });
}
