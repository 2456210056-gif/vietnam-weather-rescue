"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Crosshair,
  Loader2,
  RadioTower,
  ShieldCheck,
  Waves
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { MapFreshnessBadge } from "@/components/map/MapFreshnessBadge";
import { MapLayerControl } from "@/components/map/MapLayerControl";
import { useGeolocation, type GeolocationSnapshot } from "@/hooks/useGeolocation";
import { useSOSRealtime } from "@/hooks/useSOSRealtime";
import {
  BASE_MAP_LAYERS,
  getBaseMapLayer,
  WEATHER_OVERLAY_LAYERS
} from "@/lib/map/map-layers";
import {
  describeWeatherCode,
  fetchSeaWeather,
  type SeaWeather
} from "@/lib/map/seaWeather";
import {
  SOVEREIGNTY_AREAS,
  VIETNAM_CENTER,
  type SeaArea
} from "@/lib/map/sovereignty";
import {
  buildWeatherTileUrl,
  getWeatherOverlayCacheKey,
  getWeatherOverlayMinuteKey
} from "@/lib/map/weather-overlays";
import { useSOSStore } from "@/stores/sosStore";
import {
  SOS_NEED_LABELS,
  SOS_STATUS_LABELS,
  type SOSSignalDTO,
  type SOSStatus
} from "@/types/sos";
import type { LayerGroup, Map as LeafletMap, TileLayer } from "leaflet";
import type { MapLayerConfig } from "@/types/map";

type LeafletModule = typeof import("leaflet");

type SOSListResponse = {
  signals: SOSSignalDTO[];
};

const BASE_LAYER_STORAGE_KEY = "selectedBaseMapLayer";
const OVERLAY_STORAGE_KEY = "selectedWeatherOverlays";
const AUTO_REFRESH_STORAGE_KEY = "autoRefreshWeatherOverlays";
const WEATHER_AUTO_REFRESH_INTERVAL_MS = 5 * 60_000;
const VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [4, 96],
  [24, 122]
];

const STATUS_CLASS: Record<SOSStatus, string> = {
  PENDING: "sos-marker--pending",
  ACKNOWLEDGED: "sos-marker--acknowledged",
  APPROACHING: "sos-marker--approaching",
  REACHED: "sos-marker--approaching",
  RESOLVED: "sos-marker--resolved",
  CANCELLED: "sos-marker--cancelled"
};

const RESCUER_STATUS_ACTIONS: { status: SOSStatus; label: string }[] = [
  { status: "ACKNOWLEDGED", label: "Đã tiếp nhận" },
  { status: "APPROACHING", label: "Đang tiếp cận" },
  { status: "RESOLVED", label: "Đã xử lý" }
];

function readStoredBaseLayer() {
  if (typeof window === "undefined") {
    return BASE_MAP_LAYERS[0].id;
  }

  return getBaseMapLayer(window.localStorage.getItem(BASE_LAYER_STORAGE_KEY) ?? "").id;
}

function readStoredWeatherOverlays() {
  if (typeof window === "undefined") {
    return ["precipitation_new", "clouds_new"];
  }

  const stored = window.localStorage.getItem(OVERLAY_STORAGE_KEY);

  if (!stored) {
    return ["precipitation_new", "clouds_new"];
  }

  try {
    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return ["precipitation_new", "clouds_new"];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return ["precipitation_new", "clouds_new"];
  }
}

function readStoredAutoRefresh() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(AUTO_REFRESH_STORAGE_KEY) !== "false";
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function formatSignalNeeds(signal: SOSSignalDTO) {
  return signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ");
}

function createSOSIcon(leaflet: LeafletModule, status: SOSStatus) {
  return leaflet.divIcon({
    className: "leaflet-sos-icon",
    html: `<div class="sos-marker ${STATUS_CLASS[status]}">SOS</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function createSovereigntyIcon(leaflet: LeafletModule, label: string) {
  return leaflet.divIcon({
    className: "leaflet-sovereignty-icon",
    html: `<div class="sovereignty-marker">${label}</div>`,
    iconSize: [230, 38],
    iconAnchor: [115, 19]
  });
}

function createUserLocationIcon(leaflet: LeafletModule) {
  return leaflet.divIcon({
    className: "leaflet-user-location-icon",
    html: '<div class="user-location-marker"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function createBaseTileLayer(leaflet: LeafletModule, layer: MapLayerConfig) {
  return leaflet.tileLayer(layer.url, {
    attribution: layer.attribution,
    maxZoom: layer.maxZoom ?? 19,
    detectRetina: true
  });
}

function createWeatherTileLayer(
  leaflet: LeafletModule,
  layer: MapLayerConfig,
  apiKey: string,
  cacheKey: number
) {
  return leaflet.tileLayer(buildWeatherTileUrl({ layerId: layer.id, apiKey, cacheKey }), {
    attribution: layer.attribution,
    opacity: layer.opacity ?? 0.55,
    maxZoom: layer.maxZoom ?? 19,
    updateWhenIdle: true,
    crossOrigin: true
  });
}

export function VietnamRescueMap() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const canManageSOS = session?.user?.role === "rescuer" || session?.user?.role === "admin";
  const realtime = useSOSRealtime(isAuthenticated);
  const geolocation = useGeolocation();
  const signals = useSOSStore((state) => state.signals);
  const setSignals = useSOSStore((state) => state.setSignals);
  const upsertSignal = useSOSStore((state) => state.upsertSignal);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const sosLayerRef = useRef<LayerGroup | null>(null);
  const sovereigntyLayerRef = useRef<LayerGroup | null>(null);
  const userLayerRef = useRef<LayerGroup | null>(null);
  const weatherLayersRef = useRef<TileLayer[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [userPosition, setUserPosition] = useState<GeolocationSnapshot | null>(null);
  const [selectedBaseLayerId, setSelectedBaseLayerId] = useState(BASE_MAP_LAYERS[0].id);
  const [selectedWeatherOverlayIds, setSelectedWeatherOverlayIds] = useState<string[]>([
    "precipitation_new",
    "clouds_new"
  ]);
  const [weatherTileCacheKey, setWeatherTileCacheKey] = useState<number | null>(null);
  const [lastWeatherUpdated, setLastWeatherUpdated] = useState<Date | null>(null);
  const [isRefreshingWeatherLayers, setIsRefreshingWeatherLayers] = useState(false);
  const [autoRefreshWeatherLayers, setAutoRefreshWeatherLayers] = useState(true);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [selectedSeaArea, setSelectedSeaArea] = useState<SeaArea | null>(null);
  const [isUpdatingSignal, setIsUpdatingSignal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const openWeatherTileKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim() ?? "";
  const hasWeatherApiKey = Boolean(openWeatherTileKey);

  const { data, mutate } = useSWR<SOSListResponse>(isAuthenticated ? "/api/sos" : null, {
    revalidateOnFocus: true,
    refreshInterval: realtime.isUnavailable ? 15_000 : 30_000
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedBaseLayerId(readStoredBaseLayer());
      setSelectedWeatherOverlayIds(readStoredWeatherOverlays());
      setAutoRefreshWeatherLayers(readStoredAutoRefresh());
      setLastWeatherUpdated(new Date());
      setWeatherTileCacheKey(getWeatherOverlayCacheKey());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.signals) {
      setSignals(data.signals);
    }
  }, [data, setSignals]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      try {
        const leaflet = await import("leaflet");

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        leafletRef.current = leaflet;

        const map = leaflet
          .map(mapContainerRef.current, {
            center: [VIETNAM_CENTER.latitude, VIETNAM_CENTER.longitude],
            zoom: VIETNAM_CENTER.zoom,
            minZoom: 4,
            maxZoom: 18,
            maxBounds: VIETNAM_BOUNDS,
            maxBoundsViscosity: 0.35,
            zoomControl: true,
            attributionControl: true
          })
          .setView([VIETNAM_CENTER.latitude, VIETNAM_CENTER.longitude], VIETNAM_CENTER.zoom);

        const baseLayer = createBaseTileLayer(leaflet, getBaseMapLayer(readStoredBaseLayer()));
        baseLayer.on("tileerror", () => {
          setSelectedBaseLayerId(BASE_MAP_LAYERS[0].id);
        });
        baseLayer.addTo(map);
        baseLayerRef.current = baseLayer;

        sosLayerRef.current = leaflet.layerGroup().addTo(map);
        sovereigntyLayerRef.current = leaflet.layerGroup().addTo(map);
        userLayerRef.current = leaflet.layerGroup().addTo(map);
        mapRef.current = map;
        setIsMapReady(true);
      } catch {
        setMapError("Không thể tải Leaflet/OpenStreetMap.");
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      baseLayerRef.current = null;
      sosLayerRef.current = null;
      sovereigntyLayerRef.current = null;
      userLayerRef.current = null;
      weatherLayersRef.current = [];
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;

    if (!leaflet || !map || !isMapReady) {
      return;
    }

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    const nextLayer = createBaseTileLayer(leaflet, getBaseMapLayer(selectedBaseLayerId));
    nextLayer.on("tileerror", () => {
      setSelectedBaseLayerId(BASE_MAP_LAYERS[0].id);
    });
    nextLayer.addTo(map);
    baseLayerRef.current = nextLayer;
  }, [isMapReady, selectedBaseLayerId]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = sovereigntyLayerRef.current;

    if (!leaflet || !map || !layer || !isMapReady) {
      return;
    }

    layer.clearLayers();
    SOVEREIGNTY_AREAS.forEach((area) => {
      const marker = leaflet.marker([area.latitude, area.longitude], {
        icon: createSovereigntyIcon(leaflet, area.name),
        zIndexOffset: 700
      });
      marker.on("click", () => setSelectedSeaArea(area));
      marker.addTo(layer);
    });
  }, [isMapReady]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = sosLayerRef.current;

    if (!leaflet || !layer || !isMapReady) {
      return;
    }

    layer.clearLayers();
    signals.forEach((signal) => {
      const marker = leaflet.marker(
        [signal.coordinates.latitude, signal.coordinates.longitude],
        {
          icon: createSOSIcon(leaflet, signal.status),
          zIndexOffset: 900
        }
      );
      marker.on("click", () => {
        setSelectedSignalId(signal.id);
        setStatusMessage("");
      });
      marker.addTo(layer);
    });
  }, [isMapReady, signals]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = userLayerRef.current;

    if (!leaflet || !layer || !isMapReady) {
      return;
    }

    layer.clearLayers();

    if (userPosition) {
      leaflet
        .marker([userPosition.latitude, userPosition.longitude], {
          icon: createUserLocationIcon(leaflet),
          zIndexOffset: 800
        })
        .addTo(layer);
    }
  }, [isMapReady, userPosition]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;

    if (!leaflet || !map || !isMapReady) {
      return;
    }

    weatherLayersRef.current.forEach((layer) => map.removeLayer(layer));
    weatherLayersRef.current = [];

    if (!hasWeatherApiKey || weatherTileCacheKey === null) {
      return;
    }

    WEATHER_OVERLAY_LAYERS.filter((layer) => selectedWeatherOverlayIds.includes(layer.id)).forEach((layer) => {
      const tileLayer = createWeatherTileLayer(
        leaflet,
        layer,
        openWeatherTileKey,
        weatherTileCacheKey
      );
      tileLayer.on("tileerror", () => {
        setStatusMessage("Không thể tải một số ô lớp thời tiết. Bản đồ nền và marker vẫn hoạt động.");
      });
      tileLayer.addTo(map);
      weatherLayersRef.current.push(tileLayer);
    });

    const refreshDoneTimer = window.setTimeout(() => {
      setIsRefreshingWeatherLayers(false);
    }, 250);

    return () => window.clearTimeout(refreshDoneTimer);
  }, [
    hasWeatherApiKey,
    isMapReady,
    openWeatherTileKey,
    selectedWeatherOverlayIds,
    weatherTileCacheKey
  ]);

  const activeSignalCount = useMemo(
    () => signals.filter((signal) => !["RESOLVED", "CANCELLED"].includes(signal.status)).length,
    [signals]
  );

  const selectedSignal = useMemo(
    () => signals.find((signal) => signal.id === selectedSignalId) ?? null,
    [selectedSignalId, signals]
  );

  const activeWeatherLayers = useMemo(
    () => WEATHER_OVERLAY_LAYERS.filter((layer) => selectedWeatherOverlayIds.includes(layer.id)),
    [selectedWeatherOverlayIds]
  );

  const { data: seaWeather, isLoading: isSeaWeatherLoading } = useSWR<SeaWeather>(
    selectedSeaArea ? ["leaflet-sea-weather", selectedSeaArea.id] : null,
    ([, areaId]: [string, SeaArea["id"]]) => {
      const area = SOVEREIGNTY_AREAS.find((item) => item.id === areaId);

      if (!area) {
        throw new Error("Không tìm thấy vùng biển.");
      }

      return fetchSeaWeather(area);
    },
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    if (!hasWeatherApiKey || !autoRefreshWeatherLayers) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "hidden") {
        return;
      }

      setIsRefreshingWeatherLayers(true);
      setLastWeatherUpdated(new Date());
      setWeatherTileCacheKey(getWeatherOverlayMinuteKey());
    }, WEATHER_AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshWeatherLayers, hasWeatherApiKey]);

  function changeBaseLayer(layerId: string) {
    setSelectedBaseLayerId(layerId);
    window.localStorage.setItem(BASE_LAYER_STORAGE_KEY, layerId);
  }

  function toggleWeatherOverlay(layerId: string) {
    setSelectedWeatherOverlayIds((current) => {
      const next = current.includes(layerId)
        ? current.filter((id) => id !== layerId)
        : [...current, layerId];
      window.localStorage.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function refreshWeatherLayers(cacheKey = getWeatherOverlayCacheKey()) {
    const updatedAt = new Date();
    setIsRefreshingWeatherLayers(true);
    setLastWeatherUpdated(updatedAt);
    setWeatherTileCacheKey(cacheKey);
  }

  function changeAutoRefreshWeatherLayers(enabled: boolean) {
    setAutoRefreshWeatherLayers(enabled);
    window.localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, String(enabled));
  }

  async function updateSignalStatus(signal: SOSSignalDTO, nextStatus: SOSStatus) {
    setIsUpdatingSignal(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/sos/${signal.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        signal?: SOSSignalDTO;
        message?: string;
      };

      if (!response.ok || !payload.signal) {
        setStatusMessage(payload.message ?? "Không thể cập nhật tín hiệu SOS.");
        return;
      }

      upsertSignal(payload.signal);
      setSelectedSignalId(payload.signal.id);
      await mutate();
      setStatusMessage(payload.message ?? "Trạng thái SOS đã được cập nhật.");
    } finally {
      setIsUpdatingSignal(false);
    }
  }

  async function locateUser() {
    const position = await geolocation.requestLocation();

    if (!position) {
      return;
    }

    setUserPosition(position);
    mapRef.current?.setView([position.latitude, position.longitude], 12);
  }

  function openStreetView() {
    const center = mapRef.current?.getCenter();
    const target = selectedSignal
      ? selectedSignal.coordinates
      : userPosition ?? (center ? { latitude: center.lat, longitude: center.lng } : null);

    if (!target) {
      setStatusMessage("Khu vực này chưa có dữ liệu xem phố.");
      return;
    }

    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${target.latitude},${target.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Leaflet realtime
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Bản đồ cứu hộ & thời tiết Việt Nam
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Leaflet + OpenStreetMap, marker SOS realtime, lớp mưa/mây/gió OpenWeather chống cache.
            Không phụ thuộc Google Maps API.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 sm:flex">
          <span className="rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
            SOS: {activeSignalCount}
          </span>
          <span className="rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
            {realtime.isConnected ? "Realtime online" : "Polling fallback"}
          </span>
        </div>
      </section>

      <section className="relative h-[76svh] min-h-[560px] overflow-hidden rounded-3xl border border-white/60 bg-slate-200 shadow-soft">
        <div ref={mapContainerRef} className="h-full w-full" />

        {!isMapReady ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg">
              <Loader2 aria-hidden className="h-5 w-5 animate-spin text-blue-600" />
              {mapError || "Đang tải Leaflet/OpenStreetMap..."}
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col gap-2 sm:inset-x-4 sm:flex-row sm:items-start sm:justify-between">
          <MapLayerControl
            baseLayers={BASE_MAP_LAYERS}
            hasWeatherApiKey={hasWeatherApiKey}
            isRefreshing={isRefreshingWeatherLayers}
            onBaseLayerChange={changeBaseLayer}
            onOpenStreetView={openStreetView}
            onOverlayToggle={toggleWeatherOverlay}
            onRefreshWeatherLayers={() => refreshWeatherLayers()}
            overlayLayers={WEATHER_OVERLAY_LAYERS}
            selectedBaseLayerId={selectedBaseLayerId}
            selectedOverlayIds={selectedWeatherOverlayIds}
          />

          <MapFreshnessBadge
            activeWeatherLayers={activeWeatherLayers}
            autoRefreshEnabled={autoRefreshWeatherLayers}
            baseLayer={getBaseMapLayer(selectedBaseLayerId)}
            cacheKey={weatherTileCacheKey}
            hasWeatherApiKey={hasWeatherApiKey}
            isRefreshing={isRefreshingWeatherLayers}
            lastUpdated={lastWeatherUpdated}
            onAutoRefreshChange={changeAutoRefreshWeatherLayers}
            onRefresh={() => refreshWeatherLayers()}
          />

          <button
            className="pointer-events-auto ml-auto flex w-fit items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-blue-950/10 disabled:bg-slate-400"
            disabled={geolocation.isLoading}
            onClick={() => void locateUser()}
            type="button"
          >
            {geolocation.isLoading ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair aria-hidden className="h-4 w-4" />
            )}
            Vị trí của tôi
          </button>

          <div className="hidden pointer-events-auto rounded-3xl bg-white/90 p-3 text-xs font-semibold text-slate-600 shadow-lg backdrop-blur-xl sm:max-w-xs">
            <p className="flex items-center gap-2 font-black text-slate-950">
              <RadioTower aria-hidden className="h-4 w-4 text-blue-600" />
              Trạng thái dữ liệu
            </p>
            <p className="mt-2">Bản đồ nền: {getBaseMapLayer(selectedBaseLayerId).name}</p>
            <p className="mt-1">
              {hasWeatherApiKey
                ? `OpenWeather tile cache-bust: ${weatherTileCacheKey}`
                : "Chưa cấu hình API thời tiết để hiển thị lớp mưa/mây/gió."}
            </p>
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-xs font-black text-white disabled:bg-slate-400"
              disabled={geolocation.isLoading}
              onClick={() => void locateUser()}
              type="button"
            >
              {geolocation.isLoading ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair aria-hidden className="h-4 w-4" />
              )}
              Vị trí của tôi
            </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedSignal ? (
            <motion.aside
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-3 bottom-3 z-40 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl will-change-transform sm:left-auto sm:right-4 sm:w-96"
              exit={{ opacity: 0, y: 16 }}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                    Tín hiệu SOS
                  </p>
                  <h3 className="mt-1 text-lg font-black text-slate-950">
                    {selectedSignal.reporterName ?? "Người dùng SOS"}
                  </h3>
                  {selectedSignal.reporterPhone ? (
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {selectedSignal.reporterPhone}
                    </p>
                  ) : null}
                </div>
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700"
                  onClick={() => setSelectedSignalId(null)}
                  type="button"
                >
                  Đóng
                </button>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                {formatSignalNeeds(selectedSignal)}
              </p>
              {selectedSignal.note ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedSignal.note}</p>
              ) : null}
              {selectedSignal.addressText ? (
                <p className="mt-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600">
                  {selectedSignal.addressText}
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-2xl bg-slate-50 p-3">
                  {formatCoordinate(selectedSignal.coordinates.latitude)},{" "}
                  {formatCoordinate(selectedSignal.coordinates.longitude)}
                </span>
                <span className="rounded-2xl bg-slate-50 p-3">
                  {SOS_STATUS_LABELS[selectedSignal.status]}
                </span>
              </div>
              {statusMessage ? (
                <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                  {statusMessage}
                </p>
              ) : null}
              {canManageSOS && !["RESOLVED", "CANCELLED"].includes(selectedSignal.status) ? (
                <div className="mt-3 grid gap-2">
                  {RESCUER_STATUS_ACTIONS.map((action) => (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400"
                      disabled={isUpdatingSignal || selectedSignal.status === action.status}
                      key={action.status}
                      onClick={() => void updateSignalStatus(selectedSignal, action.status)}
                      type="button"
                    >
                      {isUpdatingSignal ? (
                        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck aria-hidden className="h-4 w-4" />
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSeaArea ? (
            <motion.aside
              animate={{ opacity: 1, x: 0 }}
              className="absolute inset-x-3 bottom-3 z-40 rounded-3xl border border-red-100 bg-white/95 p-4 shadow-2xl backdrop-blur-xl will-change-transform sm:bottom-auto sm:left-4 sm:right-auto sm:top-40 sm:w-96"
              exit={{ opacity: 0, x: -16 }}
              initial={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                    <Waves aria-hidden className="h-4 w-4" />
                    Chủ quyền biển đảo
                  </p>
                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    {selectedSeaArea.name}
                  </h3>
                </div>
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700"
                  onClick={() => setSelectedSeaArea(null)}
                  type="button"
                >
                  Đóng
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedSeaArea.description}
              </p>
              <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {formatCoordinate(selectedSeaArea.latitude)},{" "}
                {formatCoordinate(selectedSeaArea.longitude)}
              </div>
              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                {isSeaWeatherLoading ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    Đang tải thời tiết vùng biển...
                  </p>
                ) : seaWeather ? (
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    <span>Nhiệt độ: {seaWeather.temperature ?? "--"}°C</span>
                    <span>Độ ẩm: {seaWeather.humidity ?? "--"}%</span>
                    <span>Gió: {seaWeather.windSpeed ?? "--"} km/h</span>
                    <span>Hướng: {seaWeather.windDirection ?? "--"}°</span>
                    <span className="col-span-2 font-black text-slate-900">
                      {describeWeatherCode(seaWeather.weatherCode)}
                    </span>
                    {seaWeather.source === "demo" ? (
                      <span className="col-span-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                        Dữ liệu mô phỏng khi API vùng biển chưa khả dụng.
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </section>

      {!isAuthenticated ? (
        <p className="rounded-3xl border border-white/60 bg-white/85 p-4 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
          Đăng nhập để tải danh sách SOS và nhận tín hiệu realtime từ người dùng khác.
        </p>
      ) : null}
    </div>
  );
}
