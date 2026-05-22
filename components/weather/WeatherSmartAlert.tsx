"use client";

import { motion } from "framer-motion";
import { CloudLightning, CloudRain, ShieldCheck, TriangleAlert, Waves, Wind } from "lucide-react";
import type { WeatherAlert } from "@/types/weather";

type WeatherSmartAlertProps = {
  alert: WeatherAlert;
};

const severityLabel: Record<WeatherAlert["severity"], string> = {
  info: "Thông tin",
  watch: "Theo dõi",
  warning: "Cảnh báo",
  danger: "Nguy hiểm"
};

const severityClasses: Record<WeatherAlert["severity"], string> = {
  info: "border-blue-200/30 bg-blue-400/15 text-blue-50",
  watch: "border-emerald-200/30 bg-emerald-400/15 text-emerald-50",
  warning: "border-orange-200/40 bg-orange-400/20 text-orange-50",
  danger: "border-red-200/50 bg-red-500/25 text-red-50"
};

function AlertIcon({ type }: { type: WeatherAlert["type"] }) {
  if (type === "thunderstorm" || type === "storm") {
    return <CloudLightning aria-hidden className="h-5 w-5" />;
  }

  if (type === "wind") {
    return <Wind aria-hidden className="h-5 w-5" />;
  }

  if (type === "flood") {
    return <Waves aria-hidden className="h-5 w-5" />;
  }

  if (type === "stable") {
    return <ShieldCheck aria-hidden className="h-5 w-5" />;
  }

  if (type === "heavy_rain") {
    return <TriangleAlert aria-hidden className="h-5 w-5" />;
  }

  return <CloudRain aria-hidden className="h-5 w-5" />;
}

function needsSosHint(type: WeatherAlert["type"]) {
  return type === "heavy_rain" || type === "flood" || type === "storm" || type === "thunderstorm";
}

export function WeatherSmartAlert({ alert }: WeatherSmartAlertProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 rounded-[34px] border border-white/10 bg-blue-950/35 p-5 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 text-white">
              <AlertIcon type={alert.type} />
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${severityClasses[alert.severity]}`}
            >
              {severityLabel[alert.severity]}
            </span>
            {alert.source === "provider_alert" ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/80">
                Nguồn khí tượng
              </span>
            ) : null}
          </div>

          <h3 className="mt-4 text-xl font-black leading-tight md:text-2xl">{alert.title}</h3>
          <p className="mt-3 max-w-[30rem] text-sm font-semibold leading-6 text-white/80 md:text-base">
            {alert.message}
          </p>

          {alert.expectedTime ? (
            <p className="mt-3 text-sm font-bold text-white/70">Dự kiến khoảng: {alert.expectedTime}</p>
          ) : null}

          {needsSosHint(alert.type) ? (
            <p className="mt-4 rounded-2xl border border-red-200/20 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-50">
              Nếu gặp nguy hiểm, hãy dùng nút SOS khẩn cấp.
            </p>
          ) : null}
        </div>

        {alert.probability !== undefined ? (
          <div className="shrink-0 text-right">
            <p className="text-4xl font-black leading-none md:text-5xl">{alert.probability}%</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wider text-white/60">Nguy cơ</p>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
