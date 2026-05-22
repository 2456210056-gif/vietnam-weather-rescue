import type { SeaArea } from "@/lib/map/sovereignty";

export type SeaWeather = {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  weatherCode: number | null;
  updatedAt: string;
  source: "live" | "demo";
};

function getMockSeaWeather(area: SeaArea): SeaWeather {
  return {
    temperature: area.id === "hoang-sa" ? 29 : 28,
    humidity: 78,
    windSpeed: area.id === "hoang-sa" ? 24 : 21,
    windDirection: area.id === "hoang-sa" ? 110 : 135,
    weatherCode: 803,
    updatedAt: new Date().toISOString(),
    source: "demo"
  };
}

export async function fetchSeaWeather(area: SeaArea, signal?: AbortSignal) {
  const cacheBust = Date.now();
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return getMockSeaWeather(area);
  }

  const params = new URLSearchParams({
    lat: String(area.latitude),
    lon: String(area.longitude),
    appid: apiKey,
    units: "metric",
    lang: "vi",
    _: String(cacheBust)
  });

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, {
      cache: "no-store",
      signal
    });

    if (!response.ok) {
      return getMockSeaWeather(area);
    }

    const payload = (await response.json()) as {
      dt?: number;
      main?: {
        temp?: number;
        humidity?: number;
      };
      wind?: {
        speed?: number;
        deg?: number;
      };
      weather?: {
        id?: number;
      }[];
    };

    return {
      temperature: payload.main?.temp ?? null,
      humidity: payload.main?.humidity ?? null,
      windSpeed: payload.wind?.speed ? Math.round(payload.wind.speed * 3.6 * 10) / 10 : null,
      windDirection: payload.wind?.deg ?? null,
      weatherCode: payload.weather?.[0]?.id ?? null,
      updatedAt: payload.dt ? new Date(payload.dt * 1000).toISOString() : new Date().toISOString(),
      source: "live"
    } satisfies SeaWeather;
  } catch {
    return getMockSeaWeather(area);
  }
}

export function describeWeatherCode(code: number | null) {
  if (code === null) {
    return "Chưa có mô tả";
  }

  if (code >= 200 && code < 300) {
    return "Dông lốc";
  }

  if (code >= 300 && code < 600) {
    return "Có mưa";
  }

  if (code >= 600 && code < 700) {
    return "Mưa tuyết";
  }

  if (code >= 700 && code < 800) {
    return "Sương mù hoặc tầm nhìn kém";
  }

  if (code === 800) {
    return "Trời quang";
  }

  if (code > 800 && code < 900) {
    return "Có mây";
  }

  return "Biến động thời tiết";
}
