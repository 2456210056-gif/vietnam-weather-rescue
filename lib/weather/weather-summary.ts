import type { WeatherData } from "@/types/weather";
import { mapWeatherCondition } from "@/lib/weather/weather-condition";

export function getWeatherSummary(data?: WeatherData | null) {
  if (!data) {
    return "Dữ liệu đang cập nhật.";
  }

  const condition = mapWeatherCondition({
    description: data.description,
    icon: data.icon
  });
  const low = Math.round(Math.min(data.temperature, data.feelsLike ?? data.temperature) - 1);

  if (condition === "rain" || condition === "drizzle") {
    return `Có thể có mưa. Thấp ${low}°C.`;
  }

  if (condition === "thunderstorm") {
    return "Có nguy cơ giông. Theo dõi cảnh báo.";
  }

  if (condition === "clouds") {
    return "Nhiều mây, nhiệt độ ổn định.";
  }

  if (condition === "mist" || condition === "fog") {
    return "Tầm nhìn giảm, di chuyển chậm.";
  }

  if (condition === "night") {
    return `Đêm dịu, thấp ${low}°C.`;
  }

  if (condition === "clear") {
    return "Trời quang, quan sát tốt.";
  }

  return "Dữ liệu đang cập nhật.";
}
