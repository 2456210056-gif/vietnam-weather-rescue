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
  forecastHourly?: WeatherForecastAlertPoint[];
  providerAlerts?: WeatherProviderAlert[];
};

export type WeatherLocationMode = "gps" | "representative";

export type WeatherAlertType =
  | "rain"
  | "heavy_rain"
  | "storm"
  | "thunderstorm"
  | "wind"
  | "flood"
  | "stable";

export type WeatherAlertSeverity = "info" | "watch" | "warning" | "danger";

export type WeatherAlert = {
  id: string;
  type: WeatherAlertType;
  severity: WeatherAlertSeverity;
  title: string;
  message: string;
  probability?: number;
  expectedTime?: string;
  source: "forecast" | "provider_alert" | "fallback";
};

export type WeatherForecastAlertPoint = {
  time: string;
  temperature?: number;
  precipitationProbability?: number;
  rainVolume?: number;
  windSpeed?: number;
  pressure?: number;
  main?: string;
  description?: string;
  condition?: string;
};

export type WeatherProviderAlert = {
  id?: string;
  event?: string;
  title?: string;
  headline?: string;
  description?: string;
  message?: string;
  severity?: string;
  start?: string;
  startsAt?: string;
  effective?: string;
};

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
