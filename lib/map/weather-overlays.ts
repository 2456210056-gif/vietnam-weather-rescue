import { getWeatherOverlayLayer } from "@/lib/map/map-layers";
import type { MapLayerConfig } from "@/types/map";

type BuildWeatherTileUrlInput = {
  layerId: string;
  apiKey: string;
  cacheKey: number;
};

export function getWeatherOverlayCacheKey(date = new Date()) {
  return date.getTime();
}

export function getWeatherOverlayMinuteKey(date = new Date()) {
  return Math.floor(date.getTime() / 60_000);
}

export function buildWeatherTileUrl({
  layerId,
  apiKey,
  cacheKey
}: BuildWeatherTileUrlInput) {
  const layer = getWeatherOverlayLayer(layerId);

  if (!layer) {
    throw new Error(`Unknown weather overlay layer: ${layerId}`);
  }

  return layer.url
    .replace("{apiKey}", encodeURIComponent(apiKey))
    .replace("{timestamp}", String(cacheKey));
}

export function describeWeatherOverlaySource(
  hasWeatherApiKey: boolean,
  activeLayers: MapLayerConfig[]
) {
  if (!hasWeatherApiKey) {
    return "Lớp thời tiết demo - không phải dữ liệu thời gian thực";
  }

  if (activeLayers.length === 0) {
    return "Chưa bật lớp thời tiết";
  }

  return "Nguồn: OpenWeather Maps, dùng current map mặc định của provider";
}
