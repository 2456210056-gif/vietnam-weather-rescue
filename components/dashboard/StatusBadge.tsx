import type { ReactNode } from "react";
import type { UserRole } from "@/types/roles";
import type { SOSStatus } from "@/types/sos";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "admin" | "rescuer" | "user" | SOSStatus | "blue" | "emerald" | "amber" | "red" | "slate" | "violet";
};

const TONE_CLASS: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  admin: "border-blue-400/20 bg-blue-500/15 text-sky-200",
  rescuer: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  user: "border-slate-400/20 bg-slate-500/15 text-slate-200",
  PENDING: "border-red-400/25 bg-red-500/15 text-red-200",
  ACKNOWLEDGED: "border-blue-400/20 bg-blue-500/15 text-sky-200",
  APPROACHING: "border-violet-400/20 bg-violet-500/15 text-violet-200",
  REACHED: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  RESOLVED: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  CANCELLED: "border-slate-400/20 bg-slate-500/15 text-slate-200",
  blue: "border-blue-400/20 bg-blue-500/15 text-sky-200",
  emerald: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-500/15 text-amber-200",
  red: "border-red-400/25 bg-red-500/15 text-red-200",
  slate: "border-slate-400/20 bg-slate-500/15 text-slate-200",
  violet: "border-violet-400/20 bg-violet-500/15 text-violet-200"
};

export function roleBadgeTone(role: UserRole) {
  return role;
}

export function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
