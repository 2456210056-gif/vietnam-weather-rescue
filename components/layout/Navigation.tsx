"use client";

import {
  Home,
  LayoutDashboard,
  LifeBuoy,
  MailWarning,
  Map,
  ShieldAlert,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/" as Route,
    label: "Trang chủ",
    icon: Home
  },
  {
    href: "/map" as Route,
    label: "Bản đồ",
    icon: Map
  },
  {
    href: "/dashboard" as Route,
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/safety" as Route,
    label: "An toàn",
    icon: ShieldCheck
  },
  {
    href: "/contact" as Route,
    label: "Liên hệ",
    icon: MailWarning
  }
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const roleItems =
    role === "admin"
      ? [
          { href: "/rescuer" as Route, label: "Cứu hộ", icon: ShieldCheck },
          { href: "/admin" as Route, label: "Admin", icon: UserCog }
        ]
      : role === "rescuer"
        ? [{ href: "/rescuer" as Route, label: "Cứu hộ", icon: ShieldCheck }]
        : [];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-white/60 bg-white/80 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-xl md:flex md:flex-col">
        <Link className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-500 p-4 text-white shadow-lg shadow-blue-200" href="/">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <ShieldAlert aria-hidden className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-sm font-black leading-tight">Vietnam Rescue</span>
            <span className="mt-1 block text-xs font-semibold text-slate-300">
              Weather GIS SOS
            </span>
          </span>
        </Link>

        <nav className="mt-6 grid gap-2">
          {[...NAV_ITEMS, ...roleItems].map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`gpu-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-200"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          className="gpu-transition mt-auto flex items-center justify-center gap-3 rounded-3xl bg-red-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-red-200 transition active:scale-[0.98]"
          href="/sos"
        >
          <LifeBuoy aria-hidden className="h-5 w-5" />
          SOS khẩn cấp
        </Link>
      </aside>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/60 bg-white/90 px-2 pt-2 shadow-[0_-12px_30px_rgba(37,99,235,0.12)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {[
            NAV_ITEMS[0],
            NAV_ITEMS[1],
            {
              href: "/sos" as Route,
              label: "SOS",
              icon: LifeBuoy,
              emergency: true
            },
            NAV_ITEMS[2],
            NAV_ITEMS[4]
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const emergency = "emergency" in item && item.emergency;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`gpu-transition flex h-14 flex-col items-center justify-center rounded-2xl text-[10px] font-black transition active:scale-[0.98] ${
                  emergency
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
    </>
  );
}
