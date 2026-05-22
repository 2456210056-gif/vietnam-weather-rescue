export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "thunderstorm"
  | "mist"
  | "fog"
  | "drizzle"
  | "night"
  | "unknown";

type MapWeatherConditionInput = {
  main?: string;
  description?: string;
  icon?: string;
  isNight?: boolean;
};

const MIST_LIKE = new Set([
  "mist",
  "haze",
  "smoke",
  "dust",
  "sand",
  "ash",
  "squall",
  "snow"
]);

export function mapWeatherCondition(input: MapWeatherConditionInput): WeatherCondition {
  const main = input.main?.trim().toLowerCase();
  const description = input.description?.trim().toLowerCase() ?? "";
  const icon = input.icon?.trim().toLowerCase();
  const isNight = Boolean(input.isNight || icon?.endsWith("n"));

  if (main === "thunderstorm" || description.includes("giông") || description.includes("dông")) {
    return "thunderstorm";
  }

  if (main === "drizzle" || description.includes("mưa phùn")) {
    return "drizzle";
  }

  if (main === "rain" || description.includes("mưa")) {
    return "rain";
  }

  if (main === "fog" || description.includes("sương mù")) {
    return "fog";
  }

  if ((main && MIST_LIKE.has(main)) || description.includes("sương") || description.includes("mù")) {
    return "mist";
  }

  if (main === "clouds" || description.includes("mây")) {
    return isNight ? "night" : "clouds";
  }

  if (main === "clear" || icon?.startsWith("01")) {
    return isNight ? "night" : "clear";
  }

  return isNight ? "night" : "unknown";
}
