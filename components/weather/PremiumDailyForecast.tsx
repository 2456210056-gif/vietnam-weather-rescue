"use client";

import { Cloud, CloudRain, Droplets, Sun } from "lucide-react";

export type PremiumDailyForecastItem = {
  label: string;
  high: number;
  low: number;
  precipitationChance?: number;
  condition?: string;
};

type PremiumDailyForecastProps = {
  items: PremiumDailyForecastItem[];
};

function WeatherIcon({ condition }: { condition?: string }) {
  if (condition === "rain" || condition === "drizzle" || condition === "thunderstorm") {
    return <CloudRain aria-hidden className="h-7 w-7" />;
  }

  if (condition === "clear") {
    return <Sun aria-hidden className="h-7 w-7" />;
  }

  return <Cloud aria-hidden className="h-7 w-7" />;
}

export function PremiumDailyForecast({ items }: PremiumDailyForecastProps) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-blue-950/35 p-5 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
      <div className="grid gap-4">
        {items.map((item) => (
          <article className="grid grid-cols-[1fr_auto_auto] items-center gap-4" key={item.label}>
            <p className="text-xl font-black">{item.label}</p>
            <div className="flex items-center gap-3 text-white/85">
              <span className="inline-flex items-center gap-1 text-sm font-bold">
                <Droplets aria-hidden className="h-4 w-4" />
                {item.precipitationChance ?? 0}%
              </span>
              <WeatherIcon condition={item.condition} />
            </div>
            <p className="text-xl font-black">
              {Math.round(item.high)}° {Math.round(item.low)}°
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
