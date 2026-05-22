"use client";

import dynamic from "next/dynamic";

const VietnamRescueMap = dynamic(
  () => import("@/components/map/VietnamRescueMap").then((mod) => mod.VietnamRescueMap),
  {
    loading: () => (
      <div className="rounded-3xl border border-white/60 bg-white/85 p-6 text-sm font-black text-slate-700 shadow-soft backdrop-blur-xl">
        Đang tải bản đồ cứu hộ...
      </div>
    ),
    ssr: false
  }
);

export default function MapPage() {
  return <VietnamRescueMap />;
}
