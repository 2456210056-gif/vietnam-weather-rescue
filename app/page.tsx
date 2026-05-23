import { getServerSession } from "next-auth";
import type { Route } from "next";
import Link from "next/link";
import { BookOpen, FileWarning, Map } from "lucide-react";
import { SOSPanel } from "@/components/sos/SOSPanel";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { authOptions } from "@/lib/auth/options";

const emergencyCards = [
  {
    title: "Báo cáo thời tiết",
    description: "Gửi báo cáo mưa, ngập, sạt lở.",
    href: "/contact",
    icon: FileWarning,
    className: "border-blue-100 bg-blue-50 text-blue-700"
  },
  {
    title: "Hướng dẫn an toàn",
    description: "Cách xử lý nhanh khi có thiên tai.",
    href: "/safety",
    icon: BookOpen,
    className: "border-emerald-100 bg-emerald-50 text-emerald-700"
  }
] as const;

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <WeatherDashboard />

      <SOSPanel />

      <section className="grid gap-4 md:grid-cols-2">
        {emergencyCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              className={`rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5 ${card.className}`}
              href={card.href as Route}
              key={card.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{card.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {card.description}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Bản đồ cứu hộ</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Xem mưa, bão và điểm SOS trên bản đồ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white shadow-lg shadow-blue-950/20"
              href="/map"
            >
              <Map aria-hidden className="h-4 w-4" />
              Mở bản đồ
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
              href={(session ? "/dashboard" : "/login") as Route}
            >
              {session ? "Dashboard" : "Đăng nhập"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
