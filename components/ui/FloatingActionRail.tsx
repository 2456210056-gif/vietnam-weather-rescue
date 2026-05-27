"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Map, Menu, Navigation, PhoneCall, Share2, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type FloatingActionRailProps = {
  className?: string;
};

export function FloatingActionRail({ className = "" }: FloatingActionRailProps) {
  const pathname = usePathname();
  const isMap = pathname === "/map";
  const hidden =
    pathname === "/dashboard" ||
    pathname === "/admin" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/auth/");
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
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
        setFeedback("");
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
    setFeedback("");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Vietnam Disaster Rescue",
          text: "Tôi đang dùng hệ thống thời tiết và cứu hộ SOS.",
          url: window.location.href
        });
        setFeedback("Đã mở chia sẻ vị trí.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setFeedback("Đã sao chép liên kết hiện tại.");
        return;
      }

      setFeedback("Trình duyệt chưa hỗ trợ chia sẻ nhanh.");
    } catch {
      setFeedback("Không thể chia sẻ lúc này.");
    }
  }

  function closeMenu() {
    setOpen(false);
    setFeedback("");
  }

  return (
    <div
      aria-label="Thao tác nhanh cứu hộ"
      className={`pointer-events-auto fixed bottom-24 right-4 z-[80] md:bottom-8 md:right-8 ${className}`}
      ref={menuRef}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-20 right-0 w-60 rounded-3xl border border-white/15 bg-slate-950/95 p-2.5 text-white shadow-2xl shadow-blue-950/25 backdrop-blur-xl"
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
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
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-white transition duration-200 hover:bg-white/10 active:scale-[0.98]"
                onClick={() => {
                  void shareLocation();
                }}
                type="button"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                  <Share2 aria-hidden className="h-5 w-5" />
                </span>
                Chia sẻ vị trí
              </button>
              {feedback ? (
                <p aria-live="polite" className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold leading-5 text-slate-200">
                  {feedback}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        aria-expanded={open}
        aria-label="Mở menu thao tác nhanh"
        className="theme-smooth relative grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-xl shadow-blue-950/25 backdrop-blur-xl transition duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 active:scale-95 md:h-14 md:w-14"
        onClick={() => {
          setFeedback("");
          setOpen((current) => !current);
        }}
        type="button"
      >
        {open ? <X aria-hidden className="h-6 w-6" /> : <Menu aria-hidden className="h-6 w-6" />}
        <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-red-600" />
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
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition duration-200 ${
        danger ? "bg-red-600 text-white hover:bg-red-500" : "text-white hover:bg-white/10"
      }`}
      href={href}
      onClick={onClick}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${danger ? "bg-white/15" : "bg-white/10"}`}>
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
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black text-white transition duration-200 hover:bg-white/10"
      href={href}
      onClick={onClick}
      rel={target ? "noopener noreferrer" : undefined}
      target={target}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
        {icon}
      </span>
      {label}
    </a>
  );
}
