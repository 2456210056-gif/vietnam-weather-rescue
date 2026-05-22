"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CloudLightning, CloudRain, ShieldCheck, TriangleAlert, Waves, Wind } from "lucide-react";
import { useState } from "react";
import type { WeatherAlert } from "@/types/weather";

type WeatherAlertCarouselProps = {
  alerts: WeatherAlert[];
};

const severityTone: Record<WeatherAlert["severity"], string> = {
  info: "from-blue-400/25 to-white/10",
  watch: "from-emerald-400/25 to-white/10",
  warning: "from-orange-400/30 to-white/10",
  danger: "from-red-500/30 to-white/10"
};

function AlertIcon({ type }: { type: WeatherAlert["type"] }) {
  if (type === "storm" || type === "thunderstorm") {
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

export function WeatherAlertCarousel({ alerts }: WeatherAlertCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleAlerts = alerts.length ? alerts : [];
  const activeAlert = visibleAlerts[Math.min(activeIndex, visibleAlerts.length - 1)];

  if (!activeAlert) {
    return null;
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-blue-950/30 p-5 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        <motion.article
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className={`min-h-[190px] rounded-[28px] bg-gradient-to-br ${severityTone[activeAlert.severity]} p-4`}
          exit={{ opacity: 0, x: -16, scale: 0.98 }}
          initial={{ opacity: 0, x: 16, scale: 0.98 }}
          key={activeAlert.id}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
                  <AlertIcon type={activeAlert.type} />
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/80">
                  {activeAlert.severity === "danger"
                    ? "Nguy hiểm"
                    : activeAlert.severity === "warning"
                      ? "Cảnh báo"
                      : activeAlert.severity === "watch"
                        ? "Theo dõi"
                        : "Thông tin"}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-black leading-tight md:text-2xl">{activeAlert.title}</h3>
              <p className="mt-3 max-w-[30rem] text-sm font-semibold leading-6 text-white/80 md:text-base">
                {activeAlert.message}
              </p>
              {activeAlert.expectedTime ? (
                <p className="mt-3 text-sm font-bold text-white/70">Dự kiến khoảng: {activeAlert.expectedTime}</p>
              ) : null}
            </div>

            {activeAlert.probability !== undefined ? (
              <div className="shrink-0 text-right">
                <p className="text-4xl font-black leading-none md:text-5xl">{activeAlert.probability}%</p>
                <p className="mt-1 text-xs font-black uppercase tracking-wider text-white/60">Nguy cơ</p>
              </div>
            ) : null}
          </div>
        </motion.article>
      </AnimatePresence>

      {visibleAlerts.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {visibleAlerts.map((alert, index) => (
            <button
              aria-label={`Xem cảnh báo ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/30"
              }`}
              key={alert.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
