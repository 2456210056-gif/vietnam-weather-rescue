"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type WeatherMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  progress?: number;
  tone?: "default" | "green" | "amber" | "red" | "blue";
};

const gradientClasses = {
  default: "from-slate-900 to-slate-700",
  green: "from-emerald-500 to-emerald-700",
  amber: "from-amber-500 to-orange-600",
  red: "from-red-500 to-rose-700",
  blue: "from-sky-500 to-blue-700"
} as const;

export function WeatherMetricCard({
  icon,
  label,
  value,
  helper,
  progress,
  tone = "default"
}: WeatherMetricCardProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.max(0, Math.min(100, progress));
  const valueIsLong = value.length > 10;

  return (
    <motion.article
      className="flex min-h-[120px] min-w-0 flex-col rounded-3xl border border-white/10 bg-white/15 p-4 text-white shadow-lg shadow-blue-950/10 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.015]"
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br text-white ${gradientClasses[tone]}`}>
        {icon}
      </div>
      <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-white/70">
        {label}
      </p>
      <p
        className={`mt-2 break-words font-black leading-tight text-white ${
          valueIsLong ? "text-xl" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {helper ? (
        <p className="mt-1 break-words text-sm font-semibold leading-5 text-white/60">
          {helper}
        </p>
      ) : null}
      {clampedProgress !== undefined ? (
        <div className="mt-auto pt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradientClasses[tone]}`}
              style={{ transform: `scaleX(${clampedProgress / 100})`, transformOrigin: "left" }}
            />
          </div>
        </div>
      ) : null}
    </motion.article>
  );
}
