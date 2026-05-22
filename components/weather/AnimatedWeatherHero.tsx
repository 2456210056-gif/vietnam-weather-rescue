"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Droplets, Eye, Gauge, MapPin, Navigation, Wind } from "lucide-react";
import { WeatherBackgroundEffects } from "@/components/weather/WeatherBackgroundEffects";
import type { WeatherCondition } from "@/lib/weather/weather-condition";

export type AnimatedWeatherHeroProps = {
  locationName: string;
  temperature: number;
  feelsLike?: number;
  description: string;
  condition: WeatherCondition;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  aqi?: number;
  observedAt?: string;
  fetchedAt?: string;
  isRealtime?: boolean;
  isGpsLocation?: boolean;
};

function formatDateTime(value?: string) {
  if (!value) {
    return "Đang cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatVisibility(value?: number) {
  if (!value) {
    return "--";
  }

  return `${Math.round(value / 100) / 10} km`;
}

function getGradientBorderClass(condition: WeatherCondition) {
  switch (condition) {
    case "clear":
      return "from-blue-200/85 via-sky-100/75 to-emerald-200/85";
    case "clouds":
      return "from-sky-200/80 via-white/75 to-emerald-100/80";
    case "rain":
    case "drizzle":
      return "from-blue-400/75 via-sky-200/65 to-emerald-400/70";
    case "thunderstorm":
      return "from-blue-700/75 via-indigo-500/65 to-emerald-700/70";
    case "mist":
    case "fog":
      return "from-slate-100/85 via-sky-100/75 to-emerald-100/75";
    case "night":
      return "from-blue-700/70 via-indigo-700/65 to-emerald-900/70";
    default:
      return "from-blue-300/65 via-white/60 to-emerald-300/65";
  }
}

export function AnimatedWeatherHero({
  locationName,
  temperature,
  feelsLike,
  description,
  condition,
  humidity,
  windSpeed,
  pressure,
  visibility,
  observedAt,
  fetchedAt,
  isRealtime = false,
  isGpsLocation = false
}: AnimatedWeatherHeroProps) {
  const metricCards = [
    {
      icon: Droplets,
      label: "Độ ẩm",
      value: humidity === undefined ? "--" : `${humidity}%`
    },
    {
      icon: Wind,
      label: "Gió",
      value: windSpeed === undefined ? "--" : `${windSpeed} km/h`
    },
    {
      icon: Gauge,
      label: "Áp suất",
      value: pressure === undefined ? "--" : `${pressure} hPa`
    },
    {
      icon: Eye,
      label: "Tầm nhìn",
      value: formatVisibility(visibility)
    }
  ];

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={`weather-animated relative overflow-hidden rounded-[36px] bg-gradient-to-br p-[1.5px] shadow-[0_28px_90px_rgba(15,23,42,0.24)] ${getGradientBorderClass(condition)}`}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="weather-edge-glow absolute inset-[-35%] opacity-45" />
      <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-blue-950 via-slate-950 to-emerald-950 px-5 py-7 text-white md:px-7 md:py-8 lg:px-9">
        <WeatherBackgroundEffects
          condition={condition}
          intensity={condition === "thunderstorm" ? "high" : "medium"}
        />

        <div className="relative z-10 grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
                <MapPin aria-hidden className="h-4 w-4 shrink-0 text-red-200" />
                <span className="truncate">{locationName}</span>
              </span>
              <StatusBadge tone={isGpsLocation ? "success" : "neutral"}>
                {isGpsLocation ? "GPS thực tế" : "Điểm đại diện"}
              </StatusBadge>
              <StatusBadge tone={isRealtime ? "success" : "warning"}>
                {isRealtime ? "Thời gian thực" : "Dữ liệu demo"}
              </StatusBadge>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-8"
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                key={`${locationName}-${Math.round(temperature)}-${condition}`}
                transition={{ duration: 0.36, ease: "easeOut" }}
              >
                <p className="text-7xl font-black leading-none tracking-normal md:text-8xl lg:text-[6.5rem]">
                  {Math.round(temperature)}°
                </p>
                <p className="mt-3 text-xl font-black capitalize text-white md:text-2xl">
                  {description || "Đang cập nhật"}
                </p>
                <p className="mt-2 text-sm font-semibold text-white/80 md:text-base">
                  Cảm giác như {feelsLike === undefined ? "--" : `${Math.round(feelsLike)}°C`}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 grid gap-2 text-sm font-semibold text-white/80 sm:grid-cols-2">
              <p className="inline-flex items-center justify-center gap-2 lg:justify-start">
                <Clock aria-hidden className="h-4 w-4" />
                Cập nhật lúc {formatDateTime(fetchedAt)}
              </p>
              <p className="inline-flex items-center justify-center gap-2 lg:justify-start">
                <Navigation aria-hidden className="h-4 w-4" />
                Quan trắc {formatDateTime(observedAt)}
              </p>
            </div>
          </div>

          <motion.div
            animate="show"
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.07
                }
              }
            }}
          >
            {metricCards.map((metric) => {
              const Icon = metric.icon;

              return (
                <motion.article
                  className="min-h-[118px] rounded-[28px] border border-white/15 bg-white/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl"
                  key={metric.label}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Icon aria-hidden className="h-5 w-5 text-white/80" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">{metric.value}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function StatusBadge({
  children,
  tone
}: {
  children: React.ReactNode;
  tone: "success" | "warning" | "neutral";
}) {
  const className =
    tone === "success"
      ? "bg-emerald-300 text-emerald-950"
      : tone === "warning"
        ? "bg-amber-300 text-amber-950"
        : "bg-white/15 text-white";

  return (
    <span className={`rounded-full px-3 py-2 text-xs font-black shadow-sm ${className}`}>
      {children}
    </span>
  );
}
