import { getServerSession } from "next-auth";
import type { Route } from "next";
import Link from "next/link";
import { CloudSun, Database, Map, ShieldCheck, UsersRound } from "lucide-react";
import { SOSPanel } from "@/components/sos/SOSPanel";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { authOptions } from "@/lib/auth/options";

const cards = [
  {
    title: "Auth & Roles",
    value: "Google, Facebook, Email",
    icon: UsersRound,
    tone: "bg-sky-50 text-sky-700"
  },
  {
    title: "MongoDB",
    value: "User, Favorite, SOS",
    icon: Database,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "Rescuer",
    value: "Phân quyền cứu hộ",
    icon: ShieldCheck,
    tone: "bg-blue-50 text-blue-700"
  },
  {
    title: "Weather",
    value: "OpenWeather + Tomorrow",
    icon: CloudSun,
    tone: "bg-amber-50 text-amber-700"
  }
] as const;

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-5">
      <WeatherDashboard />

      <section className="theme-glass flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Hệ thống thời tiết, thiên tai & cứu hộ Việt Nam
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Theo dõi dự báo, bản đồ GIS và phát tín hiệu SOS trong một giao diện mobile-first.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/20"
            href={(session ? "/dashboard" : "/register") as Route}
          >
            {session ? "Mở dashboard" : "Bắt đầu"}
          </Link>
          <Link
            className="rounded-2xl bg-blue-950 px-4 py-3 text-sm font-bold text-white"
            href="/map"
          >
            Bản đồ
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          className="theme-glass rounded-3xl p-4"
          href="/map"
        >
          <Map aria-hidden className="mb-3 h-6 w-6 text-blue-600" />
          <h3 className="font-black text-slate-950">Bản đồ GIS</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Leaflet, OpenStreetMap, radar mưa/bão và SOS realtime.
          </p>
        </Link>
        <Link
          className="rounded-3xl border border-red-100 bg-red-50 p-4 shadow-sm"
          href="/sos"
        >
          <ShieldCheck aria-hidden className="mb-3 h-6 w-6 text-red-700" />
          <h3 className="font-black text-slate-950">SOS cứu hộ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gửi tọa độ khẩn cấp bằng GPS.
          </p>
        </Link>
        <Link
          className="theme-glass rounded-3xl p-4"
          href="/dashboard"
        >
          <UsersRound aria-hidden className="mb-3 h-6 w-6 text-sky-700" />
          <h3 className="font-black text-slate-950">Dashboard</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Địa điểm yêu thích, biểu đồ và lịch sử SOS.
          </p>
        </Link>
      </section>

      <SOSPanel />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="theme-glass rounded-3xl p-4"
              key={card.title}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">{card.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{card.value}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
