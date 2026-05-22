"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { WeatherAlert } from "@/types/weather";

type WeatherWarningBannerProps = {
  alert?: WeatherAlert;
  severity?: "none" | "low" | "medium" | "high" | "emergency";
  title?: string;
  message?: string;
};

const severityClasses = {
  low: "border-amber-200 bg-amber-50 text-amber-950",
  medium: "border-orange-200 bg-orange-50 text-orange-950",
  high: "border-orange-200 bg-orange-500 text-white",
  emergency: "border-red-300 bg-red-600 text-white"
} as const;

export function WeatherWarningBanner({
  alert,
  severity = "none",
  title,
  message
}: WeatherWarningBannerProps) {
  const mappedSeverity =
    alert?.severity === "danger" ? "emergency" : alert?.severity === "warning" ? "high" : severity;
  const shouldShow = alert ? alert.severity === "warning" || alert.severity === "danger" : mappedSeverity !== "none";
  const visibleSeverity = mappedSeverity === "none" ? "low" : mappedSeverity;

  if (!shouldShow) {
    return null;
  }

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border px-4 py-4 shadow-soft md:px-5 ${severityClasses[visibleSeverity]}`}
      initial={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/15">
            <AlertTriangle aria-hidden className="h-5 w-5 weather-warning-icon" />
          </div>
          <div>
            <p className="font-black">{alert?.title ?? title ?? "Cảnh báo thời tiết"}</p>
            <p className="mt-1 text-sm font-semibold leading-6 opacity-90">
              {alert?.message ??
                message ??
                "Theo dõi bản đồ, chuẩn bị phương án an toàn và dùng SOS nếu cần hỗ trợ trong phạm vi ứng dụng."}
            </p>
          </div>
        </div>
        <Link
          className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-900 shadow-lg transition-transform duration-200 hover:scale-[1.03]"
          href="/map"
        >
          Xem bản đồ
        </Link>
      </div>
    </motion.aside>
  );
}
