"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeatherData } from "@/types/weather";

export type WeatherQueryInput = {
  latitude: number;
  longitude: number;
  locationName: string;
};

type WeatherCurrentResponse = {
  weather: WeatherData;
  message?: string;
};

async function fetchCurrentWeather(input: WeatherQueryInput) {
  const params = new URLSearchParams({
    lat: String(input.latitude),
    lon: String(input.longitude),
    locationName: input.locationName
  });

  const response = await fetch(`/api/weather/current?${params}`, {
    cache: "no-store"
  });
  const payload = (await response.json().catch(() => ({}))) as WeatherCurrentResponse;

  if (!response.ok || !payload.weather) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu thời tiết.");
  }

  return payload.weather;
}

export function useWeather(input: WeatherQueryInput | null) {
  return useQuery({
    enabled: Boolean(input),
    queryKey: [
      "weather-current",
      input?.latitude,
      input?.longitude,
      input?.locationName
    ],
    queryFn: () => {
      if (!input) {
        throw new Error("Thiếu tọa độ thời tiết.");
      }

      return fetchCurrentWeather(input);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1
  });
}
