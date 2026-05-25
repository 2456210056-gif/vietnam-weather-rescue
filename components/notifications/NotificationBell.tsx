"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, ExternalLink, MapPinned, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO } from "@/types/sos";

type SOSListResponse = {
  signals: SOSSignalDTO[];
};

type NotificationItem = {
  id: string;
  href: Route;
  actionHref?: Route;
  title: string;
  message: string;
  createdAt: string;
  urgent: boolean;
};

const STORAGE_KEY = "vietnam-rescue-notifications-seen-at";

async function fetcher<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải thông báo.");
  }

  return payload;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function getSignalTitle(signal: SOSSignalDTO) {
  const need = signal.needs[0];
  return need ? SOS_NEED_LABELS[need] : "Tín hiệu SOS";
}

function toNotification(signal: SOSSignalDTO, privileged: boolean): NotificationItem {
  const location = signal.addressText
    ? signal.addressText
    : `${signal.coordinates.latitude.toFixed(5)}, ${signal.coordinates.longitude.toFixed(5)}`;
  const href = `/map?sosId=${encodeURIComponent(signal.id)}` as Route;

  return {
    id: signal.id,
    href,
    actionHref: privileged ? ("/rescuer" as Route) : undefined,
    title: privileged ? "SOS cần theo dõi" : "Cập nhật SOS của bạn",
    message: `${getSignalTitle(signal)} • ${SOS_STATUS_LABELS[signal.status]} • ${location}`,
    createdAt: signal.updatedAt ?? signal.createdAt,
    urgent: signal.status === "PENDING"
  };
}

export function NotificationBell() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const privileged =
    status === "authenticated" &&
    (session.user.role === "admin" || session.user.role === "rescuer");
  const endpoint =
    status === "authenticated"
      ? privileged
        ? "/api/rescuer/sos"
        : "/api/sos/my-history"
      : null;
  const { data } = useSWR<SOSListResponse>(endpoint, fetcher<SOSListResponse>, {
    refreshInterval: privileged ? 15_000 : 30_000,
    revalidateOnFocus: true
  });

  useEffect(() => {
    window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setSeenAt(saved ? Number(saved) || 0 : 0);
    }, 0);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const notifications = useMemo(
    () =>
      (data?.signals ?? [])
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((signal) => toNotification(signal, privileged)),
    [data?.signals, privileged]
  );
  const unreadCount = notifications.filter(
    (item) => new Date(item.createdAt).getTime() > seenAt
  ).length;

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (!current) {
        const now = Date.now();
        setSeenAt(now);
        window.localStorage.setItem(STORAGE_KEY, String(now));
      }

      return next;
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Thông báo"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg shadow-blue-950/10 backdrop-blur-xl transition hover:scale-[1.03] hover:border-blue-200 hover:text-blue-700 active:scale-95 dark:border-white/15 dark:bg-slate-950/90 dark:text-slate-100 dark:shadow-slate-950/30 dark:hover:text-emerald-300"
        onClick={toggleOpen}
        type="button"
      >
        <Bell aria-hidden className={`h-5 w-5 ${unreadCount ? "animate-pulse" : ""}`} />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-lg shadow-red-600/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed inset-x-4 top-20 z-[120] max-h-[70svh] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-3 text-slate-900 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-96 dark:border-white/15 dark:bg-slate-950/95 dark:text-white"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <div>
                <p className="text-sm font-black">Thông báo</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {privileged ? "SOS realtime và điều phối" : "Cập nhật cá nhân"}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-sky-200">
                {notifications.length}
              </span>
            </div>

            <div className="mt-2 space-y-2">
              {notifications.map((item) => (
                <article
                  className={`rounded-2xl border p-3 ${
                    item.urgent
                      ? "border-red-200 bg-red-50 text-red-950 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-50"
                      : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  }`}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                        {item.message}
                      </p>
                      <p className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                    {item.urgent ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600 shadow-lg shadow-red-600/40" />
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white"
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <MapPinned aria-hidden className="h-3.5 w-3.5" />
                      Xem bản đồ
                    </Link>
                    {item.actionHref ? (
                      <Link
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white"
                        href={item.actionHref}
                        onClick={() => setOpen(false)}
                      >
                        <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
                        Mở cứu hộ
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:text-slate-400">
                  Chưa có thông báo mới.
                </div>
              ) : null}
            </div>

            <Link
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              href={(privileged ? "/rescuer" : "/dashboard") as Route}
              onClick={() => setOpen(false)}
            >
              Xem tất cả
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
