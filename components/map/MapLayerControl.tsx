"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Layers, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { MapLayerConfig } from "@/types/map";

type MapLayerControlProps = {
  baseLayers: MapLayerConfig[];
  overlayLayers: MapLayerConfig[];
  selectedBaseLayerId: string;
  selectedOverlayIds: string[];
  hasWeatherApiKey: boolean;
  isRefreshing: boolean;
  onBaseLayerChange: (layerId: string) => void;
  onOverlayToggle: (layerId: string) => void;
  onRefreshWeatherLayers: () => void;
  onOpenStreetView: () => void;
};

const PRIMARY_WEATHER_LAYER_IDS = new Set([
  "precipitation_new",
  "clouds_new",
  "wind_new",
  "temp_new"
]);

export function MapLayerControl({
  baseLayers,
  overlayLayers,
  selectedBaseLayerId,
  selectedOverlayIds,
  hasWeatherApiKey,
  isRefreshing,
  onBaseLayerChange,
  onOverlayToggle,
  onRefreshWeatherLayers,
  onOpenStreetView
}: MapLayerControlProps) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const visibleOverlays = showMore
    ? overlayLayers
    : overlayLayers.filter((layer) => PRIMARY_WEATHER_LAYER_IDS.has(layer.id));

  return (
    <div className="pointer-events-auto w-full max-w-[22rem]">
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 text-sm font-black text-slate-950 shadow-2xl shadow-slate-950/15 backdrop-blur-md transition hover:bg-white dark:border-white/15 dark:bg-slate-950/90 dark:text-white"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Layers aria-hidden className="h-4 w-4 text-blue-600 dark:text-sky-300" />
        Lớp bản đồ
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 max-h-[58svh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white/95 p-4 text-slate-900 shadow-2xl shadow-slate-950/20 backdrop-blur-md will-change-transform dark:border-white/15 dark:bg-slate-950/90 dark:text-white"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-sky-300">
                Bản đồ nền
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                Nền đường phố/vệ tinh không phải dữ liệu thời gian thực.
              </p>
              <div className="mt-3 grid gap-2">
                {baseLayers.map((layer) => {
                  const active = selectedBaseLayerId === layer.id;

                  return (
                    <button
                      className={`rounded-2xl border px-3 py-2 text-left text-xs font-black transition ${
                        active
                          ? "border-blue-400/25 bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                      key={layer.id}
                      onClick={() => onBaseLayerChange(layer.id)}
                      type="button"
                    >
                      <span className="block">{layer.name}</span>
                      {layer.description ? (
                        <span className="mt-1 block text-[11px] font-semibold opacity-75">
                          {layer.description}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                Lớp thời tiết
              </p>
              {!hasWeatherApiKey ? (
                <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-100">
                  Chưa cấu hình API thời tiết. Bản đồ nền vẫn hoạt động.
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {visibleOverlays.map((layer) => {
                  const active = selectedOverlayIds.includes(layer.id);

                  return (
                    <button
                      className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left text-xs font-black transition disabled:opacity-50 ${
                        active
                          ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                      disabled={!hasWeatherApiKey}
                      key={layer.id}
                      onClick={() => onOverlayToggle(layer.id)}
                      type="button"
                    >
                      <span className="truncate">{layer.name}</span>
                      <span className="shrink-0 text-[11px]">{active ? "Bật" : "Tắt"}</span>
                    </button>
                  );
                })}
              </div>
              {overlayLayers.length > visibleOverlays.length ? (
                <button
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-800 transition hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setShowMore((value) => !value)}
                  type="button"
                >
                  {showMore ? "Thu gọn" : "Xem thêm"}
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 text-xs font-black text-white shadow-lg shadow-blue-950/20 transition disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
                disabled={!hasWeatherApiKey || isRefreshing}
                onClick={onRefreshWeatherLayers}
                type="button"
              >
                <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Làm mới lớp thời tiết
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
                onClick={onOpenStreetView}
                type="button"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Mở xem phố bên ngoài
              </button>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
