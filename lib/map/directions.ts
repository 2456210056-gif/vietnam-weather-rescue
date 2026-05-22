export type MapPoint = {
  lat: number;
  lng: number;
};

export type RescueRouteResult = {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

type OsrmRouteResponse = {
  routes?: {
    distance?: number;
    duration?: number;
    geometry?: {
      type?: "LineString";
      coordinates?: [number, number][];
    };
  }[];
};

export function buildGoogleMapsDirectionsUrl(params: {
  destinationLat: number;
  destinationLng: number;
  originLat?: number;
  originLng?: number;
}) {
  const searchParams = new URLSearchParams({
    api: "1",
    destination: `${params.destinationLat},${params.destinationLng}`,
    travelmode: "driving"
  });

  if (params.originLat !== undefined && params.originLng !== undefined) {
    searchParams.set("origin", `${params.originLat},${params.originLng}`);
  }

  return `https://www.google.com/maps/dir/?${searchParams.toString()}`;
}

export async function fetchRescueRoute({
  origin,
  destination
}: {
  origin: MapPoint;
  destination: MapPoint;
}): Promise<RescueRouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Không thể lấy tuyến đường từ OSRM.");
  }

  const payload = (await response.json()) as OsrmRouteResponse;
  const route = payload.routes?.[0];
  const coordinates = route?.geometry?.coordinates;

  if (!route || !coordinates?.length) {
    throw new Error("OSRM không trả về hình học tuyến đường.");
  }

  return {
    coordinates,
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0
  };
}

export function formatRouteDistance(distanceMeters?: number) {
  if (!distanceMeters) {
    return "Đang cập nhật";
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${Math.round((distanceMeters / 1000) * 10) / 10} km`;
}

export function formatRouteDuration(durationSeconds?: number) {
  if (!durationSeconds) {
    return "Đang cập nhật";
  }

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} phút`;
}
