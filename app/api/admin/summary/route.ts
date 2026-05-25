import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { AuthError, requireRole } from "@/lib/auth/permissions";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { SOSSignal } from "@/models/SOSSignal";
import { User } from "@/models/User";
import { normalizeUserRole } from "@/types/roles";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole(["admin"]);
    await connectMongo();

    const [users, sosSignals, totalUsers, totalSOS, pendingSOS, resolvedSOS] = await Promise.all([
      User.find({})
        .select("_id fullName name email phone role isActive deletedAt createdAt")
        .sort({ createdAt: -1 })
        .limit(80)
        .lean()
        .exec(),
      SOSSignal.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("user", "fullName name email phone")
        .exec(),
      User.countDocuments({}),
      SOSSignal.countDocuments({}),
      SOSSignal.countDocuments({ status: { $in: ["PENDING", "ACKNOWLEDGED", "APPROACHING"] } }),
      SOSSignal.countDocuments({ status: "RESOLVED" })
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSOS,
        pendingSOS,
        resolvedSOS
      },
      users: users.map((user) => ({
        id: user._id.toString(),
        fullName: user.fullName ?? user.name ?? null,
        email: user.email,
        phone: user.phone ?? null,
        role: normalizeUserRole(user.role) ?? "user",
        isActive: user.isActive !== false && !user.deletedAt,
        deletedAt: user.deletedAt
          ? user.deletedAt instanceof Date
            ? user.deletedAt.toISOString()
            : String(user.deletedAt)
          : null,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt)
      })),
      sosSignals: sosSignals.map(serializeSOSSignal)
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể tải dashboard quản trị." }, { status: 500 });
  }
}
