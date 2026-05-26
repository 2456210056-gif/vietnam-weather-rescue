export type LastKnownLocation = {
  accuracy: number | null;
  lat: number;
  lng: number;
  savedAt: string;
  source: "browser" | "gps" | "manual";
};

const STORAGE_KEY = "last_known_location";

function isValidLocation(value: unknown): value is LastKnownLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const location = value as Record<string, unknown>;

  return (
    typeof location.lat === "number" &&
    Number.isFinite(location.lat) &&
    typeof location.lng === "number" &&
    Number.isFinite(location.lng) &&
    typeof location.savedAt === "string"
  );
}

export function getLastKnownLocation(): LastKnownLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!isValidLocation(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }

    return null;
  }
}

export function saveLastKnownLocation(location: Omit<LastKnownLocation, "savedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...location,
        savedAt: new Date().toISOString()
      })
    );
  } catch {
    // Location cache is best-effort only.
  }
}
