"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Loader2, MapPin, RefreshCw, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { VIETNAM_34_LOCATIONS } from "@/lib/weather/vietnam-34-locations";
import type { GeolocationStatus } from "@/hooks/useGeolocation";
import type { VietnamLocation, WeatherLocationMode } from "@/types/weather";

type WeatherLocationSelectorProps = {
  selectedLocationId: string;
  mode: WeatherLocationMode;
  geolocationStatus: GeolocationStatus;
  isRefreshing: boolean;
  onSelectLocation: (location: VietnamLocation) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
};

export function WeatherLocationSelector({
  selectedLocationId,
  mode,
  geolocationStatus,
  isRefreshing,
  onSelectLocation,
  onUseCurrentLocation,
  onRefresh
}: WeatherLocationSelectorProps) {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  const selectedLocation =
    VIETNAM_34_LOCATIONS.find((location) => location.id === selectedLocationId) ??
    VIETNAM_34_LOCATIONS[0];

  const filteredLocations = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return VIETNAM_34_LOCATIONS;
    }

    return VIETNAM_34_LOCATIONS.filter((location) =>
      `${location.name} ${location.representativeCity}`.toLowerCase().includes(query)
    );
  }, [keyword]);

  function selectLocation(location: VietnamLocation) {
    onSelectLocation(location);
    setOpen(false);
  }

  return (
    <section className="theme-glass relative z-30 rounded-[32px] p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            Thời tiết Việt Nam
          </p>
          <button
            className="mt-2 flex max-w-full items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-left text-sm font-black text-white shadow-lg shadow-blue-200 transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => setOpen(true)}
            type="button"
          >
            <MapPin aria-hidden className="h-4 w-4 shrink-0 text-emerald-100" />
            <span className="truncate">
              {mode === "gps" ? "Vị trí hiện tại" : selectedLocation.name}
            </span>
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[11px]">
              {mode === "gps" ? "GPS" : "Đổi"}
            </span>
          </button>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Dữ liệu theo điểm đại diện. Để chính xác nhất, hãy dùng vị trí hiện tại.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-2 text-xs font-black ${
              mode === "gps"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {mode === "gps" ? "GPS thực tế" : "Điểm đại diện"}
          </span>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 disabled:bg-slate-400"
            disabled={geolocationStatus === "loading"}
            onClick={onUseCurrentLocation}
            type="button"
          >
            {geolocationStatus === "loading" ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair aria-hidden className="h-4 w-4" />
            )}
            Dùng vị trí hiện tại
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-950 px-4 py-3 text-sm font-black text-white shadow-sm disabled:bg-slate-400"
            disabled={isRefreshing}
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              aria-label="Đóng chọn địa điểm"
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[50] bg-slate-950/30 backdrop-blur-[2px]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              transition={{ duration: 0.18 }}
              type="button"
            />
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[80vh] overflow-hidden rounded-t-[34px] border border-white/70 bg-white p-4 pb-24 shadow-2xl md:inset-x-auto md:bottom-auto md:right-8 md:top-24 md:w-[30rem] md:max-h-[min(72vh,42rem)] md:rounded-[32px] md:pb-4"
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              initial={{ opacity: 0, y: 34, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    Chọn địa điểm
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    34 tỉnh/thành sau sáp nhập 2025
                  </h3>
                </div>
                <button
                  aria-label="Đóng"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-4 flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Search aria-hidden className="h-4 w-4 text-slate-500" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm Hà Nội, Cần Thơ, Lào Cai..."
                  value={keyword}
                />
              </label>

              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400"
                disabled={geolocationStatus === "loading"}
                onClick={onUseCurrentLocation}
                type="button"
              >
                {geolocationStatus === "loading" ? (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair aria-hidden className="h-4 w-4" />
                )}
                Dùng vị trí hiện tại
              </button>

              {geolocationStatus === "permission_denied" ? (
                <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                  Bạn chưa cấp quyền vị trí. Vui lòng bật quyền vị trí hoặc chọn tỉnh/thành thủ
                  công.
                </p>
              ) : null}

              <div className="weather-scrollbar mt-4 max-h-[46vh] overflow-y-auto pr-1 md:max-h-[34rem]">
                <LocationGroup
                  locations={filteredLocations.filter((location) => location.type === "city")}
                  onSelect={selectLocation}
                  selectedLocationId={selectedLocationId}
                  title="Thành phố trực thuộc trung ương"
                />
                <LocationGroup
                  locations={filteredLocations.filter((location) => location.type === "province")}
                  onSelect={selectLocation}
                  selectedLocationId={selectedLocationId}
                  title="Tỉnh"
                />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function LocationGroup({
  title,
  locations,
  selectedLocationId,
  onSelect
}: {
  title: string;
  locations: VietnamLocation[];
  selectedLocationId: string;
  onSelect: (location: VietnamLocation) => void;
}) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>
      <div className="grid gap-2">
        {locations.map((location) => {
          const active = location.id === selectedLocationId;

          return (
            <button
              className={`rounded-3xl px-4 py-3 text-left text-sm font-black transition-transform duration-200 hover:scale-[1.01] ${
                active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
              }`}
              key={location.id}
              onClick={() => onSelect(location)}
              type="button"
            >
              <span className="block">{location.name}</span>
              <span className={`mt-1 block text-xs font-semibold ${active ? "text-white/65" : "text-slate-500"}`}>
                Điểm đại diện: {location.representativeCity}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
