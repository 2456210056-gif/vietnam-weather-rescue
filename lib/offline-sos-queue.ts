import { SOS_NEEDS, type SOSNeed } from "@/types/sos";

export const OFFLINE_SOS_QUEUE_EVENT = "vietnam-rescue-offline-sos-queue";
export const OFFLINE_SOS_QUEUE_KEY = "offline_sos_queue";

const LEGACY_STORAGE_KEYS = [
  "vietnam-rescue-offline-sos-queue",
  "offlineSosQueue",
  "sos_queue",
  "pending_sos"
];

export type OfflineSOSQueueStatus = "queued_offline" | "syncing" | "failed";

export type OfflineSOSQueueItem = {
  localId: string;
  userId?: string;
  name?: string | null;
  phone?: string | null;
  needs?: SOSNeed[];
  emergencyType?: SOSNeed | string | null;
  type?: SOSNeed | string | null;
  note?: string;
  description?: string;
  addressText?: string;
  locationText?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  coordinates?: {
    lat?: number | null;
    lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  accuracy?: number | null;
  createdAt: string;
  status: OfflineSOSQueueStatus;
  retryCount: number;
  lastRetryAt?: string;
  lastError?: string;
  lastKnownSavedAt?: string;
  locationStatus?: "gps_current" | "gps_unavailable" | "last_known" | "manual_required";
};

export type QueueSOSInput = Omit<
  OfflineSOSQueueItem,
  "createdAt" | "lastError" | "lastRetryAt" | "localId" | "retryCount" | "status"
> & {
  createdAt?: string;
};

export type SyncResult = {
  errors: string[];
  failed: number;
  skipped: number;
  synced: number;
  total: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitQueueChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OFFLINE_SOS_QUEUE_EVENT));
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `offline-sos-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse(value: string | null): { invalid: boolean; items: OfflineSOSQueueItem[] } {
  if (!value) {
    return { invalid: false, items: [] };
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return { invalid: true, items: [] };
    }

    return {
      invalid: false,
      items: parsed.filter((item): item is OfflineSOSQueueItem => {
        return Boolean(item) && typeof item === "object" && typeof item.localId === "string";
      })
    };
  } catch {
    return { invalid: true, items: [] };
  }
}

function readQueueKey(key: string) {
  const result = safeJsonParse(window.localStorage.getItem(key));

  if (result.invalid) {
    window.localStorage.removeItem(key);
  }

  return result.items;
}

function dedupeQueueItems(items: OfflineSOSQueueItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.localId)) {
      return false;
    }

    seen.add(item.localId);
    return true;
  });
}

export function getOfflineSOSQueue() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const currentItems = readQueueKey(OFFLINE_SOS_QUEUE_KEY);
    const legacyItems = LEGACY_STORAGE_KEYS.flatMap((key) => readQueueKey(key));
    const items = dedupeQueueItems([...currentItems, ...legacyItems]);

    if (legacyItems.length > 0) {
      window.localStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(items));
      LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }

    return items;
  } catch (error) {
    console.warn("Không thể đọc hàng chờ SOS offline.", error);
    return [];
  }
}

function setOfflineSOSQueue(items: OfflineSOSQueueItem[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(items));
    emitQueueChange();
  } catch (error) {
    console.warn("Không thể lưu hàng chờ SOS offline.", error);
  }
}

export function subscribeOfflineSOSQueue(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (
      event.key === OFFLINE_SOS_QUEUE_KEY ||
      (event.key !== null && LEGACY_STORAGE_KEYS.includes(event.key))
    ) {
      callback();
    }
  }

  window.addEventListener(OFFLINE_SOS_QUEUE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(OFFLINE_SOS_QUEUE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function queueOfflineSOS(input: QueueSOSInput) {
  const item: OfflineSOSQueueItem = {
    ...input,
    localId: createLocalId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    needs: input.needs?.length ? input.needs : ["OTHER"],
    status: "queued_offline",
    retryCount: 0
  };

  setOfflineSOSQueue([item, ...getOfflineSOSQueue()]);

  return item;
}

export function removeOfflineSOS(localId: string) {
  setOfflineSOSQueue(getOfflineSOSQueue().filter((item) => item.localId !== localId));
}

function updateOfflineSOS(localId: string, patch: Partial<OfflineSOSQueueItem>) {
  setOfflineSOSQueue(
    getOfflineSOSQueue().map((item) => (item.localId === localId ? { ...item, ...patch } : item))
  );
}

function normalizeNeed(value: unknown): SOSNeed | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return SOS_NEEDS.includes(normalized as SOSNeed) ? (normalized as SOSNeed) : null;
}

function normalizeNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeOfflineSOSPayload(item: OfflineSOSQueueItem) {
  const latitude = normalizeNumber(item.latitude ?? item.lat ?? item.coordinates?.latitude ?? item.coordinates?.lat);
  const longitude = normalizeNumber(item.longitude ?? item.lng ?? item.coordinates?.longitude ?? item.coordinates?.lng);
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
  const needs = Array.from(
    new Set(
      [
        ...(Array.isArray(item.needs) ? item.needs : []),
        normalizeNeed(item.emergencyType),
        normalizeNeed(item.type)
      ].filter((need): need is SOSNeed => Boolean(need))
    )
  );
  const note =
    item.note?.trim() ||
    item.description?.trim() ||
    "SOS được lưu khi mất mạng; người dùng chưa bổ sung mô tả.";
  const addressText =
    item.addressText?.trim() ||
    item.locationText?.trim() ||
    item.address?.trim() ||
    (hasCoordinates ? "" : "Chưa có mô tả vị trí; SOS được gửi từ hàng chờ offline.");

  return {
    accuracy: normalizeNumber(item.accuracy),
    addressText,
    latitude: hasCoordinates ? latitude : null,
    locationStatus: item.locationStatus ?? (hasCoordinates ? "gps_current" : "gps_unavailable"),
    locationText: addressText,
    longitude: hasCoordinates ? longitude : null,
    needs: needs.length ? needs : (["OTHER"] satisfies SOSNeed[]),
    note,
    offlineLocalId: item.localId,
    originalCreatedAt: item.createdAt ?? new Date().toISOString(),
    phone: item.phone ?? "",
    submittedFromOfflineQueue: true
  };
}

export async function syncOfflineSOSQueue() {
  const queued = getOfflineSOSQueue();
  const result: SyncResult = {
    errors: [],
    failed: 0,
    skipped: 0,
    synced: 0,
    total: queued.length
  };

  if (!queued.length) {
    return result;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    result.failed = queued.length;
    result.errors.push("Chưa có kết nối mạng. SOS vẫn được lưu tạm.");
    return result;
  }

  for (const item of queued) {
    updateOfflineSOS(item.localId, {
      lastError: undefined,
      lastRetryAt: new Date().toISOString(),
      status: "syncing"
    });

    try {
      const payload = normalizeOfflineSOSPayload(item);

      if (process.env.NODE_ENV !== "production") {
        console.warn("[offline-sos] retry payload", {
          localId: item.localId,
          locationStatus: payload.locationStatus,
          needs: payload.needs
        });
      }

      const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        const payload = contentType.includes("application/json")
          ? ((await response.json().catch(() => ({}))) as { error?: string; message?: string })
          : { message: (await response.text().catch(() => "")).slice(0, 160) };
        const message =
          payload.error ||
          payload.message ||
          `Không thể gửi SOS đã lưu. Mã lỗi: ${response.status}`;

        if (process.env.NODE_ENV !== "production") {
          console.warn("[offline-sos] retry failed", {
            localId: item.localId,
            message,
            status: response.status
          });
        }

        throw new Error(message);
      }

      removeOfflineSOS(item.localId);
      result.synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể gửi SOS đã lưu.";
      result.failed += 1;
      result.errors.push(message);
      updateOfflineSOS(item.localId, {
        lastError: message,
        lastRetryAt: new Date().toISOString(),
        retryCount: item.retryCount + 1,
        status: "failed"
      });
    }
  }

  return result;
}
