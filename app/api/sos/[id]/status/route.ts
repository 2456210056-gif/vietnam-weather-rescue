import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { publishSOSUpdated } from "@/lib/realtime/pusher-server";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { parseSOSStatusInput } from "@/lib/sos/validation";
import { SOSSignal } from "@/models/SOSSignal";
import { canUpdateSOSSignal } from "@/types/roles";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  if (!canUpdateSOSSignal(session.user.role)) {
    return NextResponse.json(
      { message: "Chỉ tài khoản cứu hộ hoặc quản trị mới được cập nhật SOS." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Mã tín hiệu SOS không hợp lệ." }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const parsed = parseSOSStatusInput(body);

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: parsed.status });
  }

  await connectMongo();

  const current = await SOSSignal.findById(id).exec();

  if (!current) {
    return NextResponse.json({ message: "Không tìm thấy tín hiệu SOS." }, { status: 404 });
  }

  const now = new Date();
  const previousStatus = current.status;
  const nextStatus = parsed.data.status;
  const timelineType =
    nextStatus === "PENDING"
      ? "restored_to_pending"
      : nextStatus === "ACKNOWLEDGED"
        ? "accepted"
        : nextStatus === "APPROACHING"
          ? "in_progress"
          : nextStatus === "REACHED"
            ? "reached"
            : nextStatus === "RESOLVED"
              ? "resolved"
              : "cancelled";
  const setPayload: Record<string, unknown> = {
    status: nextStatus,
    lastStatusAt: now
  };
  const unsetPayload: Record<string, 1> = {};

  if (nextStatus === "PENDING") {
    unsetPayload.assignedRescuer = 1;
  } else {
    setPayload.assignedRescuer = session.user.id;
  }

  if (nextStatus === "ACKNOWLEDGED" && !current.acceptedAt) {
    setPayload.acceptedAt = now;
  }

  if (nextStatus === "RESOLVED" && !current.resolvedAt) {
    setPayload.resolvedAt = now;
  }

  const updated = await SOSSignal.findByIdAndUpdate(
    id,
    {
      $set: setPayload,
      ...(Object.keys(unsetPayload).length ? { $unset: unsetPayload } : {}),
      $push: {
        timeline: {
          type: timelineType,
          timestamp: now,
          actorId: session.user.id,
          actorName: session.user.name ?? session.user.email ?? null,
          fromStatus: previousStatus,
          toStatus: nextStatus
        }
      }
    },
    {
      new: true
    }
  )
    .populate("user", "fullName name email phone")
    .exec();

  if (!updated) {
    return NextResponse.json({ message: "Không tìm thấy tín hiệu SOS." }, { status: 404 });
  }

  const serialized = serializeSOSSignal(updated);
  const realtimePublished = await publishSOSUpdated({
    signal: serialized,
    emittedAt: new Date().toISOString()
  });

  return NextResponse.json({
    signal: serialized,
    realtimePublished,
    message: "Trạng thái SOS đã được cập nhật."
  });
}
