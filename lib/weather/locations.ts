import type { WeatherLocation } from "@/types/weather";
import {
  getVietnamLocationById,
  VIETNAM_34_LOCATIONS
} from "@/lib/weather/vietnam-34-locations";

export const DEFAULT_WEATHER_LOCATIONS: WeatherLocation[] = VIETNAM_34_LOCATIONS.map(
  (location) => ({
    id: location.id,
    name: location.name,
    province: location.name,
    latitude: location.latitude,
    longitude: location.longitude
  })
);

export function getDefaultWeatherLocation(locationId?: string) {
  const location = getVietnamLocationById(locationId);

  return {
    id: location.id,
    name: location.name,
    province: location.name,
    latitude: location.latitude,
    longitude: location.longitude
  } satisfies WeatherLocation;
}
