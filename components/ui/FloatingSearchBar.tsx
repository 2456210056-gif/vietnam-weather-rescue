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
    <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-[32px] border border-white/20 bg-gradient-to-r from-slate-950/75 to-blue-950/70 p-3 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[28px] border border-white/15 bg-slate-950/60 px-4 py-3 text-left shadow-xl shadow-blue-950/20 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.01] hover:bg-slate-900/80"
        onClick={onOpen}
        type="button"
      >
        <Search aria-hidden className="h-5 w-5 shrink-0 text-emerald-300" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-200">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-emerald-300" />
            Thời tiết Việt Nam
          </span>
          <span className="mt-1 block truncate text-base font-black text-white drop-shadow-sm">{label}</span>
        </span>
        <span className="shrink-0 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-xs font-black text-white shadow-lg">
          {badge}
        </span>
      </button>

      <div className="flex gap-2">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm font-black text-white shadow-xl shadow-blue-950/20 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.03] hover:bg-slate-900/80 disabled:opacity-60 md:flex-none"
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
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-slate-950/60 text-white shadow-xl shadow-blue-950/20 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.03] hover:bg-slate-900/80 disabled:opacity-60"
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
