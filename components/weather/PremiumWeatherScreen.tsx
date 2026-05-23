"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, RefreshCw } from "lucide-react";
import { PremiumDailyForecast, type PremiumDailyForecastItem } from "@/components/weather/PremiumDailyForecast";
import { PremiumHourlyForecast, type PremiumHourlyForecastItem } from "@/components/weather/PremiumHourlyForecast";
import { WeatherAlertCarousel } from "@/components/weather/WeatherAlertCarousel";
import { WeatherCinematicBackground } from "@/components/weather/WeatherCinematicBackground";
import { WeatherMetricsGrid } from "@/components/weather/WeatherMetricsGrid";
import { WeatherWarningBanner } from "@/components/weather/WeatherWarningBanner";
import { generateWeatherAlerts } from "@/lib/weather/weather-alerts";
import { mapWeatherCondition, type WeatherCondition } from "@/lib/weather/weather-condition";
import { getWeatherSummary } from "@/lib/weather/weather-summary";
import type { WeatherData, WeatherLocationMode } from "@/types/weather";

type PremiumWeatherScreenProps = {
  weather: WeatherData;
  mode: WeatherLocationMode;
  isRefreshing: boolean;
  onRefresh: () => void;
};

function buildHourlyItems(weather: WeatherData, condition: WeatherCondition): PremiumHourlyForecastItem[] {
  const baseTime = new Date(weather.observedAt);
  const offsets = [0, 0, 0.2, 0, -0.2, -0.8, -1, -0.7, -0.2, 0.4, 0.8, 1];
  const rainy = condition === "rain" || condition === "drizzle" || condition === "thunderstorm";

  return offsets.map((offset, index) => {
    const time = new Date(baseTime);
    time.setHours(baseTime.getHours() + index);

    return {
      time: time.toISOString(),
      temperature: weather.temperature + offset,
      precipitationChance: rainy ? Math.min(88, 36 + index * 3) : index % 3 === 0 ? 5 : 3,
      condition
    };
  });
}

function buildDailyItems(weather: WeatherData, condition: WeatherCondition): PremiumDailyForecastItem[] {
  const high = Math.round(Math.max(weather.temperature, weather.feelsLike ?? weather.temperature) + 1);
  const low = Math.round(Math.min(weather.temperature, weather.feelsLike ?? weather.temperature) - 1);
  const rainy = condition === "rain" || condition === "drizzle" || condition === "thunderstorm";

  return [
    {
      label: "Hôm qua",
      high,
      low,
      precipitationChance: rainy ? 39 : 8,
      condition
    },
    {
      label: "Hôm nay",
      high,
      low,
      precipitationChance: rainy ? 42 : 12,
      condition
    },
    {
      label: "Ngày mai",
      high: high + 1,
      low,
      precipitationChance: rainy ? 36 : 10,
      condition
    }
  ];
}

function buildHourlyItemsFromForecast(weather: WeatherData): PremiumHourlyForecastItem[] | null {
  if (!weather.forecastHourly?.length) {
    return null;
  }

  return weather.forecastHourly.slice(0, 12).map((item) => ({
    time: item.time,
    temperature: item.temperature ?? weather.temperature,
    precipitationChance: item.precipitationProbability,
    condition: mapWeatherCondition({
      main: item.main ?? item.condition,
      description: item.description,
      icon: weather.icon
    }),
    icon: weather.icon
  }));
}

export function PremiumWeatherScreen({
  weather,
  mode,
  isRefreshing,
  onRefresh
}: PremiumWeatherScreenProps) {
  const condition = mapWeatherCondition({
    description: weather.description,
    icon: weather.icon
  });
  const hourlyItems = buildHourlyItemsFromForecast(weather) ?? buildHourlyItems(weather, condition);
  const dailyItems = buildDailyItems(weather, condition);
  const alerts = generateWeatherAlerts({
    current: weather,
    hourly: weather.forecastHourly?.length ? weather.forecastHourly : hourlyItems,
    daily: dailyItems,
    providerAlerts: weather.providerAlerts,
    locationName: weather.locationName
  });
  const primaryAlert = alerts[0];
  const high = Math.round(Math.max(weather.temperature, weather.feelsLike ?? weather.temperature) + 1);
  const low = Math.round(Math.min(weather.temperature, weather.feelsLike ?? weather.temperature) - 1);

  return (
    <section className="relative overflow-hidden rounded-[40px] shadow-2xl shadow-blue-950/20 lg:min-h-[620px]">
      <WeatherCinematicBackground condition={condition} />

      <div className="relative z-10 mx-auto grid min-h-[82svh] max-w-7xl grid-cols-1 gap-6 px-5 pb-8 pt-10 text-white sm:px-7 lg:min-h-[620px] lg:grid-cols-12 lg:px-8 lg:py-8">
        {primaryAlert && (primaryAlert.severity === "warning" || primaryAlert.severity === "danger") ? (
          <div className="lg:col-span-12">
            <WeatherWarningBanner alert={primaryAlert} />
          </div>
        ) : null}

        <div className="min-w-0 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur-xl">
              <MapPin aria-hidden className="h-7 w-7 shrink-0" />
              <p className="truncate text-3xl font-black md:text-4xl">{weather.locationName}</p>
            </div>
            <button
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur-xl transition-transform duration-200 hover:scale-[1.04] disabled:opacity-60"
              disabled={isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw aria-hidden className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-10"
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              key={`${weather.locationName}-${Math.round(weather.temperature)}-${condition}`}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <p className="text-[6rem] font-light leading-none tracking-tight md:text-[8rem]">
                {Math.round(weather.temperature)}°
              </p>
              <p className="mt-3 text-4xl font-black capitalize">{weather.description}</p>
              <div className="mt-8 space-y-2 text-2xl font-black">
                <p>
                  ↑ {high}° / ↓ {low}°
                </p>
                <p>Cảm giác như {Math.round(weather.feelsLike)}°</p>
              </div>
              <p className="mt-7 max-w-2xl text-xl font-black leading-8 text-white/90 md:text-2xl md:leading-9">
                {getWeatherSummary(weather)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                  {weather.isRealtime ? "Thời gian thực" : "Dữ liệu demo"}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                  {mode === "gps" ? "GPS thực tế" : "Điểm đại diện"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="min-w-0 space-y-5 lg:col-span-5 lg:self-end">
          <WeatherAlertCarousel alerts={alerts} />
          <div className="rounded-[34px] border border-white/10 bg-blue-950/25 p-4 backdrop-blur-xl">
            <WeatherMetricsGrid
              feelsLike={weather.feelsLike}
              humidity={weather.humidity}
              pressure={weather.pressure}
              sourceLabel={weather.source === "openweather" ? "OpenWeather" : "Demo"}
              visibility={weather.visibility}
              windDeg={weather.windDeg}
              windSpeed={weather.windSpeed}
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-5 lg:col-span-12 xl:grid-cols-[1.15fr_0.85fr]">
          <PremiumHourlyForecast items={hourlyItems} />
          <PremiumDailyForecast items={dailyItems} />
        </div>
      </div>
    </section>
  );
}
