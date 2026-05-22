import type { WeatherData } from "@/types/weather";

type CurrentWeatherParams = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

type OpenWeatherCurrentResponse = {
  name?: string;
  dt?: number;
  coord?: {
    lat?: number;
    lon?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: {
    description?: string;
    icon?: string;
  }[];
  wind?: {
    speed?: number;
    deg?: number;
  };
  visibility?: number;
};

const OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function msToKmh(value: number) {
  return Math.round(value * 3.6 * 10) / 10;
}

function buildFallbackWeather(params: CurrentWeatherParams, reason: string): WeatherData {
  const now = new Date().toISOString();

  return {
    locationName: params.locationName ?? "Điểm đại diện Việt Nam",
    latitude: params.latitude,
    longitude: params.longitude,
    temperature: 28,
    feelsLike: 31,
    humidity: 74,
    pressure: 1008,
    windSpeed: 12,
    windDeg: 120,
    visibility: 10000,
    description: "Dữ liệu demo khi chưa lấy được API thời gian thực",
    source: "fallback",
    observedAt: now,
    fetchedAt: now,
    isRealtime: false,
    fallbackReason: reason
  };
}

export async function getCurrentWeather(params: CurrentWeatherParams): Promise<WeatherData> {
  const apiKey =
    process.env.OPENWEATHER_API_KEY?.trim() ??
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return buildFallbackWeather(params, "Chưa cấu hình OPENWEATHER_API_KEY.");
  }

  const fetchedAt = new Date().toISOString();
  const searchParams = new URLSearchParams({
    lat: String(params.latitude),
    lon: String(params.longitude),
    appid: apiKey,
    units: "metric",
    lang: "vi",
    _: String(Date.now())
  });

  try {
    const response = await fetch(`${OPENWEATHER_CURRENT_URL}?${searchParams}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const detail = response.status === 429 ? "OpenWeather quota exceeded" : `HTTP ${response.status}`;
      return buildFallbackWeather(params, detail);
    }

    const data = (await response.json()) as OpenWeatherCurrentResponse;
    const observedAt = data.dt ? new Date(data.dt * 1000).toISOString() : fetchedAt;

    return {
      locationName: params.locationName ?? data.name ?? "Vị trí hiện tại",
      latitude: toNumber(data.coord?.lat, params.latitude),
      longitude: toNumber(data.coord?.lon, params.longitude),
      temperature: Math.round(toNumber(data.main?.temp) * 10) / 10,
      feelsLike: Math.round(toNumber(data.main?.feels_like) * 10) / 10,
      humidity: toNumber(data.main?.humidity),
      pressure: toNumber(data.main?.pressure),
      windSpeed: msToKmh(toNumber(data.wind?.speed)),
      windDeg: data.wind?.deg,
      visibility: data.visibility,
      description: data.weather?.[0]?.description ?? "Đang cập nhật",
      icon: data.weather?.[0]?.icon,
      source: "openweather",
      observedAt,
      fetchedAt,
      isRealtime: true
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Không thể gọi OpenWeather.";
    return buildFallbackWeather(params, reason);
  }
}
