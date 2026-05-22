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

  return (
    <motion.article
      className="flex min-h-[140px] flex-col rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-soft shadow-blue-950/5 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.015]"
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ${gradientClasses[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      {helper ? <p className="mt-1 text-sm font-semibold text-slate-500">{helper}</p> : null}
      {clampedProgress !== undefined ? (
        <div className="mt-auto pt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
