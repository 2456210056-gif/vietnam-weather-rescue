"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { AuthStatus } from "@/components/layout/AuthStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type HeaderProps = {
  onOpenMobileNav?: () => void;
};

type PageMeta = {
  eyebrow: string;
  title: string;
};

const DEFAULT_META: PageMeta = {
  eyebrow: "VIETNAM DISASTER RESCUE",
  title: "Thời tiết, cảnh báo & cứu hộ"
};

const PAGE_META: Array<[string, PageMeta]> = [
  [
    "/dashboard",
    {
      eyebrow: "VIETNAM DISASTER RESCUE",
      title: "Bảng điều khiển cá nhân"
    }
  ],
  [
    "/rescuer",
    {
      eyebrow: "RESCUE COMMAND CENTER",
      title: "Trung tâm điều phối cứu hộ"
    }
  ],
  [
    "/admin",
    {
      eyebrow: "SYSTEM ADMINISTRATION",
      title: "Quản trị hệ thống"
    }
  ],
  [
    "/map",
    {
      eyebrow: "WEATHER GIS MAP",
      title: "Bản đồ cứu hộ & thời tiết"
    }
  ],
  [
    "/safety",
    {
      eyebrow: "SAFETY GUIDE",
      title: "Hướng dẫn an toàn"
    }
  ],
  [
    "/contact",
    {
      eyebrow: "CONTACT & REPORT",
      title: "Liên hệ & báo cáo"
    }
  ],
  [
    "/sos",
    {
      eyebrow: "EMERGENCY SOS",
      title: "Phát tín hiệu cứu hộ"
    }
  ]
];

function getPageMeta(pathname: string): PageMeta {
  return PAGE_META.find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ?? DEFAULT_META;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <header className="theme-smooth sticky top-0 z-40 border-b border-white/70 bg-white/90 shadow-sm shadow-blue-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-slate-950/30">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Mở menu điều hướng"
            className="theme-smooth grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg shadow-blue-950/10 transition duration-200 hover:scale-[1.03] active:scale-95 lg:hidden dark:border-white/15 dark:bg-slate-900 dark:text-white"
            onClick={onOpenMobileNav}
            type="button"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-950/20">
            <LayoutDashboard aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-blue-700 dark:text-emerald-300">
              {meta.eyebrow}
            </p>
            <h1 className="truncate text-base font-black text-slate-950 dark:text-white sm:text-lg">
              {meta.title}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
