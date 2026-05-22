import type { Route } from "next";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 text-center md:pb-8">
      <div className="theme-glass rounded-[28px] px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Vietnam Weather GIS SOS
        </p>
        <p className="mt-2 text-sm font-black text-slate-950 sm:text-base">
          © Thiết kế bởi nhóm DongVan - 2026
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-500">
          <Link className="hover:text-blue-700" href={"/safety" as Route}>
            Hướng dẫn an toàn
          </Link>
          <Link className="hover:text-blue-700" href={"/privacy" as Route}>
            Quyền riêng tư
          </Link>
          <Link className="hover:text-blue-700" href={"/terms" as Route}>
            Điều khoản
          </Link>
        </div>
      </div>
    </footer>
  );
}
