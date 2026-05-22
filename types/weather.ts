export type WeatherLocation = {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
};

export type VietnamLocation = {
  id: string;
  name: string;
  type: "province" | "city";
  representativeCity: string;
  latitude: number;
  longitude: number;
  mergedFrom?: string[];
};

export type WeatherData = {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg?: number;
  visibility?: number;
  description: string;
  icon?: string;
  source: "openweather" | "fallback";
  observedAt: string;
  fetchedAt: string;
  isRealtime: boolean;
  fallbackReason?: string;
};

export type WeatherLocationMode = "gps" | "representative";

export type HourlyForecastPoint = {
  time: string;
  hour: string;
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
};

export type DailyForecastPoint = {
  date: string;
  label: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
};

export type WeatherDashboardData = {
  source: "live" | "demo";
  fallbackReason?: string;
  location: WeatherLocation;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    cloudCover: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    uvIndex: number;
    visibilityKm: number;
    updatedAt: string;
  };
  airQuality: {
    aqi: number | null;
    pm25: number | null;
    pm10: number | null;
    label: string;
    level: "good" | "moderate" | "unhealthy" | "very-unhealthy" | "hazardous";
  };
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  alert: {
    severity: "none" | "watch" | "warning";
    title: string;
    message: string;
  };
};
