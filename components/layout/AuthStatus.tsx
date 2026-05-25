"use client";

import { signOut, useSession } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import type { UserRole } from "@/types/roles";

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Người dùng",
  rescuer: "Cứu hộ viên",
  admin: "Quản trị viên"
};

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />;
  }

  if (!session?.user) {
    return (
      <Link
        className="rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 dark:shadow-blue-950/30"
        href={"/login" as Route}
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <button
      className="hidden rounded-full border border-blue-100 bg-white/95 px-3 py-2 text-left text-xs font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-200 sm:block dark:border-white/15 dark:bg-slate-950/90 dark:text-slate-100"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      <span className="block max-w-24 truncate sm:max-w-36">
        {session.user.name ?? session.user.email}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
        {ROLE_LABELS[session.user.role]}
      </span>
    </button>
  );
}
