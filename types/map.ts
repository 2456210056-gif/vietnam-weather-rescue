export type MapLayerType = "base" | "overlay";

export type MapLayerConfig = {
  id: string;
  name: string;
  type: MapLayerType;
  url: string;
  attribution: string;
  description?: string;
  source?: string;
  maxZoom?: number;
  opacity?: number;
  enabled?: boolean;
  realtime?: boolean;
  requiresOpenWeatherKey?: boolean;
};
