"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, MapPinned, Navigation, ShieldCheck, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { SOS_CHANNEL, SOS_EVENTS } from "@/lib/realtime/events";
import { getPusherClient, hasPusherClientConfig } from "@/lib/realtime/pusher-client";
import { useSOSStore } from "@/stores/sosStore";
import { SOS_NEED_LABELS, type SOSRealtimePayload, type SOSSignalDTO } from "@/types/sos";

type SosToast = {
  id: string;
  signal: SOSSignalDTO;
  receivedAt: number;
};

type SOSListResponse = {
  signals: SOSSignalDTO[];
};

const MAX_TOASTS = 3;
const POLLING_INTERVAL_MS = 15_000;
const TOAST_TIMEOUT_MS = 14_000;

function canReceiveSOSNotifications(role?: string) {
  return role === "admin" || role === "rescuer";
}

function formatLocation(signal: SOSSignalDTO) {
  if (signal.addressText) {
    return signal.addressText;
  }

  return signal.coordinates
    ? `${signal.coordinates.latitude.toFixed(5)}, ${signal.coordinates.longitude.toFixed(5)}`
    : "Chưa có tọa độ";
}

function getPrimaryNeed(signal: SOSSignalDTO) {
  const need = signal.needs[0];
  return need ? SOS_NEED_LABELS[need] : "Chưa phân loại";
}

function playAlertSound() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.34);
    window.setTimeout(() => void context.close(), 520);
  } catch {
    // Browsers may block audio until the user interacts. The visual toast remains available.
  }
}

function showBrowserNotification(signal: SOSSignalDTO) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification("SOS khẩn cấp mới", {
    body: `Loại sự cố: ${getPrimaryNeed(signal)}. Vị trí: ${formatLocation(signal)}.`,
    icon: "/icon.svg"
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/map?sosId=${encodeURIComponent(signal.id)}`;
  };
}

export function SosRealtimeNotifier() {
  const { data: session, status } = useSession();
  const canReceive = status === "authenticated" && canReceiveSOSNotifications(session.user.role);
  const upsertSignal = useSOSStore((state) => state.upsertSignal);
  const [toasts, setToasts] = useState<SosToast[]>([]);
  const seenSignalIds = useRef<Set<string>>(new Set());
  const hasPollingBaseline = useRef(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((signal: SOSSignalDTO) => {
    if (seenSignalIds.current.has(signal.id)) {
      return;
    }

    seenSignalIds.current.add(signal.id);
    upsertSignal(signal);
    playAlertSound();
    showBrowserNotification(signal);

    const toast: SosToast = {
      id: `${signal.id}-${Date.now()}`,
      signal,
      receivedAt: Date.now()
    };

    setToasts((current) => [toast, ...current].slice(0, MAX_TOASTS));

    window.setTimeout(() => {
      dismissToast(toast.id);
    }, TOAST_TIMEOUT_MS);
  }, [dismissToast, upsertSignal]);

  useEffect(() => {
    if (!canReceive || !hasPusherClientConfig()) {
      return undefined;
    }

    const pusher = getPusherClient();

    if (!pusher) {
      return undefined;
    }

    const channel = pusher.subscribe(SOS_CHANNEL);
    const handleCreated = (payload: SOSRealtimePayload) => {
      notify(payload.signal);
    };

    channel.bind(SOS_EVENTS.created, handleCreated);

    return () => {
      channel.unbind(SOS_EVENTS.created, handleCreated);
      pusher.unsubscribe(SOS_CHANNEL);
    };
  }, [canReceive, notify]);

  useEffect(() => {
    if (!canReceive || hasPusherClientConfig()) {
      return undefined;
    }

    let cancelled = false;

    async function pollPendingSOS() {
      try {
        const response = await fetch("/api/sos", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as SOSListResponse;
        const pendingSignals = payload.signals.filter((signal) => signal.status === "PENDING");

        if (!hasPollingBaseline.current) {
          pendingSignals.forEach((signal) => seenSignalIds.current.add(signal.id));
          hasPollingBaseline.current = true;
          return;
        }

        if (!cancelled) {
          pendingSignals.forEach(notify);
        }
      } catch {
        // Realtime notification is best effort; dashboards and map can still refetch SOS data.
      }
    }

    void pollPendingSOS();
    const intervalId = window.setInterval(() => void pollPendingSOS(), POLLING_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [canReceive, notify]);

  if (!canReceive) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[120] flex flex-col items-end gap-3 md:inset-x-auto md:right-6 md:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <SosToastCard key={toast.id} onDismiss={() => dismissToast(toast.id)} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SosToastCard({
  onDismiss,
  toast
}: {
  onDismiss: () => void;
  toast: SosToast;
}) {
  const { signal } = toast;
  const mapHref = `/map?sosId=${encodeURIComponent(signal.id)}` as Route;
  const routeHref = `/map?sosId=${encodeURIComponent(signal.id)}&route=1` as Route;

  async function requestBrowserNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="pointer-events-auto w-full max-w-md overflow-hidden rounded-3xl border border-red-300/30 bg-red-600 text-white shadow-2xl shadow-red-950/30"
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
          <AlertTriangle aria-hidden className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
                SOS khẩn cấp mới
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight">
                Có người vừa phát tín hiệu cứu hộ
              </h2>
            </div>
            <button
              aria-label="Đóng thông báo SOS"
              className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              onClick={onDismiss}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold leading-6 text-red-50">
            Vị trí: {formatLocation(signal)}
          </p>
          <p className="text-sm font-semibold leading-6 text-red-50">
            Loại sự cố: {getPrimaryNeed(signal)}
          </p>
          {signal.note ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-red-50/90">
              {signal.note}
            </p>
          ) : null}

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Link
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
              href={mapHref}
              onClick={onDismiss}
            >
              <MapPinned aria-hidden className="h-4 w-4" />
              Xem bản đồ
            </Link>
            <Link
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-950/35 px-3 py-2 text-xs font-black text-white transition hover:bg-red-950/50"
              href="/rescuer"
              onClick={onDismiss}
            >
              <ShieldCheck aria-hidden className="h-4 w-4" />
              Mở cứu hộ
            </Link>
            <Link
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-950/35 px-3 py-2 text-xs font-black text-white transition hover:bg-red-950/50"
              href={routeHref}
              onClick={onDismiss}
            >
              <Navigation aria-hidden className="h-4 w-4" />
              Chỉ đường
            </Link>
          </div>

          <button
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-bold text-red-50 transition hover:bg-white/20"
            onClick={() => void requestBrowserNotifications()}
            type="button"
          >
            <Bell aria-hidden className="h-3.5 w-3.5" />
            Bật thông báo trình duyệt
          </button>
        </div>
      </div>
    </motion.article>
  );
}
