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
          className="pointer-events-auto inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 text-xs font-black text-slate-950 shadow-2xl shadow-slate-950/15 backdrop-blur-md dark:border-white/15 dark:bg-slate-950/90 dark:text-white"
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          key="freshness-open"
          onClick={() => updateCollapsed(false)}
          transition={{ duration: 0.18, ease: "easeOut" }}
          type="button"
        >
          <Info aria-hidden className="h-4 w-4 text-blue-600 dark:text-sky-300" />
          Thông tin lớp
        </motion.button>
      ) : (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto max-h-[42svh] w-full max-w-[26rem] overflow-y-auto rounded-[28px] border border-slate-200 bg-white/95 p-4 text-xs font-semibold text-slate-700 shadow-2xl shadow-slate-950/20 backdrop-blur-md dark:border-white/15 dark:bg-slate-950/90 dark:text-slate-200"
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          key="freshness-panel"
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
              <Clock aria-hidden className="h-4 w-4 text-blue-600 dark:text-sky-300" />
              Cập nhật: {lastUpdated ? formatTime(lastUpdated) : "Đang cập nhật..."}
            </p>
            <button
              aria-label="Thu gọn thông tin lớp bản đồ"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              onClick={() => updateCollapsed(true)}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 flex items-start gap-2 leading-5">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-slate-400" />
            <span>{baseLayer.name}: bản đồ nền không phải dữ liệu thời gian thực.</span>
          </p>
          <p className="mt-2 flex items-start gap-2 leading-5">
            <Database aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
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
          <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
            Cache key: {cacheKey ?? "Đang cập nhật..."}
          </p>

          <div className="mt-3 grid gap-2">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 text-xs font-black text-white shadow-sm transition disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
              disabled={!hasWeatherApiKey || isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới lớp thời tiết
            </button>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
              <span>Tự động 5 phút</span>
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
