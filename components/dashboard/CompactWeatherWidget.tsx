"use client";

import { AlertTriangle, CloudSun, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useWeather } from "@/hooks/useWeather";
import {
  getSavedWeatherLocation,
  subscribeWeatherLocation,
  type SavedWeatherLocation
} from "@/lib/weather/location-storage";
import {
  DEFAULT_VIETNAM_LOCATION_ID,
  getVietnamLocationById
} from "@/lib/weather/vietnam-34-locations";
import { generateWeatherAlerts } from "@/lib/weather/weather-alerts";

function getDefaultLocation(): SavedWeatherLocation {
  const location = getVietnamLocationById(DEFAULT_VIETNAM_LOCATION_ID);

  return {
    lat: location.latitude,
    lon: location.longitude,
    locationName: location.name,
    source: "default",
    updatedAt: 0,
    locationId: location.id
  };
}

function subscribeHydration() {
  return () => {};
}

export function CompactWeatherWidget() {
  const hasHydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const storedLocation = useSyncExternalStore(
    subscribeWeatherLocation,
    getSavedWeatherLocation,
    () => null
  );
  const location = hasHydrated ? storedLocation ?? getDefaultLocation() : null;
  const weatherInput = useMemo(() => {
    if (!location) return null;

    return {
      latitude: location.lat,
      longitude: location.lon,
      locationName: location.locationName
    };
  }, [location]);
  const weatherQuery = useWeather(weatherInput);
  const alert = weatherQuery.data
    ? generateWeatherAlerts({
        current: weatherQuery.data,
        hourly: weatherQuery.data.forecastHourly,
        providerAlerts: weatherQuery.data.providerAlerts,
        locationName: weatherQuery.data.locationName
      })[0]
    : null;

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 text-slate-900 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:text-white dark:shadow-slate-950/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700 dark:text-sky-300">
            Thời tiết hiện tại
          </p>
          <h2 className="mt-2 text-lg font-black">{location?.locationName ?? "Đang cập nhật"}</h2>
        </div>
        <button
          aria-label="Làm mới thời tiết"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition duration-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          onClick={() => void weatherQuery.refetch()}
          type="button"
        >
          {weatherQuery.isFetching ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>

      {weatherQuery.data ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-950/30">
              <CloudSun aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">
                {Math.round(weatherQuery.data.temperature)}°C
              </p>
              <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                {weatherQuery.data.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Cảm giác" value={`${Math.round(weatherQuery.data.feelsLike)}°C`} />
            <Metric label="Độ ẩm" value={`${weatherQuery.data.humidity}%`} />
            <Metric label="Gió" value={`${weatherQuery.data.windSpeed.toFixed(1)} km/h`} />
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/65">
            <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
              <AlertTriangle
                aria-hidden
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  alert?.severity === "warning" || alert?.severity === "danger"
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              />
              {alert?.message ?? "Điều kiện thời tiết hiện tương đối ổn định."}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-300">
          {weatherQuery.error ? "Không thể tải thời tiết." : "Đang tải thời tiết..."}
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white"
          href="/"
        >
          Xem chi tiết
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          href="/#weather-location"
        >
          Đổi vị trí
        </Link>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/10">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
