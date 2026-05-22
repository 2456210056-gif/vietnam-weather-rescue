import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { publishSOSCreated } from "@/lib/realtime/pusher-server";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { parseSOSCreateInput } from "@/lib/sos/validation";
import { SOSSignal } from "@/models/SOSSignal";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  await connectMongo();

  const signals = await SOSSignal.find({
    status: {
      $in: ["PENDING", "ACKNOWLEDGED", "APPROACHING", "REACHED"]
    }
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("user", "fullName name email phone")
    .lean()
    .exec();

  return NextResponse.json({
    signals: signals.map(serializeSOSSignal)
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        message:
          "Bạn cần đăng nhập để gửi SOS vào hệ thống. Khi nguy hiểm thật, hãy gọi ngay 112, 113, 114 hoặc 115."
      },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const parsed = parseSOSCreateInput(body);

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: parsed.status });
  }

  await connectMongo();

  const user = await User.findById(session.user.id)
    .select("fullName name email phone")
    .lean()
    .exec();

  const now = new Date();
  const fullName = user?.fullName ?? user?.name ?? session.user.name ?? session.user.email ?? "";
  const signal = await SOSSignal.create({
    user: session.user.id,
    fullName,
    phone: user?.phone,
    emergencyType: parsed.data.needs[0],
    description: parsed.data.note,
    needs: parsed.data.needs,
    note: parsed.data.note,
    addressText: parsed.data.addressText,
    status: "PENDING",
    location: {
      type: "Point",
      coordinates: [parsed.data.longitude, parsed.data.latitude]
    },
    accuracy: parsed.data.accuracy,
    lastStatusAt: now
  });

  await signal.populate("user", "fullName name email phone");

  const serialized = serializeSOSSignal(signal);
  const realtimePublished = await publishSOSCreated({
    signal: serialized,
    emittedAt: new Date().toISOString()
  });

  return NextResponse.json(
    {
      signal: serialized,
      realtimePublished,
      message: `Tín hiệu SOS đã được ghi nhận. Mã SOS: ${serialized.id.slice(-6).toUpperCase()}.`
    },
    { status: 201 }
  );
}
