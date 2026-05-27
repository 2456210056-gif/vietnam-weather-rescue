"use client";

import type { Route } from "next";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CloudSun, Map, ShieldCheck, Siren } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getOfflineSOSQueue } from "@/lib/offline-sos-queue";

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
  const reduceMotion = useReducedMotion();
  const [pendingOfflineSOS] = useState(() => getOfflineSOSQueue().length);
  const isLogin = mode === "login";
  const switchHref = (isLogin ? "/register" : "/login") as Route;
  const switchLabel = isLogin ? "Tạo tài khoản" : "Đăng nhập";
  const panelTitle = isLogin ? "Chào bạn!" : "Chào mừng trở lại!";
  const panelSubtitle = isLogin
    ? "Đăng nhập để theo dõi SOS, bản đồ cứu hộ và thông tin thời tiết theo vị trí."
    : "Đã có tài khoản? Đăng nhập để tiếp tục sử dụng hệ thống.";

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 px-4 py-8 text-slate-950 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 dark:text-white sm:px-6">
      <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl dark:bg-blue-500/15" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/15" />

      <div className="relative z-10 flex w-[calc(100vw-32px)] max-w-[1040px] flex-col overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900 lg:h-[600px] lg:w-[clamp(900px,72vw,1040px)]">
        <div className="flex flex-col bg-white dark:bg-slate-900 lg:h-[552px] lg:flex-row">
          <motion.div
            animate={reduceMotion ? false : { opacity: 1, x: 0 }}
            className={`flex min-h-0 w-full items-center justify-center bg-white px-6 py-7 dark:bg-slate-900 sm:px-8 sm:py-8 lg:h-full lg:w-1/2 lg:px-12 lg:py-10 ${
              isLogin ? "lg:order-1" : "lg:order-2"
            }`}
            initial={reduceMotion ? false : { opacity: 0, x: isLogin ? -24 : 24 }}
            key={`auth-form-${mode}`}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center">
              {children}
              {pendingOfflineSOS > 0 ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-100">
                  Có {pendingOfflineSOS} SOS đang chờ gửi. Đăng nhập để đồng bộ.
                </p>
              ) : null}
            </div>
          </motion.div>

          <motion.aside
            animate={reduceMotion ? false : { opacity: 1, x: 0 }}
            className={`relative flex min-h-[240px] w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-emerald-500 px-7 py-8 text-white sm:px-8 lg:h-full lg:w-1/2 lg:px-12 lg:py-10 ${
              isLogin ? "lg:order-2" : "lg:order-1"
            }`}
            initial={reduceMotion ? false : { opacity: 0.96, x: isLogin ? 72 : -72 }}
            key={`auth-panel-${mode}`}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/20 bg-white/15" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/20 bg-emerald-100/15" />
            <div className="pointer-events-none absolute right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-[22px] border border-white/25 bg-white/15 shadow-lg backdrop-blur-xl">
                  <ShieldCheck aria-hidden className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                  Vietnam Rescue
                </p>
                <h1 className="mt-3 text-3xl font-extrabold leading-tight">
                  Weather GIS SOS
                </h1>
                <p className="mt-3 max-w-sm text-[15px] font-medium leading-6 text-white/85">
                  Hệ thống cảnh báo thời tiết, bản đồ GIS và hỗ trợ cứu hộ khẩn cấp.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => {
                    const Icon = badge.icon;

                    return (
                      <span
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-bold text-white shadow-md backdrop-blur-xl"
                        key={badge.label}
                      >
                        <Icon aria-hidden className="h-3.5 w-3.5" />
                        {badge.label}
                      </span>
                    );
                  })}
                </div>

                <div className="max-w-sm space-y-3">
                  <p className="text-2xl font-extrabold">{panelTitle}</p>
                  <p className="text-sm font-medium leading-6 text-white/82">
                    {panelSubtitle}
                  </p>
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white px-6 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/15 transition duration-200 hover:bg-white/90 active:scale-[0.98]"
                    href={switchHref}
                  >
                    {switchLabel}
                  </Link>
                </div>
              </div>

              <p className="text-xs font-bold text-white/72">© DongVan 2026</p>
            </div>
          </motion.aside>
        </div>

        <div className="flex min-h-12 shrink-0 items-center justify-center border-t border-slate-100 bg-white/95 px-6 py-3 text-center text-xs font-medium leading-5 text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 lg:h-12 lg:py-0">
          Khẩn cấp thật? Gọi{" "}
          <a className="ml-1 font-black text-red-600 dark:text-red-300" href="tel:112">
            112
          </a>
          {" / "}
          <a className="font-black text-red-600 dark:text-red-300" href="tel:113">
            113
          </a>
          {" / "}
          <a className="font-black text-red-600 dark:text-red-300" href="tel:114">
            114
          </a>
          {" / "}
          <a className="font-black text-red-600 dark:text-red-300" href="tel:115">
            115
          </a>
          .
        </div>
      </div>
    </section>
  );
}
