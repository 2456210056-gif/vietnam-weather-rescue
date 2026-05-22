import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { AuthError, requireRole } from "@/lib/auth/permissions";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { SOSSignal } from "@/models/SOSSignal";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole(["rescuer", "admin"]);
    await connectMongo();

    const signals = await SOSSignal.find({
      status: {
        $in: ["PENDING", "ACKNOWLEDGED", "APPROACHING", "REACHED"]
      }
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "fullName name email phone")
      .exec();

    return NextResponse.json({
      signals: signals.map(serializeSOSSignal)
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể tải danh sách SOS." }, { status: 500 });
  }
}
