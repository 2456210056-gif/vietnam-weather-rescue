"use client";

import type { MapPoint } from "@/lib/map/directions";

export type RescueRouteLayerProps = {
  origin?: MapPoint;
  destination?: MapPoint;
  enabled: boolean;
};

// VietnamRescueMap manages Leaflet through refs instead of react-leaflet context.
// This component keeps the route-layer contract documented for future extraction.
export function RescueRouteLayer({ enabled }: RescueRouteLayerProps) {
  void enabled;
  return null;
}
