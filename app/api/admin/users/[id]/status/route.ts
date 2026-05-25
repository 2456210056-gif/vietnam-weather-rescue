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

function isValidAction(value: unknown): value is "deactivate" | "reactivate" | "delete" {
  return value === "deactivate" || value === "reactivate" || value === "delete";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Mã người dùng không hợp lệ." }, { status: 400 });
    }

    if (String(admin._id) === id) {
      return NextResponse.json(
        { message: "Không thể khóa hoặc xóa chính tài khoản admin đang đăng nhập." },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
    const action = body?.action;

    if (!isValidAction(action)) {
      return NextResponse.json({ message: "Hành động không hợp lệ." }, { status: 400 });
    }

    await connectMongo();

    const now = new Date();
    const update =
      action === "reactivate"
        ? {
            $set: {
              isActive: true,
              deletedAt: null,
              deletedBy: null
            }
          }
        : {
            $set: {
              isActive: false,
              deletedAt: now,
              deletedBy: admin._id
            }
          };

    const user = await User.findByIdAndUpdate(id, update, {
      new: true
    })
      .select("_id fullName name email phone role isActive deletedAt")
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
        role: normalizeUserRole(user.role) ?? "user",
        isActive: user.isActive !== false && !user.deletedAt,
        deletedAt: user.deletedAt
          ? user.deletedAt instanceof Date
            ? user.deletedAt.toISOString()
            : String(user.deletedAt)
          : null
      },
      message:
        action === "reactivate"
          ? "Đã mở khóa tài khoản."
          : action === "delete"
            ? "Đã xóa mềm tài khoản. Dữ liệu lịch sử vẫn được giữ."
            : "Đã vô hiệu hóa tài khoản."
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể cập nhật trạng thái tài khoản." }, { status: 500 });
  }
}
