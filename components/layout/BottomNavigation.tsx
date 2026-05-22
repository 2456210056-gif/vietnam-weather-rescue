"use client";

import { Home, LifeBuoy, Map, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Tổng quan",
    icon: Home
  },
  {
    href: "/map",
    label: "Bản đồ",
    icon: Map
  },
  {
    href: "/sos",
    label: "SOS",
    icon: LifeBuoy,
    emergency: true
  },
  {
    href: "/profile",
    label: "Hồ sơ",
    icon: UserRound
  }
] satisfies {
  href: Route;
  label: string;
  icon: typeof Home;
  emergency?: boolean;
}[];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.10)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`gpu-transition flex h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-semibold transition duration-150 ${
                item.emergency
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : active
                    ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-100"
                    : "text-slate-600 hover:bg-blue-50"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
