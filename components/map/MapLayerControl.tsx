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
    <div className="pointer-events-auto w-full max-w-[20rem]">
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/95 px-4 text-sm font-black text-slate-950 shadow-lg shadow-blue-950/10 backdrop-blur-xl"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Layers aria-hidden className="h-4 w-4 text-blue-600" />
        Lớp bản đồ
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 max-h-[58svh] overflow-y-auto rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-2xl shadow-blue-950/10 backdrop-blur-xl will-change-transform"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Bản đồ nền
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Bản đồ nền không phải dữ liệu thời gian thực.
              </p>
              <div className="mt-2 grid gap-2">
                {baseLayers.map((layer) => (
                  <button
                    className={`rounded-2xl px-3 py-2 text-left text-xs font-black ${
                      selectedBaseLayerId === layer.id
                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-blue-50"
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
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Lớp thời tiết
              </p>
              {!hasWeatherApiKey ? (
                <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                  Chưa cấu hình API thời tiết. Bản đồ nền vẫn hoạt động.
                </p>
              ) : null}
              <div className="mt-2 grid gap-2">
                {visibleOverlays.map((layer) => {
                  const active = selectedOverlayIds.includes(layer.id);

                  return (
                    <button
                      className={`flex items-start justify-between gap-3 rounded-2xl px-3 py-2 text-left text-xs font-black disabled:opacity-50 ${
                        active ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"
                      }`}
                      disabled={!hasWeatherApiKey}
                      key={layer.id}
                      onClick={() => onOverlayToggle(layer.id)}
                      type="button"
                    >
                      <span>
                        <span className="block">{layer.name}</span>
                        {layer.description ? (
                          <span className="mt-1 block text-[11px] font-semibold opacity-75">
                            {layer.description}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0">{active ? "Bật" : "Tắt"}</span>
                    </button>
                  );
                })}
              </div>
              {overlayLayers.length > visibleOverlays.length ? (
                <button
                  className="mt-2 w-full rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                  onClick={() => setShowMore((value) => !value)}
                  type="button"
                >
                  {showMore ? "Thu gọn" : "Xem thêm"}
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 text-xs font-black text-white disabled:bg-slate-400"
                disabled={!hasWeatherApiKey || isRefreshing}
                onClick={onRefreshWeatherLayers}
                type="button"
              >
                <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Làm mới lớp thời tiết
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-xs font-black text-white"
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
