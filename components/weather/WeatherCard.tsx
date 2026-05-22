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
          Đang hiển thị dữ liệu demo. Vui lòng cấu hình API key để lấy dữ liệu thời gian thực.
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
          Thời tiết theo tỉnh/thành là dữ liệu tại điểm đại diện. Để chính xác nhất cho vị trí của
          bạn, hãy dùng GPS vị trí hiện tại.
        </p>
      ) : null}

      {!weather.isRealtime && weather.fallbackReason ? (
        <p className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
          Lý do fallback: {weather.fallbackReason}
        </p>
      ) : null}
    </section>
  );
}
