import type { ReactNode } from "react";
import { AlertTriangle, Mail, MapPin } from "lucide-react";
import { ContactReportForm } from "@/components/contact/ContactReportForm";

export default function ContactPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
          Liên hệ & báo cáo
        </p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">
          Gửi báo cáo thời tiết xấu
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Báo cáo được lưu vào MongoDB để đội điều phối rà soát, ưu tiên các điểm
          ngập, sạt lở, gió mạnh và khu vực thiếu cứu hộ.
        </p>

        <ContactReportForm />
      </section>

      <aside className="space-y-3">
        <InfoCard
          icon={<AlertTriangle aria-hidden className="h-5 w-5" />}
          label="Ưu tiên"
          value="Báo cáo nguy cơ trực tiếp: ngập, sạt lở, gió mạnh."
        />
        <InfoCard
          icon={<MapPin aria-hidden className="h-5 w-5" />}
          label="GIS"
          value="Có thể gắn tọa độ hiện tại để Admin kiểm chứng trên bản đồ."
        />
        <InfoCard
          icon={<Mail aria-hidden className="h-5 w-5" />}
          label="Admin"
          value="Báo cáo mới được lưu với trạng thái NEW để xử lý tiếp."
        />
      </aside>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
      <div className="text-red-700">{icon}</div>
      <p className="mt-3 text-sm font-black text-slate-950">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{value}</p>
    </article>
  );
}
