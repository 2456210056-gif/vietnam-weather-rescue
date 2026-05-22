"use client";

import { RefreshCw } from "lucide-react";
import { AnimatedWeatherHero } from "@/components/weather/AnimatedWeatherHero";
import {
  HourlyForecastCarousel,
  type HourlyForecastItem
} from "@/components/weather/HourlyForecastCarousel";
import { WeatherMetricsGrid } from "@/components/weather/WeatherMetricsGrid";
import { WeatherWarningBanner } from "@/components/weather/WeatherWarningBanner";
import {
  mapWeatherCondition,
  type WeatherCondition
} from "@/lib/weather/weather-condition";
import type { WeatherData, WeatherLocationMode } from "@/types/weather";

type WeatherCardProps = {
  weather: WeatherData;
  mode: WeatherLocationMode;
  isRefreshing: boolean;
  onRefresh: () => void;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function buildHourlyPreview(weather: WeatherData, condition: WeatherCondition): HourlyForecastItem[] {
  const baseTime = new Date(weather.observedAt);
  const shouldShowRainChance =
    condition === "rain" || condition === "drizzle" || condition === "thunderstorm";

  return Array.from({ length: 12 }, (_, index) => {
    const time = new Date(baseTime);
    time.setHours(baseTime.getHours() + index);

    const offset = [0, 1, 1.5, 1, 0, -0.5, -1, -1.2, -0.8, 0, 0.6, 1][index] ?? 0;

    return {
      time: time.toISOString(),
      label: index === 0 ? "Bây giờ" : undefined,
      temperature: weather.temperature + offset,
      description: weather.description,
      precipitationProbability: shouldShowRainChance
        ? Math.min(90, 42 + index * (condition === "thunderstorm" ? 5 : 3))
        : undefined,
      condition
    };
  });
}

function getWarning(condition: WeatherCondition) {
  if (condition === "thunderstorm") {
    return {
      severity: "high" as const,
      title: "Cảnh báo giông lốc",
      message:
        "Hạn chế di chuyển ngoài trời, theo dõi bản đồ cứu hộ và chuẩn bị phương án an toàn."
    };
  }

  if (condition === "rain" || condition === "drizzle") {
    return {
      severity: "medium" as const,
      title: "Cảnh báo mưa lớn",
      message:
        "Có thể xuất hiện ngập cục bộ. Theo dõi bản đồ và dùng SOS nếu cần hỗ trợ trong phạm vi ứng dụng."
    };
  }

  if (condition === "fog" || condition === "mist") {
    return {
      severity: "low" as const,
      title: "Tầm nhìn hạn chế",
      message: "Di chuyển chậm, bật đèn cảnh báo và ưu tiên dùng GPS khi gửi SOS."
    };
  }

  return {
    severity: "none" as const
  };
}

export function WeatherCard({ weather, mode, isRefreshing, onRefresh }: WeatherCardProps) {
  const condition = mapWeatherCondition({
    description: weather.description,
    icon: weather.icon
  });
  const warning = getWarning(condition);
  const hourlyItems = buildHourlyPreview(weather, condition);

  return (
    <section className="space-y-4 lg:space-y-5">
      {!weather.isRealtime ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black leading-6 text-amber-950 shadow-soft">
          Đang hiển thị dữ liệu demo. Vui lòng cấu hình API key để lấy dữ liệu thời gian thực.
        </div>
      ) : null}

      <WeatherWarningBanner
        message={warning.message}
        severity={warning.severity}
        title={warning.title}
      />

      <div className="relative">
        <AnimatedWeatherHero
          condition={condition}
          description={weather.description}
          feelsLike={weather.feelsLike}
          fetchedAt={weather.fetchedAt}
          humidity={weather.humidity}
          isGpsLocation={mode === "gps"}
          isRealtime={weather.isRealtime}
          locationName={weather.locationName}
          observedAt={weather.observedAt}
          pressure={weather.pressure}
          temperature={weather.temperature}
          visibility={weather.visibility}
          windSpeed={weather.windSpeed}
        />

        <button
          className="absolute right-4 top-4 z-20 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-blue-950/20 transition-transform duration-200 hover:scale-[1.02] disabled:bg-slate-500 md:right-6 md:top-6 md:px-4 md:py-3 md:text-sm"
          disabled={isRefreshing}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <HourlyForecastCarousel items={hourlyItems} />

      <WeatherMetricsGrid
        feelsLike={weather.feelsLike}
        humidity={weather.humidity}
        pressure={weather.pressure}
        sourceLabel={weather.source === "openweather" ? "OpenWeather" : "Demo"}
        visibility={weather.visibility}
        windDeg={weather.windDeg}
        windSpeed={weather.windSpeed}
      />

      <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/90 p-4 text-sm font-semibold leading-6 text-slate-600 shadow-soft backdrop-blur-xl md:grid-cols-2">
        <p>Thời điểm quan trắc: {formatDateTime(weather.observedAt)}</p>
        <p>Thời điểm hệ thống cập nhật: {formatDateTime(weather.fetchedAt)}</p>
        <p className="md:col-span-2">
          Tọa độ gọi API: {weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)}
        </p>
      </div>

      {mode === "representative" ? (
        <p className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
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
