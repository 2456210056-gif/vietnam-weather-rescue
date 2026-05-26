"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getOfflineSOSQueue,
  type OfflineSOSQueueItem,
  removeOfflineSOS,
  subscribeOfflineSOSQueue,
  syncOfflineSOSQueue
} from "@/lib/offline-sos-queue";

export function useOfflineSOSQueue() {
  const [items, setItems] = useState<OfflineSOSQueueItem[]>([]);

  useEffect(() => {
    function refreshQueue() {
      setItems(getOfflineSOSQueue());
    }

    refreshQueue();
    return subscribeOfflineSOSQueue(refreshQueue);
  }, []);

  const retryNow = useCallback(async () => {
    const result = await syncOfflineSOSQueue();
    setItems(getOfflineSOSQueue());
    return result;
  }, []);

  const remove = useCallback((localId: string) => {
    removeOfflineSOS(localId);
    setItems(getOfflineSOSQueue());
  }, []);

  return {
    items,
    remove,
    retryNow
  };
}
