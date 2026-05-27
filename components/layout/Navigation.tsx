"use client";

import {
  Home,
  LayoutDashboard,
  LifeBuoy,
  MailWarning,
  Map,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  X,
  type LucideIcon
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

type NavigationProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/" as Route, label: "Trang chủ", icon: Home },
  { href: "/map" as Route, label: "Bản đồ", icon: Map },
  { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
  { href: "/safety" as Route, label: "An toàn", icon: ShieldCheck },
  { href: "/contact" as Route, label: "Liên hệ", icon: MailWarning }
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navigation({ mobileOpen, onMobileOpenChange }: NavigationProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const roleItems: NavItem[] =
    role === "admin"
      ? [
          { href: "/rescuer" as Route, label: "Cứu hộ", icon: ShieldCheck },
          { href: "/admin" as Route, label: "Admin", icon: UserCog }
        ]
      : role === "rescuer"
        ? [{ href: "/rescuer" as Route, label: "Cứu hộ", icon: ShieldCheck }]
        : [];
  const items = [...NAV_ITEMS, ...roleItems];

  useEffect(() => {
    if (!mobileOpen) return undefined;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      <aside className="theme-smooth fixed inset-y-0 left-0 z-50 hidden w-72 flex-col overflow-y-auto border-r border-white/10 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/35 lg:flex">
        <SidebarContent items={items} pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[110] bg-black/50 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}
      <aside
        aria-modal="true"
        className={`theme-smooth fixed inset-y-0 left-0 z-[120] w-[min(85vw,320px)] overflow-y-auto border-r border-white/10 bg-slate-950 p-4 text-white shadow-2xl transition-transform duration-[250ms] lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-500 p-4 text-white">
          <BrandLink compact={false} />
          <button
            aria-label="Đóng menu"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 transition hover:bg-white/25"
            onClick={() => onMobileOpenChange(false)}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-6 grid gap-2">
          {items.map((item) => (
            <NavLink
              active={isActive(pathname, item.href)}
              item={item}
              key={item.href}
              onNavigate={() => onMobileOpenChange(false)}
            />
          ))}
        </nav>
        <Link
          className="sos-soft-pulse mt-6 flex items-center justify-center gap-3 rounded-[28px] bg-red-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-red-950/30 transition hover:bg-red-500 active:scale-[0.98]"
          href="/sos"
          onClick={() => onMobileOpenChange(false)}
        >
          <LifeBuoy aria-hidden className="h-5 w-5" />
          SOS khẩn cấp
        </Link>
      </aside>

      <nav className="safe-bottom theme-smooth fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/90 px-2 pt-2 shadow-[0_-12px_30px_rgba(37,99,235,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {[
            NAV_ITEMS[0],
            NAV_ITEMS[1],
            { href: "/sos" as Route, label: "SOS", icon: LifeBuoy },
            NAV_ITEMS[2],
            NAV_ITEMS[4]
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const emergency = item.href === "/sos";

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`gpu-transition flex h-14 flex-col items-center justify-center rounded-2xl text-[10px] font-black transition active:scale-[0.98] ${
                  emergency
                    ? "sos-soft-pulse bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-950/30"
                    : active
                      ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-100 dark:shadow-blue-950/30"
                      : "text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-white/10"
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

function SidebarContent({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <>
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-500 p-4 text-white shadow-lg shadow-blue-950/30">
        <BrandLink compact={false} />
      </div>

      <nav className="mt-6 grid gap-2">
        {items.map((item) => (
          <NavLink active={isActive(pathname, item.href)} item={item} key={item.href} />
        ))}
      </nav>

      <div className="mt-auto space-y-3 pb-3 pt-6">
        <Link
          className="sos-soft-pulse gpu-transition flex items-center justify-center gap-3 rounded-[28px] bg-red-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-red-950/30 transition hover:bg-red-500 active:scale-[0.98]"
          href="/sos"
        >
          <LifeBuoy aria-hidden className="h-5 w-5" />
          SOS khẩn cấp
        </Link>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Phiên bản 1.0.0
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            © Thiết kế bởi nhóm DongVan - 2026
          </p>
        </div>
      </div>
    </>
  );
}

function BrandLink({ compact }: { compact: boolean }) {
  return (
    <Link aria-label="Vietnam Rescue" className="flex min-w-0 items-center gap-3" href="/">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">
        <ShieldAlert aria-hidden className="h-7 w-7" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight">Vietnam Rescue</span>
          <span className="mt-1 block truncate text-xs font-semibold text-white/75">
            Weather GIS SOS
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({
  active,
  item,
  onNavigate
}: {
  active: boolean;
  item: NavItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`gpu-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
        active
          ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-950/30"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
