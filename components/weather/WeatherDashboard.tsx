"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { WeatherLocationSelector } from "@/components/weather/WeatherLocationSelector";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import {
  DEFAULT_VIETNAM_LOCATION_ID,
  getVietnamLocationById
} from "@/lib/weather/vietnam-34-locations";
import type { WeatherLocationMode } from "@/types/weather";

const STORAGE_KEY = "selectedWeatherLocationId";

function getInitialLocationId() {
  if (typeof window === "undefined") {
    return DEFAULT_VIETNAM_LOCATION_ID;
  }

  return getVietnamLocationById(window.localStorage.getItem(STORAGE_KEY)).id;
}

export function WeatherDashboard() {
  const geolocation = useGeolocation();
  const [locationId, setLocationId] = useState(getInitialLocationId);
  const [mode, setMode] = useState<WeatherLocationMode>("representative");
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const selectedLocation = useMemo(() => getVietnamLocationById(locationId), [locationId]);
  const weatherInput = useMemo(() => {
    if (mode === "gps" && gpsLocation) {
      return {
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        locationName: "Vị trí hiện tại"
      };
    }

    return {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      locationName: selectedLocation.name
    };
  }, [gpsLocation, mode, selectedLocation]);

  const weatherQuery = useWeather(weatherInput);

  async function handleUseCurrentLocation() {
    const position = await geolocation.requestLocation();

    if (!position) {
      return;
    }

    setGpsLocation({
      latitude: position.latitude,
      longitude: position.longitude
    });
    setMode("gps");
  }

  return (
    <div className="space-y-4">
      <WeatherLocationSelector
        geolocationStatus={geolocation.status}
        isRefreshing={weatherQuery.isFetching}
        mode={mode}
        onRefresh={() => void weatherQuery.refetch()}
        onSelectLocation={(location) => {
          setLocationId(location.id);
          setMode("representative");
          window.localStorage.setItem(STORAGE_KEY, location.id);
        }}
        onUseCurrentLocation={() => void handleUseCurrentLocation()}
        selectedLocationId={locationId}
      />

      {geolocation.status === "permission_denied" ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
          {geolocation.message}
        </p>
      ) : null}

      {weatherQuery.isLoading && !weatherQuery.data ? (
        <WeatherSkeleton />
      ) : null}

      {weatherQuery.error ? (
        <div className="rounded-3xl border border-red-100 bg-white/90 p-5 shadow-soft">
          <p className="flex items-center gap-2 font-black text-red-700">
            <AlertCircle aria-hidden className="h-5 w-5" />
            Không thể tải dữ liệu thời tiết.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kiểm tra route `/api/weather/current`, cấu hình `OPENWEATHER_API_KEY` hoặc
            `NEXT_PUBLIC_OPENWEATHER_API_KEY`, rồi thử lại. Khi thiếu key, API nội bộ sẽ trả dữ
            liệu demo có badge rõ ràng.
          </p>
          <button
            className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
            onClick={() => void weatherQuery.refetch()}
            type="button"
          >
            Thử lại
          </button>
        </div>
      ) : null}

      {weatherQuery.data ? (
        <WeatherCard
          isRefreshing={weatherQuery.isFetching}
          mode={mode}
          onRefresh={() => void weatherQuery.refetch()}
          weather={weatherQuery.data}
        />
      ) : null}
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
        <Loader2 aria-hidden className="h-5 w-5 animate-spin text-red-600" />
        Đang tải thời tiết thời gian thực...
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" key={index} />
        ))}
      </div>
    </div>
  );
}
