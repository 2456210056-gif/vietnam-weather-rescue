"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getOfflineSOSQueue, syncOfflineSOSQueue } from "@/lib/offline-sos-queue";

export function OfflineSOSSync() {
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"amber" | "emerald">("amber");

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let cancelled = false;

    async function syncQueue() {
      const pendingCount = getOfflineSOSQueue().length;

      if (!pendingCount) {
        return;
      }

      const result = await syncOfflineSOSQueue();

      if (cancelled) {
        return;
      }

      if (result.synced > 0) {
        setTone("emerald");
        setMessage(`Đã gửi ${result.synced} SOS đã lưu khi có mạng trở lại.`);
      } else if (result.failed > 0 || result.skipped > 0) {
        setTone("amber");
        setMessage(result.errors[0] ?? "Một số SOS offline vẫn đang chờ gửi. Hãy kiểm tra lại hoặc đăng nhập.");
      }
    }

    void syncQueue();
    window.addEventListener("online", syncQueue);

    return () => {
      cancelled = true;
      window.removeEventListener("online", syncQueue);
    };
  }, [isOnline]);

  if (!message || pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-24 left-4 z-[120] max-w-sm rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl md:bottom-8 ${
        tone === "emerald"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      {message}
    </div>
  );
}
