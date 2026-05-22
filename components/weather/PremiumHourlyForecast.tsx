"use client";

import { motion } from "framer-motion";
import { Cloud, CloudMoon, CloudRain, Droplets, Sun } from "lucide-react";

export type PremiumHourlyForecastItem = {
  time: string;
  temperature: number;
  precipitationChance?: number;
  condition?: string;
  icon?: string;
};

type PremiumHourlyForecastProps = {
  items: PremiumHourlyForecastItem[];
};

function formatHour(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function WeatherIcon({ condition }: { condition?: string }) {
  if (condition === "rain" || condition === "drizzle" || condition === "thunderstorm") {
    return <CloudRain aria-hidden className="h-8 w-8" />;
  }

  if (condition === "night") {
    return <CloudMoon aria-hidden className="h-8 w-8" />;
  }

  if (condition === "clear") {
    return <Sun aria-hidden className="h-8 w-8" />;
  }

  return <Cloud aria-hidden className="h-8 w-8" />;
}

export function PremiumHourlyForecast({ items }: PremiumHourlyForecastProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[34px] border border-white/10 bg-blue-950/35 p-4 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="weather-scrollbar flex snap-x gap-5 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="min-w-[74px] snap-start text-center"
            initial={{ opacity: 0, y: 12 }}
            key={`${item.time}-${index}`}
            transition={{ duration: 0.25, delay: index * 0.03 }}
          >
            <p className="text-sm font-semibold text-white/80">{formatHour(item.time)}</p>
            <div className="mt-4 flex justify-center text-white">
              <WeatherIcon condition={item.condition} />
            </div>
            <p className="mt-3 text-2xl font-black">{Math.round(item.temperature)}°</p>
            <div className="mx-auto mt-5 h-px w-full bg-white/40">
              <span className="mx-auto block h-2 w-2 -translate-y-[3px] rounded-full bg-white" />
            </div>
            <p className="mt-5 inline-flex items-center justify-center gap-1 text-xs font-bold text-white/70">
              <Droplets aria-hidden className="h-3.5 w-3.5" />
              {item.precipitationChance ?? 0}%
            </p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
