"use client";

import type { Route } from "next";
import Link from "next/link";
import { CloudSun, Map, ShieldCheck, Siren } from "lucide-react";
import type { ReactNode } from "react";
import { SlidingAuthCard } from "@/components/auth/SlidingAuthCard";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
};

const badges = [
  { label: "Realtime Weather", icon: CloudSun },
  { label: "SOS Rescue", icon: Siren },
  { label: "GIS Map", icon: Map }
] as const;

export function AuthShell({ children, mode }: AuthShellProps) {
  const switchHref = (mode === "login" ? "/register" : "/login") as Route;
  const switchLabel = mode === "login" ? "Tạo tài khoản" : "Đăng nhập";
  const panelTitle = mode === "login" ? "Chào mừng trở lại" : "Bắt đầu an toàn";

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:min-h-[560px] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-emerald-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-100/20 blur-3xl" />

          <div className="relative">
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-[24px] border border-white/25 bg-white/15 shadow-xl backdrop-blur-xl">
              <ShieldCheck aria-hidden className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
              Vietnam Rescue
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              Weather GIS SOS
            </h1>
            <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white/85">
              Thời tiết, cảnh báo và SOS.
            </p>
          </div>

          <div className="relative space-y-6">
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur-xl"
                    key={badge.label}
                  >
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                    {badge.label}
                  </span>
                );
              })}
            </div>

            <div className="space-y-3">
              <p className="text-xl font-black">{panelTitle}</p>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-5 text-sm font-black text-white shadow-xl backdrop-blur-xl transition duration-200 hover:bg-white/25 active:scale-[0.98]"
                href={switchHref}
              >
                {switchLabel}
              </Link>
            </div>

            <p className="text-xs font-bold text-white/70">
              © Thiết kế bởi nhóm DongVan - 2026
            </p>
          </div>
        </aside>

        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-emerald-500 p-6 text-white lg:hidden">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
            Vietnam Rescue
          </p>
          <h1 className="mt-2 text-2xl font-black">Weather GIS SOS</h1>
          <p className="mt-2 text-sm font-semibold text-white/85">
            Thời tiết, cảnh báo và SOS.
          </p>
        </div>

        <SlidingAuthCard mode={mode}>{children}</SlidingAuthCard>
      </div>
    </section>
  );
}
