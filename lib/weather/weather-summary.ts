import type { WeatherData } from "@/types/weather";
import { mapWeatherCondition } from "@/lib/weather/weather-condition";

export function getWeatherSummary(data?: WeatherData | null) {
  if (!data) {
    return "Dữ liệu thời tiết đang được cập nhật.";
  }

  const condition = mapWeatherCondition({
    description: data.description,
    icon: data.icon
  });
  const low = Math.round(Math.min(data.temperature, data.feelsLike ?? data.temperature) - 1);

  if (condition === "rain" || condition === "drizzle") {
    return `Có khả năng mưa rào trong ngày. Thấp ${low} độ C.`;
  }

  if (condition === "thunderstorm") {
    return "Có nguy cơ giông, nên theo dõi cảnh báo và chuẩn bị phương án an toàn.";
  }

  if (condition === "clouds") {
    return "Trời nhiều mây, nhiệt độ tương đối ổn định trong ngày.";
  }

  if (condition === "mist" || condition === "fog") {
    return "Tầm nhìn có thể giảm, nên di chuyển chậm và bật định vị khi cần hỗ trợ.";
  }

  if (condition === "night") {
    return `Trời đêm dịu, mây nhẹ. Thấp ${low} độ C.`;
  }

  if (condition === "clear") {
    return "Trời quang, nắng nhẹ và điều kiện quan sát tốt.";
  }

  return "Dữ liệu thời tiết đang được cập nhật.";
}
