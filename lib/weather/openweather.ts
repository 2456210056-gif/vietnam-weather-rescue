import { getDefaultWeatherLocation } from "@/lib/weather/locations";
import { getMockWeatherDashboardData } from "@/lib/weather/mock";
import type { WeatherDashboardData, WeatherLocation } from "@/types/weather";

type OpenWeatherCurrentResponse = {
  dt?: number;
  clouds?: {
    all?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  rain?: {
    "1h"?: number;
  };
  weather?: {
    id?: number;
    description?: string;
  }[];
  wind?: {
    speed?: number;
    deg?: number;
  };
  visibility?: number;
};

type OpenWeatherForecastResponse = {
  list?: {
    dt?: number;
    dt_txt?: string;
    main?: {
      temp?: number;
      temp_min?: number;
      temp_max?: number;
    };
    pop?: number;
    wind?: {
      speed?: number;
    };
  }[];
};

type OpenWeatherAirPollutionResponse = {
  list?: {
    main?: {
      aqi?: number;
    };
    components?: {
      pm2_5?: number;
      pm10?: number;
    };
  }[];
};

type TomorrowRealtimeResponse = {
  data?: {
    time?: string;
    values?: {
      uvIndex?: number;
      precipitationProbability?: number;
      windGust?: number;
    };
  };
};

type TomorrowForecastResponse = {
  timelines?: {
    hourly?: {
      time: string;
      values?: {
        temperature?: number;
        precipitationProbability?: number;
        windSpeed?: number;
        uvIndex?: number;
      };
    }[];
    daily?: {
      time: string;
      values?: {
        temperatureMax?: number;
        temperatureMin?: number;
        precipitationProbabilityAvg?: number;
        windSpeedMax?: number;
        uvIndexMax?: number;
      };
    }[];
  };
};

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const TOMORROW_BASE_URL = "https://api.tomorrow.io/v4/weather";

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function msToKmh(value: number) {
  return Math.round(value * 3.6 * 10) / 10;
}

function getAQIFromOpenWeatherScale(value: number | null) {
  if (value === null) {
    return null;
  }

  const scale: Record<number, number> = {
    1: 25,
    2: 75,
    3: 125,
    4: 175,
    5: 250
  };

  return scale[value] ?? null;
}

function getAQILevel(aqi: number | null): WeatherDashboardData["airQuality"]["level"] {
  if (aqi === null) return "moderate";
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy";
  if (aqi <= 200) return "very-unhealthy";
  return "hazardous";
}

function getAQILabel(aqi: number | null) {
  if (aqi === null) return "Chưa có dữ liệu";
  if (aqi <= 50) return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Không lành mạnh";
  if (aqi <= 200) return "Rất xấu";
  return "Nguy hại";
}

function formatHour(time: string | number) {
  const date = typeof time === "number" ? new Date(time * 1000) : new Date(time);

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit"
  }).format(date);
}

function formatDay(time: string | number) {
  const date = typeof time === "number" ? new Date(time * 1000) : new Date(time);

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function getWeatherAlert(data: WeatherDashboardData): WeatherDashboardData["alert"] {
  const maxWind = Math.max(...data.daily.map((day) => day.windSpeedMax), data.current.windSpeed);
  const maxRainProbability = Math.max(
    ...data.daily.map((day) => day.precipitationProbability),
    ...data.hourly.map((hour) => hour.precipitationProbability)
  );

  if (maxWind >= 62 || maxRainProbability >= 85) {
    return {
      severity: "warning",
      title: "Cảnh báo đỏ",
      message:
        "Nguy cơ mưa lớn, gió mạnh hoặc bão. Theo dõi bản đồ và chuẩn bị phương án an toàn."
    };
  }

  if (maxWind >= 39 || maxRainProbability >= 65) {
    return {
      severity: "watch",
      title: "Theo dõi thời tiết nguy hiểm",
      message: "Có khả năng mưa lớn hoặc gió mạnh trong 24-72 giờ tới."
    };
  }

  return {
    severity: "none",
    title: "Không có cảnh báo nghiêm trọng",
    message: "Dữ liệu hiện tại chưa ghi nhận nguy cơ bão mạnh."
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    const detail = response.status === 429 ? "quota exceeded" : `status ${response.status}`;
    throw new Error(`Weather provider failed: ${detail}`);
  }

  return (await response.json()) as T;
}

function getOpenWeatherUrl(path: string, location: WeatherLocation, cacheBust: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_OPENWEATHER_API_KEY.");
  }

  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    appid: apiKey,
    units: "metric",
    lang: "vi",
    _: String(cacheBust)
  });

  return `${OPENWEATHER_BASE_URL}/${path}?${params}`;
}

async function fetchOpenWeatherBundle(
  location: WeatherLocation,
  cacheBust: number,
  signal?: AbortSignal
) {
  const [current, forecast, airQuality] = await Promise.all([
    fetchJson<OpenWeatherCurrentResponse>(getOpenWeatherUrl("weather", location, cacheBust), signal),
    fetchJson<OpenWeatherForecastResponse>(
      getOpenWeatherUrl("forecast", location, cacheBust),
      signal
    ),
    fetchJson<OpenWeatherAirPollutionResponse>(
      getOpenWeatherUrl("air_pollution", location, cacheBust),
      signal
    )
  ]);

  return {
    current,
    forecast,
    airQuality
  };
}

async function fetchTomorrowRealtime(
  location: WeatherLocation,
  cacheBust: number,
  signal?: AbortSignal
) {
  const apiKey = process.env.NEXT_PUBLIC_TOMORROW_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    location: `${location.latitude},${location.longitude}`,
    apikey: apiKey,
    _: String(cacheBust)
  });

  return fetchJson<TomorrowRealtimeResponse>(
    `${TOMORROW_BASE_URL}/realtime?${params}`,
    signal
  ).catch(() => null);
}

async function fetchTomorrowForecast(
  location: WeatherLocation,
  cacheBust: number,
  signal?: AbortSignal
) {
  const apiKey = process.env.NEXT_PUBLIC_TOMORROW_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    location: `${location.latitude},${location.longitude}`,
    apikey: apiKey,
    _: String(cacheBust)
  });

  return fetchJson<TomorrowForecastResponse>(
    `${TOMORROW_BASE_URL}/forecast?${params}`,
    signal
  ).catch(() => null);
}

function buildHourlyForecast(
  openWeather: OpenWeatherForecastResponse,
  tomorrow: TomorrowForecastResponse | null
) {
  const tomorrowHourly = tomorrow?.timelines?.hourly;

  if (tomorrowHourly?.length) {
    return tomorrowHourly.slice(0, 24).map((point) => ({
      time: point.time,
      hour: formatHour(point.time),
      temperature: toNumber(point.values?.temperature),
      precipitationProbability: toNumber(point.values?.precipitationProbability),
      windSpeed: toNumber(point.values?.windSpeed)
    }));
  }

  return (openWeather.list ?? []).slice(0, 8).map((point) => ({
    time: point.dt_txt ?? new Date(toNumber(point.dt) * 1000).toISOString(),
    hour: formatHour(toNumber(point.dt)),
    temperature: toNumber(point.main?.temp),
    precipitationProbability: Math.round(toNumber(point.pop) * 100),
    windSpeed: msToKmh(toNumber(point.wind?.speed))
  }));
}

function buildDailyForecast(
  openWeather: OpenWeatherForecastResponse,
  tomorrow: TomorrowForecastResponse | null
) {
  const tomorrowDaily = tomorrow?.timelines?.daily;

  if (tomorrowDaily?.length) {
    return tomorrowDaily.slice(0, 7).map((point) => ({
      date: point.time,
      label: formatDay(point.time),
      temperatureMax: toNumber(point.values?.temperatureMax),
      temperatureMin: toNumber(point.values?.temperatureMin),
      precipitationProbability: toNumber(point.values?.precipitationProbabilityAvg),
      windSpeedMax: toNumber(point.values?.windSpeedMax),
      uvIndexMax: toNumber(point.values?.uvIndexMax)
    }));
  }

  const groups = new Map<
    string,
    {
      date: string;
      temps: number[];
      pops: number[];
      winds: number[];
    }
  >();

  (openWeather.list ?? []).forEach((point) => {
    const date = (point.dt_txt ?? new Date(toNumber(point.dt) * 1000).toISOString()).slice(0, 10);
    const group =
      groups.get(date) ??
      ({
        date,
        temps: [],
        pops: [],
        winds: []
      } satisfies {
        date: string;
        temps: number[];
        pops: number[];
        winds: number[];
      });

    group.temps.push(toNumber(point.main?.temp));
    group.pops.push(Math.round(toNumber(point.pop) * 100));
    group.winds.push(msToKmh(toNumber(point.wind?.speed)));
    groups.set(date, group);
  });

  return [...groups.values()].slice(0, 7).map((group) => ({
    date: group.date,
    label: formatDay(group.date),
    temperatureMax: Math.max(...group.temps),
    temperatureMin: Math.min(...group.temps),
    precipitationProbability: Math.max(...group.pops),
    windSpeedMax: Math.max(...group.winds),
    uvIndexMax: 0
  }));
}

export async function getWeatherDashboardData(locationId?: string, signal?: AbortSignal) {
  const location = getDefaultWeatherLocation(locationId);
  const cacheBust = Date.now();

  try {
    const [openWeather, tomorrowRealtime, tomorrowForecast] = await Promise.all([
      fetchOpenWeatherBundle(location, cacheBust, signal),
      fetchTomorrowRealtime(location, cacheBust, signal),
      fetchTomorrowForecast(location, cacheBust, signal)
    ]);

    const aqi = getAQIFromOpenWeatherScale(openWeather.airQuality.list?.[0]?.main?.aqi ?? null);
    const hourly = buildHourlyForecast(openWeather.forecast, tomorrowForecast);
    const daily = buildDailyForecast(openWeather.forecast, tomorrowForecast);
    const uvIndex = toNumber(
      tomorrowRealtime?.data?.values?.uvIndex ??
        tomorrowForecast?.timelines?.hourly?.[0]?.values?.uvIndex
    );

    const data: WeatherDashboardData = {
      source: "live",
      location,
      current: {
        temperature: toNumber(openWeather.current.main?.temp),
        apparentTemperature: toNumber(openWeather.current.main?.feels_like),
        humidity: toNumber(openWeather.current.main?.humidity),
        precipitation: toNumber(openWeather.current.rain?.["1h"]),
        cloudCover: toNumber(openWeather.current.clouds?.all),
        weatherCode: toNumber(openWeather.current.weather?.[0]?.id),
        windSpeed: msToKmh(toNumber(openWeather.current.wind?.speed)),
        windDirection: toNumber(openWeather.current.wind?.deg),
        pressure: toNumber(openWeather.current.main?.pressure),
        uvIndex,
        visibilityKm: Math.round(toNumber(openWeather.current.visibility) / 100) / 10,
        updatedAt: new Date(
          toNumber(openWeather.current.dt, Date.now() / 1000) * 1000
        ).toISOString()
      },
      airQuality: {
        aqi,
        pm25: openWeather.airQuality.list?.[0]?.components?.pm2_5 ?? null,
        pm10: openWeather.airQuality.list?.[0]?.components?.pm10 ?? null,
        label: getAQILabel(aqi),
        level: getAQILevel(aqi)
      },
      hourly,
      daily,
      alert: {
        severity: "none",
        title: "",
        message: ""
      }
    };

    return {
      ...data,
      alert: getWeatherAlert(data)
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Không thể tải API thời tiết.";
    return getMockWeatherDashboardData(location, reason);
  }
}
