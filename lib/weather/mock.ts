import type { WeatherDashboardData, WeatherLocation } from "@/types/weather";

function formatHour(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit"
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

export function getMockWeatherDashboardData(
  location: WeatherLocation,
  fallbackReason = "Dữ liệu demo vì API thời tiết chưa khả dụng."
): WeatherDashboardData {
  const now = new Date();
  const hourly = Array.from({ length: 24 }).map((_, index) => {
    const time = new Date(now.getTime() + index * 60 * 60 * 1000);
    const dayCurve = Math.sin((index / 24) * Math.PI);

    return {
      time: time.toISOString(),
      hour: formatHour(time),
      temperature: Math.round((27 + dayCurve * 4 + (index % 3) * 0.4) * 10) / 10,
      precipitationProbability: index % 5 === 0 ? 55 : 25 + (index % 4) * 8,
      windSpeed: 12 + (index % 6) * 2
    };
  });

  const daily = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);

    return {
      date: date.toISOString(),
      label: formatDay(date),
      temperatureMax: 30 + (index % 3),
      temperatureMin: 24 + (index % 2),
      precipitationProbability: 35 + (index % 4) * 10,
      windSpeedMax: 22 + index * 2,
      uvIndexMax: 6 + (index % 3)
    };
  });

  return {
    source: "demo",
    fallbackReason,
    location,
    current: {
      temperature: 28,
      apparentTemperature: 31,
      humidity: 76,
      precipitation: 0.8,
      cloudCover: 50,
      weatherCode: 803,
      windSpeed: 18,
      windDirection: 120,
      pressure: 1008,
      uvIndex: 6.2,
      visibilityKm: 10,
      updatedAt: now.toISOString()
    },
    airQuality: {
      aqi: 45,
      pm25: 14,
      pm10: 32,
      label: "Tốt",
      level: "good"
    },
    hourly,
    daily,
    alert: {
      severity: "watch",
      title: "Dữ liệu demo cảnh báo",
      message:
        "Chưa kết nối được API thời tiết thật. Hệ thống đang hiển thị dữ liệu demo để giữ giao diện ổn định."
    }
  };
}
