"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type WeatherWarningBannerProps = {
  severity?: "none" | "low" | "medium" | "high" | "emergency";
  title?: string;
  message?: string;
};

const severityClasses = {
  low: "border-amber-200 bg-amber-50 text-amber-950",
  medium: "border-orange-200 bg-orange-50 text-orange-950",
  high: "border-red-200 bg-red-50 text-red-950",
  emergency: "border-red-300 bg-red-600 text-white"
} as const;

export function WeatherWarningBanner({
  severity = "none",
  title,
  message
}: WeatherWarningBannerProps) {
  if (severity === "none") {
    return null;
  }

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border px-4 py-4 shadow-soft md:px-5 ${severityClasses[severity]}`}
      initial={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-current/10">
          <AlertTriangle aria-hidden className="h-5 w-5 weather-warning-icon" />
        </div>
        <div>
          <p className="font-black">{title ?? "Cảnh báo thời tiết"}</p>
          <p className="mt-1 text-sm font-semibold leading-6 opacity-85">
            {message ??
              "Theo dõi bản đồ, chuẩn bị phương án an toàn và dùng SOS nếu cần hỗ trợ trong phạm vi ứng dụng."}
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
