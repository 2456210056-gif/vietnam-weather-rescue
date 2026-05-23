import type { ReactNode } from "react";
import { AlertTriangle, ClipboardCheck, MapPin } from "lucide-react";
import { ContactReportForm } from "@/components/contact/ContactReportForm";

export default function ContactPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
          Liên hệ & báo cáo
        </p>
        <h2 className="mt-2 text-3xl font-black text-slate-950 lg:text-4xl">
          Gửi báo cáo thời tiết xấu
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
          Báo cáo được lưu vào MongoDB để đội điều phối kiểm tra.
        </p>

        <ContactReportForm />
      </section>

      <aside className="space-y-4">
        <InfoCard
          icon={<ClipboardCheck aria-hidden className="h-5 w-5" />}
          label="Quy trình xử lý"
          value="Hệ thống ghi nhận báo cáo, gắn thời gian và trạng thái để Admin rà soát."
        />
        <InfoCard
          icon={<MapPin aria-hidden className="h-5 w-5" />}
          label="Tọa độ GIS"
          value="Có thể đính kèm vị trí hiện tại để kiểm chứng nhanh trên bản đồ."
        />
        <InfoCard
          icon={<AlertTriangle aria-hidden className="h-5 w-5" />}
          label="Nguy hiểm thật"
          value="Hãy gọi 112, 113, 114 hoặc 115 ngay khi cần hỗ trợ khẩn cấp."
          danger
        />
      </aside>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  danger = false
}: {
  icon: ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <article className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className={danger ? "text-red-600" : "text-blue-600"}>{icon}</div>
      <p className="mt-3 text-base font-black text-slate-950">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{value}</p>
    </article>
  );
}
