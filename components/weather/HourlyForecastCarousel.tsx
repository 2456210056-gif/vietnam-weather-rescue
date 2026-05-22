"use client";

import { motion } from "framer-motion";
import { CloudRain, CloudSun, Droplets } from "lucide-react";
import type { WeatherCondition } from "@/lib/weather/weather-condition";

export type HourlyForecastItem = {
  time: string;
  label?: string;
  temperature: number;
  description?: string;
  precipitationProbability?: number;
  condition?: WeatherCondition;
};

type HourlyForecastCarouselProps = {
  items: HourlyForecastItem[];
};

function formatHour(value: string, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function HourlyForecastCarousel({ items }: HourlyForecastCarouselProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-soft shadow-blue-950/5 backdrop-blur-xl md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">Dự báo 24 giờ</h3>
          <p className="text-sm font-semibold text-slate-500">
            Cuộn ngang để xem các mốc giờ tiếp theo
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-slate-100 px-4 py-5 text-sm font-bold text-slate-600">
          Dự báo theo giờ đang được cập nhật.
        </div>
      ) : (
        <motion.div
          animate="show"
          className="weather-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto pb-2"
          initial="hidden"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.04
              }
            }
          }}
        >
          {items.map((item) => (
            <motion.article
              className="min-w-[104px] snap-start rounded-3xl border border-blue-50 bg-white px-3 py-4 text-center shadow-sm transition-transform duration-200 hover:scale-[1.025]"
              key={item.time}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <p className="text-xs font-black text-slate-500">
                {formatHour(item.time, item.label)}
              </p>
              <div className="mx-auto mt-3 grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                {item.condition === "rain" ||
                item.condition === "drizzle" ||
                item.condition === "thunderstorm" ? (
                  <CloudRain aria-hidden className="h-5 w-5" />
                ) : (
                  <CloudSun aria-hidden className="h-5 w-5" />
                )}
              </div>
              <p className="mt-3 text-2xl font-black text-slate-950">
                {Math.round(item.temperature)}°
              </p>
              {item.precipitationProbability !== undefined ? (
                <p className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-bold text-sky-700">
                  <Droplets aria-hidden className="h-3.5 w-3.5" />
                  {item.precipitationProbability}%
                </p>
              ) : null}
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
}
