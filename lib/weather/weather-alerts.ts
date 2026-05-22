import type { WeatherAlert, WeatherAlertSeverity, WeatherData } from "@/types/weather";

type HourlyAlertInput = {
  time?: string;
  hour?: string;
  main?: string;
  condition?: string;
  description?: string;
  precipitationProbability?: number;
  precipitationChance?: number;
  probability?: number;
  rain?: number;
  rainVolume?: number;
  windSpeed?: number;
  pressure?: number;
};

type DailyAlertInput = {
  date?: string;
  label?: string;
  precipitationProbability?: number;
  precipitationChance?: number;
  windSpeedMax?: number;
  pressure?: number;
};

type ProviderAlertInput = {
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

type GenerateWeatherAlertsInput = {
  current?: Partial<WeatherData> | null;
  hourly?: HourlyAlertInput[] | null;
  daily?: DailyAlertInput[] | null;
  providerAlerts?: ProviderAlertInput[] | null;
  locationName?: string;
};

const SEVERITY_WEIGHT: Record<WeatherAlertSeverity, number> = {
  danger: 4,
  warning: 3,
  watch: 2,
  info: 1
};

function normalizeText(...values: Array<string | undefined>) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getProbability(item?: HourlyAlertInput | DailyAlertInput) {
  const value =
    item?.precipitationProbability ??
    item?.precipitationChance ??
    ("probability" in (item ?? {}) ? (item as HourlyAlertInput).probability : undefined);

  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function getExpectedTime(item?: HourlyAlertInput) {
  const value = item?.time ?? item?.hour;

  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function pushUnique(alerts: WeatherAlert[], alert: WeatherAlert) {
  if (!alerts.some((item) => item.type === alert.type)) {
    alerts.push(alert);
  }
}

function mapProviderSeverity(value?: string): WeatherAlertSeverity {
  const text = value?.toLowerCase() ?? "";

  if (text.includes("extreme") || text.includes("severe") || text.includes("danger")) {
    return "danger";
  }

  if (text.includes("warning") || text.includes("alert")) {
    return "warning";
  }

  if (text.includes("watch") || text.includes("moderate")) {
    return "watch";
  }

  return "warning";
}

export function generateWeatherAlerts({
  current,
  hourly,
  daily,
  providerAlerts,
  locationName
}: GenerateWeatherAlertsInput): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const upcoming = (hourly ?? []).slice(0, 6);
  const hasForecastData = upcoming.length > 0 || Boolean(current);

  for (const providerAlert of providerAlerts ?? []) {
    const title = providerAlert.title ?? providerAlert.event ?? providerAlert.headline ?? "Cảnh báo thời tiết";
    const message =
      providerAlert.message ??
      providerAlert.description ??
      "Có cảnh báo chính thức từ nguồn khí tượng. Hãy theo dõi bản đồ và chuẩn bị phương án an toàn.";

    pushUnique(alerts, {
      id: providerAlert.id ?? `provider-${alerts.length + 1}`,
      type: normalizeText(title, message).includes("wind") ? "wind" : "storm",
      severity: mapProviderSeverity(providerAlert.severity),
      title,
      message,
      expectedTime: providerAlert.start ?? providerAlert.startsAt ?? providerAlert.effective,
      source: "provider_alert"
    });
  }

  const thunderstormItem = upcoming.find((item) => {
    const text = normalizeText(item.main, item.condition, item.description);
    return text.includes("thunderstorm") || text.includes("storm") || text.includes("giông") || text.includes("dông") || text.includes("sấm");
  });

  if (thunderstormItem) {
    pushUnique(alerts, {
      id: "forecast-thunderstorm",
      type: "thunderstorm",
      severity: "warning",
      title: "Cảnh báo giông bão",
      message: "Có khả năng xảy ra giông, sấm sét trong thời gian tới. Hạn chế di chuyển ngoài trời và theo dõi bản đồ cảnh báo.",
      probability: getProbability(thunderstormItem),
      expectedTime: getExpectedTime(thunderstormItem),
      source: "forecast"
    });
  }

  const heavyRainItem = upcoming.find((item) => {
    const text = normalizeText(item.main, item.condition, item.description);
    const rainVolume = item.rainVolume ?? item.rain ?? 0;
    return text.includes("heavy rain") || text.includes("very heavy") || text.includes("mưa lớn") || rainVolume >= 10;
  });

  if (heavyRainItem) {
    pushUnique(alerts, {
      id: "forecast-heavy-rain",
      type: "heavy_rain",
      severity: "danger",
      title: "Cảnh báo mưa lớn",
      message: "Cảnh báo mưa lớn. Có nguy cơ ngập tại khu vực trũng thấp, hãy hạn chế di chuyển nếu không cần thiết.",
      probability: getProbability(heavyRainItem),
      expectedTime: getExpectedTime(heavyRainItem),
      source: "forecast"
    });
  }

  const rainItem = upcoming.find((item) => {
    const text = normalizeText(item.main, item.condition, item.description);
    const probability = getProbability(item) ?? 0;
    return probability >= 40 || text.includes("rain") || text.includes("drizzle") || text.includes("mưa");
  });

  if (rainItem) {
    pushUnique(alerts, {
      id: "forecast-rain",
      type: "rain",
      severity: "watch",
      title: "Mưa sắp tới",
      message: "Có khả năng có mưa trong vài giờ tới. Hãy chuẩn bị áo mưa và theo dõi bản đồ mưa.",
      probability: getProbability(rainItem),
      expectedTime: getExpectedTime(rainItem),
      source: "forecast"
    });
  }

  const windFromHourly = upcoming.find((item) => (item.windSpeed ?? 0) >= 39);
  const windFromDaily = (daily ?? []).find((item) => (item.windSpeedMax ?? 0) >= 39);
  const currentWindSpeed = current?.windSpeed ?? 0;
  const windSpeed = Math.max(currentWindSpeed, windFromHourly?.windSpeed ?? 0, windFromDaily?.windSpeedMax ?? 0);

  if (windSpeed >= 39) {
    pushUnique(alerts, {
      id: "forecast-wind",
      type: "wind",
      severity: windSpeed >= 62 ? "warning" : "watch",
      title: "Cảnh báo gió mạnh",
      message: "Cảnh báo gió mạnh. Cẩn thận khi di chuyển, đặc biệt ở khu vực trống trải.",
      expectedTime: getExpectedTime(windFromHourly),
      source: "forecast"
    });
  }

  const lowestPressure = Math.min(
    current?.pressure ?? Number.POSITIVE_INFINITY,
    ...upcoming.map((item) => item.pressure ?? Number.POSITIVE_INFINITY),
    ...(daily ?? []).map((item) => item.pressure ?? Number.POSITIVE_INFINITY)
  );

  if (windSpeed >= 50 && lowestPressure <= 1000 && (thunderstormItem || heavyRainItem)) {
    pushUnique(alerts, {
      id: "forecast-storm-risk",
      type: "storm",
      severity: "warning",
      title: "Có dấu hiệu thời tiết nguy hiểm",
      message: "Có dấu hiệu thời tiết nguy hiểm. Hãy cập nhật liên tục từ nguồn khí tượng; hệ thống chưa ghi nhận cảnh báo bão chính thức.",
      probability: Math.max(getProbability(thunderstormItem) ?? 0, getProbability(heavyRainItem) ?? 0) || undefined,
      expectedTime: getExpectedTime(thunderstormItem ?? heavyRainItem),
      source: "forecast"
    });
  }

  if (alerts.length === 0) {
    const isFallback = current?.source === "fallback" || !hasForecastData;

    alerts.push({
      id: isFallback ? "fallback-alert-status" : "stable-weather",
      type: "stable",
      severity: "info",
      title: "Cảnh báo thời tiết",
      message: isFallback
        ? "Dữ liệu cảnh báo đang được cập nhật. Hãy theo dõi thêm bản đồ thời tiết và các nguồn khí tượng chính thức."
        : `Điều kiện thời tiết tại ${locationName ?? current?.locationName ?? "khu vực này"} hiện tương đối ổn định. Tiếp tục theo dõi khi di chuyển.`,
      probability: isFallback ? undefined : 12,
      source: isFallback ? "fallback" : "forecast"
    });
  }

  return alerts
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .slice(0, 3);
}
