import type { Types } from "mongoose";
import type { ProfileUserDTO } from "@/types/profile";
import { normalizeUserRole, type UserRole } from "@/types/roles";

type ObjectIdLike = Types.ObjectId | string;

export type UserLike = {
  _id: ObjectIdLike;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  image?: string | null;
  role: UserRole;
};

export function serializeProfileUser(user: UserLike): ProfileUserDTO {
  const fullName = user.fullName ?? user.name ?? null;
  const avatar = user.avatar ?? user.image ?? null;

  return {
    id: String(user._id),
    fullName,
    name: user.name ?? fullName,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar,
    image: user.image ?? avatar,
    role: normalizeUserRole(user.role) ?? "user"
  };
}
