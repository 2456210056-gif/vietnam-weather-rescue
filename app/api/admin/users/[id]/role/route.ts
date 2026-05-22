import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth/permissions";
import { connectMongo } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { normalizeUserRole } from "@/types/roles";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Mã người dùng không hợp lệ." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
    const role = normalizeUserRole(body?.role);

    if (!role) {
      return NextResponse.json({ message: "Role không hợp lệ." }, { status: 400 });
    }

    await connectMongo();
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { role }
      },
      {
        new: true
      }
    )
      .select("_id fullName name email phone role")
      .lean()
      .exec();

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        fullName: user.fullName ?? user.name ?? null,
        email: user.email,
        phone: user.phone ?? null,
        role: normalizeUserRole(user.role) ?? "user"
      },
      message: "Đã cập nhật vai trò người dùng."
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể cập nhật role." }, { status: 500 });
  }
}
