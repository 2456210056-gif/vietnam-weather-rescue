"use client";

import { PremiumWeatherScreen } from "@/components/weather/PremiumWeatherScreen";
import type { WeatherData, WeatherLocationMode } from "@/types/weather";

type WeatherCardProps = {
  weather: WeatherData;
  mode: WeatherLocationMode;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function WeatherCard({ weather, mode, isRefreshing, onRefresh }: WeatherCardProps) {
  return (
    <section className="space-y-4">
      {!weather.isRealtime ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black leading-6 text-amber-950 shadow-soft">
          Dữ liệu demo. Cấu hình API key để xem thời tiết thật.
        </div>
      ) : null}

      <PremiumWeatherScreen
        isRefreshing={isRefreshing}
        mode={mode}
        onRefresh={onRefresh}
        weather={weather}
      />

      {mode === "representative" ? (
        <p className="rounded-[24px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-900">
          Dữ liệu theo điểm đại diện. Dùng GPS để chính xác hơn.
        </p>
      ) : null}

      {!weather.isRealtime && weather.fallbackReason ? (
        <p className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
          Fallback: {weather.fallbackReason}
        </p>
      ) : null}
    </section>
  );
}
