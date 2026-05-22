"use client";

import { motion } from "framer-motion";
import { CloudSun, Droplets, Eye, Gauge, Thermometer, Waves, Wind } from "lucide-react";
import { WeatherMetricCard } from "@/components/weather/WeatherMetricCard";

type WeatherMetricsGridProps = {
  humidity?: number;
  windSpeed?: number;
  windDeg?: number;
  pressure?: number;
  visibility?: number;
  feelsLike?: number;
  uvIndex?: number;
  aqi?: number;
  sourceLabel?: string;
};

function formatVisibility(value?: number) {
  if (!value) {
    return "--";
  }

  return `${Math.round(value / 100) / 10} km`;
}

function getAqiTone(aqi?: number) {
  if (aqi === undefined) {
    return "blue";
  }
  if (aqi <= 50) {
    return "green";
  }
  if (aqi <= 100) {
    return "amber";
  }
  return "red";
}

function getUvTone(uv?: number) {
  if (uv === undefined) {
    return "blue";
  }
  if (uv < 3) {
    return "green";
  }
  if (uv < 6) {
    return "amber";
  }
  return "red";
}

export function WeatherMetricsGrid({
  humidity,
  windSpeed,
  windDeg,
  pressure,
  visibility,
  feelsLike,
  uvIndex,
  aqi,
  sourceLabel
}: WeatherMetricsGridProps) {
  return (
    <motion.section
      animate="show"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      initial="hidden"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      <WeatherMetricCard
        icon={<Waves aria-hidden className="h-5 w-5" />}
        label="Độ ẩm"
        progress={humidity}
        tone="blue"
        value={humidity === undefined ? "--" : `${humidity}%`}
      />
      <WeatherMetricCard
        helper={windDeg === undefined ? "Hướng gió đang cập nhật" : `Hướng ${windDeg}°`}
        icon={<Wind aria-hidden className="h-5 w-5" />}
        label="Gió"
        tone="blue"
        value={windSpeed === undefined ? "--" : `${windSpeed} km/h`}
      />
      <WeatherMetricCard
        icon={<Gauge aria-hidden className="h-5 w-5" />}
        label="Áp suất"
        tone="default"
        value={pressure === undefined ? "--" : `${pressure} hPa`}
      />
      <WeatherMetricCard
        icon={<Eye aria-hidden className="h-5 w-5" />}
        label="Tầm nhìn"
        tone="green"
        value={formatVisibility(visibility)}
      />
      <WeatherMetricCard
        icon={<Thermometer aria-hidden className="h-5 w-5" />}
        label="Cảm giác"
        tone="amber"
        value={feelsLike === undefined ? "--" : `${Math.round(feelsLike)}°C`}
      />
      <WeatherMetricCard
        helper={sourceLabel}
        icon={<CloudSun aria-hidden className="h-5 w-5" />}
        label="Nguồn"
        tone="red"
        value={sourceLabel ?? "--"}
      />
      <WeatherMetricCard
        icon={<Droplets aria-hidden className="h-5 w-5" />}
        label="AQI"
        progress={aqi}
        tone={getAqiTone(aqi)}
        value={aqi === undefined ? "Đang cập nhật" : String(aqi)}
      />
      <WeatherMetricCard
        icon={<CloudSun aria-hidden className="h-5 w-5" />}
        label="UV"
        progress={uvIndex === undefined ? undefined : uvIndex * 10}
        tone={getUvTone(uvIndex)}
        value={uvIndex === undefined ? "Đang cập nhật" : String(uvIndex)}
      />
    </motion.section>
  );
}
