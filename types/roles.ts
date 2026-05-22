export const USER_ROLES = ["user", "rescuer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

const ROLE_ALIASES: Record<string, UserRole> = {
  user: "user",
  USER: "user",
  rescuer: "rescuer",
  RESCUER: "rescuer",
  admin: "admin",
  ADMIN: "admin"
};

export function normalizeUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  return ROLE_ALIASES[value.trim()] ?? null;
}

export function isUserRole(value: unknown): value is UserRole {
  return normalizeUserRole(value) !== null;
}

export function canUpdateSOSSignal(role: UserRole | undefined): boolean {
  return role === "rescuer" || role === "admin";
}
