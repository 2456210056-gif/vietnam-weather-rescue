export type SavedWeatherLocation = {
  lat: number;
  lon: number;
  locationName: string;
  source: "gps" | "manual" | "default";
  updatedAt: number;
  locationId?: string;
};

const STORAGE_KEY = "vietnam-rescue-weather-location";
const STORAGE_CHANGE_EVENT = "vietnam-rescue-weather-location-change";
let cachedRawLocation: string | null = null;
let cachedParsedLocation: SavedWeatherLocation | null = null;

function isValidSavedLocation(value: unknown): value is SavedWeatherLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const location = value as Partial<SavedWeatherLocation>;

  return (
    typeof location.lat === "number" &&
    Number.isFinite(location.lat) &&
    typeof location.lon === "number" &&
    Number.isFinite(location.lon) &&
    typeof location.locationName === "string" &&
    location.locationName.trim().length > 0 &&
    (location.source === "gps" ||
      location.source === "manual" ||
      location.source === "default")
  );
}

export function saveWeatherLocation(location: SavedWeatherLocation) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function getSavedWeatherLocation(): SavedWeatherLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      cachedRawLocation = null;
      cachedParsedLocation = null;
      return null;
    }

    if (raw === cachedRawLocation) {
      return cachedParsedLocation;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!isValidSavedLocation(parsed)) {
      cachedRawLocation = raw;
      cachedParsedLocation = null;
      return null;
    }

    cachedRawLocation = raw;
    cachedParsedLocation = parsed;
    return parsed;
  } catch {
    cachedRawLocation = null;
    cachedParsedLocation = null;
    return null;
  }
}

export function clearSavedWeatherLocation() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function subscribeWeatherLocation(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_CHANGE_EVENT, listener);
  };
}
