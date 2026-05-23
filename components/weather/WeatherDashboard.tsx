"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { WeatherLocationSelector } from "@/components/weather/WeatherLocationSelector";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import {
  getSavedWeatherLocation,
  saveWeatherLocation,
  subscribeWeatherLocation,
  type SavedWeatherLocation
} from "@/lib/weather/location-storage";
import {
  DEFAULT_VIETNAM_LOCATION_ID,
  getVietnamLocationById
} from "@/lib/weather/vietnam-34-locations";
import type { WeatherLocationMode } from "@/types/weather";

const LEGACY_LOCATION_ID_STORAGE_KEY = "selectedWeatherLocationId";
let cachedLegacyLocationId: string | null = null;
let cachedLegacyLocation: SavedWeatherLocation | null = null;

function createLocationFromVietnamId(id?: string | null): SavedWeatherLocation {
  const location = getVietnamLocationById(id);

  return {
    lat: location.latitude,
    lon: location.longitude,
    locationName: location.name,
    source: location.id === DEFAULT_VIETNAM_LOCATION_ID ? "default" : "manual",
    updatedAt: 0,
    locationId: location.id
  };
}

function getLegacySavedLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const legacyLocationId = window.localStorage.getItem(LEGACY_LOCATION_ID_STORAGE_KEY);

  if (!legacyLocationId) {
    cachedLegacyLocationId = null;
    cachedLegacyLocation = null;
    return null;
  }

  if (legacyLocationId === cachedLegacyLocationId) {
    return cachedLegacyLocation;
  }

  cachedLegacyLocationId = legacyLocationId;
  cachedLegacyLocation = {
    ...createLocationFromVietnamId(legacyLocationId),
    source: "manual" as const
  };

  return cachedLegacyLocation;
}

function getStoredWeatherLocation() {
  return getSavedWeatherLocation() ?? getLegacySavedLocation();
}

function subscribeHydration() {
  return () => {};
}

export function WeatherDashboard() {
  const geolocation = useGeolocation();
  const hasHydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const storedWeatherLocation = useSyncExternalStore(
    subscribeWeatherLocation,
    getStoredWeatherLocation,
    () => null
  );
  const defaultLocation = useMemo(
    () => createLocationFromVietnamId(DEFAULT_VIETNAM_LOCATION_ID),
    []
  );

  const selectedWeatherLocation = hasHydrated
    ? storedWeatherLocation ?? defaultLocation
    : null;
  const selectorLocation = selectedWeatherLocation ?? defaultLocation;
  const locationId = selectorLocation.locationId ?? DEFAULT_VIETNAM_LOCATION_ID;
  const mode: WeatherLocationMode =
    selectorLocation.source === "gps" ? "gps" : "representative";

  const weatherInput = useMemo(() => {
    if (!selectedWeatherLocation) {
      return null;
    }

    return {
      latitude: selectedWeatherLocation.lat,
      longitude: selectedWeatherLocation.lon,
      locationName: selectedWeatherLocation.locationName
    };
  }, [selectedWeatherLocation]);

  const weatherQuery = useWeather(weatherInput);

  async function handleUseCurrentLocation() {
    const position = await geolocation.requestLocation();

    if (!position) {
      return;
    }

    saveWeatherLocation({
      lat: position.latitude,
      lon: position.longitude,
      locationName: "Vị trí hiện tại",
      source: "gps",
      updatedAt: Date.now()
    });
  }

  function handleRefresh() {
    if (weatherInput) {
      void weatherQuery.refetch();
    }
  }

  return (
    <div className="space-y-6">
      <WeatherLocationSelector
        geolocationStatus={geolocation.status}
        isRefreshing={weatherQuery.isFetching}
        mode={mode}
        onRefresh={handleRefresh}
        onSelectLocation={(location) => {
          const nextLocation: SavedWeatherLocation = {
            lat: location.latitude,
            lon: location.longitude,
            locationName: location.name,
            source: "manual",
            updatedAt: Date.now(),
            locationId: location.id
          };

          saveWeatherLocation(nextLocation);
          window.localStorage.setItem(LEGACY_LOCATION_ID_STORAGE_KEY, location.id);
        }}
        onUseCurrentLocation={() => void handleUseCurrentLocation()}
        selectedLocationId={locationId}
      />

      {geolocation.status === "permission_denied" ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
          {geolocation.message}
        </p>
      ) : null}

      {(weatherQuery.isLoading || !selectedWeatherLocation) && !weatherQuery.data ? (
        <WeatherSkeleton />
      ) : null}

      {weatherQuery.error ? (
        <div className="rounded-3xl border border-red-100 bg-white/90 p-5 shadow-soft">
          <p className="flex items-center gap-2 font-black text-red-700">
            <AlertCircle aria-hidden className="h-5 w-5" />
            Không thể tải thời tiết.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kiểm tra API key hoặc thử lại với dữ liệu demo.
          </p>
          <button
            className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
            onClick={handleRefresh}
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
          onRefresh={handleRefresh}
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
        Đang tải thời tiết...
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" key={index} />
        ))}
      </div>
    </div>
  );
}
