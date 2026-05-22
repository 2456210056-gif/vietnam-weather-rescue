"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Database, Info, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MapLayerConfig } from "@/types/map";

type MapFreshnessBadgeProps = {
  baseLayer: MapLayerConfig;
  activeWeatherLayers: MapLayerConfig[];
  lastUpdated: Date | null;
  hasWeatherApiKey: boolean;
  cacheKey: number | null;
  autoRefreshEnabled: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onAutoRefreshChange: (enabled: boolean) => void;
};

const PANEL_COLLAPSED_STORAGE_KEY = "mapFreshnessPanelCollapsed";

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(value);
}

export function MapFreshnessBadge({
  baseLayer,
  activeWeatherLayers,
  lastUpdated,
  hasWeatherApiKey,
  cacheKey,
  autoRefreshEnabled,
  isRefreshing,
  onRefresh,
  onAutoRefreshChange
}: MapFreshnessBadgeProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCollapsed(window.localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === "true");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateCollapsed(nextValue: boolean) {
    setCollapsed(nextValue);
    window.localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, String(nextValue));
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {collapsed ? (
        <motion.button
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto ml-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-xs font-black text-slate-950 shadow-lg shadow-blue-950/10 backdrop-blur-xl"
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          key="freshness-open"
          onClick={() => updateCollapsed(false)}
          transition={{ duration: 0.18, ease: "easeOut" }}
          type="button"
        >
          <Info aria-hidden className="h-4 w-4 text-blue-600" />
          Thông tin lớp
        </motion.button>
      ) : (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto max-h-[48svh] w-full max-w-[32rem] overflow-y-auto rounded-3xl border border-white/70 bg-white/90 p-3 text-xs font-semibold text-slate-600 shadow-xl shadow-blue-950/10 backdrop-blur-xl"
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          key="freshness-panel"
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 font-black text-slate-950">
              <Clock aria-hidden className="h-4 w-4 text-blue-600" />
              Cập nhật lúc: {lastUpdated ? formatTime(lastUpdated) : "Đang cập nhật..."}
            </p>
            <button
              aria-label="Thu gọn thông tin lớp bản đồ"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 transition-transform duration-200 hover:scale-[1.03]"
              onClick={() => updateCollapsed(true)}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 flex items-start gap-2">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{baseLayer.name}: bản đồ nền không phải dữ liệu thời gian thực.</span>
          </p>
          <p className="mt-2 flex items-start gap-2">
            <Database aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <span>
              {hasWeatherApiKey
                ? `Nguồn: OpenWeather. Lớp đang bật: ${
                    activeWeatherLayers.length
                      ? activeWeatherLayers.map((layer) => layer.name).join(", ")
                      : "chưa có"
                  }.`
                : "Lớp thời tiết demo - không phải dữ liệu thời gian thực."}
            </span>
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">
            Cache key: {cacheKey ?? "Đang cập nhật..."}
          </p>

          <div className="mt-3 grid gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm disabled:bg-slate-400"
              disabled={!hasWeatherApiKey || isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới lớp thời tiết
            </button>
            <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
              <span>Tự động cập nhật 5 phút</span>
              <input
                checked={autoRefreshEnabled}
                className="h-4 w-4 accent-emerald-500"
                disabled={!hasWeatherApiKey}
                onChange={(event) => onAutoRefreshChange(event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
