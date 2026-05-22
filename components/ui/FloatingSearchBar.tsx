"use client";

import { Crosshair, Loader2, MapPin, RefreshCw, Search } from "lucide-react";

type FloatingSearchBarProps = {
  label: string;
  badge: string;
  isLocating?: boolean;
  isRefreshing?: boolean;
  onOpen: () => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
};

export function FloatingSearchBar({
  label,
  badge,
  isLocating = false,
  isRefreshing = false,
  onOpen,
  onUseCurrentLocation,
  onRefresh
}: FloatingSearchBarProps) {
  return (
    <div className="relative z-40 flex flex-col gap-3 rounded-[32px] border border-white/20 bg-white/15 p-3 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 text-left shadow-lg shadow-blue-950/10 transition-transform duration-200 hover:scale-[1.01]"
        onClick={onOpen}
        type="button"
      >
        <Search aria-hidden className="h-5 w-5 shrink-0 text-emerald-100" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/60">
            <MapPin aria-hidden className="h-3.5 w-3.5" />
            Thời tiết Việt Nam
          </span>
          <span className="mt-1 block truncate text-base font-black">{label}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-black">{badge}</span>
      </button>

      <div className="flex gap-2">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60 md:flex-none"
          disabled={isLocating}
          onClick={onUseCurrentLocation}
          type="button"
        >
          {isLocating ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair aria-hidden className="h-4 w-4" />
          )}
          GPS
        </button>
        <button
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white shadow-lg shadow-blue-950/10 transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
          disabled={isRefreshing}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw aria-hidden className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
