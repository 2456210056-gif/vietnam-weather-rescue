import type { SOSNeed } from "@/types/sos";

export const OFFLINE_SOS_QUEUE_EVENT = "vietnam-rescue-offline-sos-queue";

const STORAGE_KEY = "vietnam-rescue-offline-sos-queue";

export type OfflineSOSQueueStatus = "queued_offline" | "syncing" | "failed";

export type OfflineSOSQueueItem = {
  localId: string;
  userId?: string;
  name?: string | null;
  phone?: string | null;
  needs: SOSNeed[];
  note?: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
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

type SyncResult = {
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
        return (
          item &&
          typeof item === "object" &&
          typeof item.localId === "string" &&
          Array.isArray(item.needs) &&
          typeof item.createdAt === "string"
        );
      })
    };
  } catch {
    return { invalid: true, items: [] };
  }
}

export function getOfflineSOSQueue() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const result = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));

    if (result.invalid) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    return result.items;
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
    if (event.key === STORAGE_KEY) {
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

function hasValidCoordinates(item: OfflineSOSQueueItem) {
  return (
    typeof item.latitude === "number" &&
    Number.isFinite(item.latitude) &&
    typeof item.longitude === "number" &&
    Number.isFinite(item.longitude)
  );
}

export async function syncOfflineSOSQueue() {
  const queued = getOfflineSOSQueue();
  const result: SyncResult = {
    failed: 0,
    skipped: 0,
    synced: 0,
    total: queued.length
  };

  if (!queued.length || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return result;
  }

  for (const item of queued) {
    if (!hasValidCoordinates(item)) {
      result.skipped += 1;
      updateOfflineSOS(item.localId, {
        lastError: "Thiếu tọa độ GPS. Hãy mở chi tiết SOS và bổ sung mô tả/vị trí trước khi gửi lại.",
        lastRetryAt: new Date().toISOString(),
        status: "failed"
      });
      continue;
    }

    updateOfflineSOS(item.localId, {
      lastError: undefined,
      lastRetryAt: new Date().toISOString(),
      status: "syncing"
    });

    try {
      const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accuracy: item.accuracy,
          addressText: item.addressText,
          latitude: item.latitude,
          longitude: item.longitude,
          needs: item.needs,
          note: item.note,
          offlineLocalId: item.localId,
          originalCreatedAt: item.createdAt,
          submittedFromOfflineQueue: true
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Không thể gửi SOS đã lưu.");
      }

      removeOfflineSOS(item.localId);
      result.synced += 1;
    } catch (error) {
      result.failed += 1;
      updateOfflineSOS(item.localId, {
        lastError: error instanceof Error ? error.message : "Không thể gửi SOS đã lưu.",
        lastRetryAt: new Date().toISOString(),
        retryCount: item.retryCount + 1,
        status: "failed"
      });
    }
  }

  return result;
}
