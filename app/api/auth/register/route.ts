import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { connectMongo } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import type { UserRole } from "@/types/roles";

export const runtime = "nodejs";

const MIN_PASSWORD_LENGTH = 6;

type RegisterBody = {
  fullName?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  password?: unknown;
  inviteCode?: unknown;
};

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function resolveRole(inviteCode: string): { ok: true; role: UserRole } | { ok: false } {
  if (!inviteCode) {
    return { ok: true, role: "user" };
  }

  const adminInviteCode = process.env.ADMIN_INVITE_CODE?.trim();
  const rescuerInviteCode = process.env.RESCUER_INVITE_CODE?.trim();

  if (adminInviteCode && inviteCode === adminInviteCode) {
    return { ok: true, role: "admin" };
  }

  if (rescuerInviteCode && inviteCode === rescuerInviteCode) {
    return { ok: true, role: "rescuer" };
  }

  return { ok: false };
}

function getPublicUser(user: {
  _id: unknown;
  fullName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
}) {
  return {
    id: String(user._id),
    fullName: user.fullName ?? user.name ?? "",
    email: user.email,
    phone: user.phone ?? null,
    role: user.role
  };
}

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Body JSON không hợp lệ" },
      { status: 400 }
    );
  }

  const fullName = cleanText(body.fullName || body.name, 120);
  const email = cleanText(body.email, 180);
  const phone = cleanText(body.phone, 30);
  const password = cleanText(body.password, 200);
  const inviteCode = cleanText(body.inviteCode, 100);
  const roleResult = resolveRole(inviteCode);

  if (!roleResult.ok) {
    return NextResponse.json(
      { success: false, message: "Mã quyền không hợp lệ" },
      { status: 400 }
    );
  }

  if (fullName.length < 2) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập họ tên hợp lệ" },
      { status: 400 }
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Email không hợp lệ" },
      { status: 400 }
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
      { status: 400 }
    );
  }

  try {
    await connectMongo();

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.exists({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      fullName,
      name: fullName,
      email: normalizedEmail,
      phone: phone || undefined,
      passwordHash,
      role: roleResult.role
    });

    return NextResponse.json(
      {
        success: true,
        user: getPublicUser(user)
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể đăng ký tài khoản lúc này. Vui lòng thử lại sau."
      },
      { status: 500 }
    );
  }
}
