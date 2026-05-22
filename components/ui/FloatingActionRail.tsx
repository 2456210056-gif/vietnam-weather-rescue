"use client";

import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, Map, Navigation, Phone, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";

type FloatingActionRailProps = {
  className?: string;
};

export function FloatingActionRail({ className = "" }: FloatingActionRailProps) {
  const pathname = usePathname();
  const isMap = pathname === "/map";
  const hidden = pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth/");

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

  const actions = [
    {
      label: "SOS khẩn cấp",
      href: "/sos" as Route,
      icon: AlertTriangle,
      className: "bg-red-600 text-white shadow-red-950/30"
    },
    {
      label: "Báo cáo thời tiết",
      href: "/contact" as Route,
      icon: Phone,
      className: "bg-white/20 text-white"
    },
    {
      label: "Mở bản đồ",
      href: "/map" as Route,
      icon: Map,
      className: "bg-white/20 text-white"
    }
  ];

  return (
    <div
      className={`fixed bottom-24 right-3 z-40 flex flex-col gap-3 md:bottom-8 md:right-8 ${className}`}
      aria-label="Thao tác nhanh cứu hộ"
    >
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            aria-label={action.label}
            className={`group grid h-12 w-12 place-items-center rounded-full border border-white/20 shadow-2xl backdrop-blur-xl transition-transform duration-200 hover:scale-110 active:scale-95 ${action.className}`}
            href={action.href}
            key={action.label}
            title={action.label}
          >
            <Icon aria-hidden className="h-5 w-5" />
          </Link>
        );
      })}

      <button
        aria-label="Chia sẻ vị trí hoặc trang hiện tại"
        className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/20 text-white shadow-2xl backdrop-blur-xl transition-transform duration-200 hover:scale-110 active:scale-95"
        onClick={() => void shareLocation()}
        title="Chia sẻ vị trí"
        type="button"
      >
        <Share2 aria-hidden className="h-5 w-5" />
      </button>

      {isMap ? (
        <a
          aria-label="Gọi cứu hộ 114"
          className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-emerald-500 text-white shadow-2xl shadow-emerald-950/25 backdrop-blur-xl transition-transform duration-200 hover:scale-110 active:scale-95"
          href="tel:114"
          title="Gọi 114"
        >
          <Navigation aria-hidden className="h-5 w-5" />
        </a>
      ) : null}
    </div>
  );
}
