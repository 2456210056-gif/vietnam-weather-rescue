"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Map, Menu, Navigation, PhoneCall, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type FloatingActionRailProps = {
  className?: string;
};

export function FloatingActionRail({ className = "" }: FloatingActionRailProps) {
  const pathname = usePathname();
  const isMap = pathname === "/map";
  const hidden = pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth/");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (hidden) {
    return null;
  }

  async function shareLocation() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Vietnam Disaster Rescue",
        text: "Tôi đang dùng hệ thống thời tiết và cứu hộ SOS.",
        url: window.location.href
      });
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div
      aria-label="Thao tác nhanh cứu hộ"
      className={`pointer-events-auto fixed bottom-24 right-4 z-[80] md:bottom-8 md:right-8 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      ref={menuRef}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-20 right-0 w-64 rounded-3xl border border-white/20 bg-slate-950/80 p-3 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-2xl"
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="space-y-2">
              <ActionLink
                href="/sos"
                icon={<AlertTriangle aria-hidden className="h-5 w-5" />}
                label="SOS khẩn cấp"
                onClick={closeMenu}
                tone="danger"
              />
              <ActionAnchor
                href="tel:114"
                icon={<PhoneCall aria-hidden className="h-5 w-5" />}
                label="Gọi cứu hộ"
                onClick={closeMenu}
              />
              <ActionLink
                href="/map"
                icon={<Map aria-hidden className="h-5 w-5" />}
                label="Mở bản đồ"
                onClick={closeMenu}
              />
              {isMap ? (
                <ActionAnchor
                  href="https://www.google.com/maps/dir/?api=1&travelmode=driving"
                  icon={<Navigation aria-hidden className="h-5 w-5" />}
                  label="Chỉ đường"
                  onClick={closeMenu}
                  target="_blank"
                />
              ) : null}
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-white transition hover:bg-white/10"
                onClick={() => {
                  closeMenu();
                  void shareLocation();
                }}
                type="button"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                  <Share2 aria-hidden className="h-5 w-5" />
                </span>
                Chia sẻ vị trí
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        aria-expanded={open}
        aria-label="Mở menu thao tác nhanh"
        className="relative grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl transition hover:scale-105 active:scale-95"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Menu aria-hidden className="h-6 w-6" />
        <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-red-600 shadow-[0_0_18px_rgba(220,38,38,0.7)]" />
      </button>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  label,
  onClick,
  tone = "default"
}: {
  href: Route;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  const danger = tone === "danger";

  return (
    <Link
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
        danger ? "bg-red-600 text-white hover:bg-red-500" : "text-white hover:bg-white/10"
      }`}
      href={href}
      onClick={onClick}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${danger ? "bg-white/15" : "bg-white/10"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function ActionAnchor({
  href,
  icon,
  label,
  onClick,
  target
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  target?: "_blank";
}) {
  return (
    <a
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
      href={href}
      onClick={onClick}
      rel={target ? "noopener noreferrer" : undefined}
      target={target}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
        {icon}
      </span>
      {label}
    </a>
  );
}
