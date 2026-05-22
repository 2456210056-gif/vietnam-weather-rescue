import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { normalizeUserRole, type UserRole } from "@/types/roles";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  await connectMongo();
  return User.findById(session.user.id)
    .select("_id fullName name email phone avatar image role")
    .lean()
    .exec();
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Bạn cần đăng nhập.", 401);
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();

  const role = normalizeUserRole(user.role);

  if (!role || !roles.includes(role)) {
    throw new AuthError("Bạn không có quyền truy cập.", 403);
  }

  return user;
}
