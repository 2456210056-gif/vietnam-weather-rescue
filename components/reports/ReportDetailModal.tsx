"use client";

import Link from "next/link";
import type { Route } from "next";
import { Copy, ExternalLink, MapPinned, X } from "lucide-react";
import {
  REPORT_SEVERITY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type WeatherReportDTO
} from "@/types/report";

type ReportDetailModalProps = {
  canManage?: boolean;
  isUpdating?: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: WeatherReportDTO["status"]) => void;
  report: WeatherReportDTO;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function hasCoordinates(report: WeatherReportDTO) {
  return typeof report.latitude === "number" && typeof report.longitude === "number";
}

export function ReportDetailModal({
  canManage = false,
  isUpdating = false,
  onClose,
  onUpdateStatus,
  report
}: ReportDetailModalProps) {
  const coordinates = hasCoordinates(report)
    ? `${report.latitude?.toFixed(6)}, ${report.longitude?.toFixed(6)}`
    : "Chưa có tọa độ";

  async function copyCoordinates() {
    if (!hasCoordinates(report) || !navigator.clipboard) return;
    await navigator.clipboard.writeText(coordinates);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/68 p-4 backdrop-blur-sm">
      <section className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white text-slate-950 shadow-2xl dark:bg-slate-950 dark:text-white">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:text-sky-300">
              Chi tiết báo cáo
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {REPORT_TYPE_LABELS[report.type] ?? report.type} · {report.area}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Mã báo cáo: {report.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Người gửi" value={report.fullName ?? "Chưa rõ"} />
            <Info label="Liên hệ" value={report.phone ?? report.email ?? report.contact ?? "--"} />
            <Info label="Mức độ" value={REPORT_SEVERITY_LABELS[report.severity]} />
            <Info label="Trạng thái" value={REPORT_STATUS_LABELS[report.status]} />
            <Info label="Thời gian gửi" value={formatTime(report.createdAt)} />
            <Info label="Tọa độ GIS" value={coordinates} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              Nội dung
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
              {report.description}
            </p>
          </div>

          {report.note ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
                Ghi chú xử lý
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900 dark:text-emerald-100">
                {report.note}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-slate-200 p-5 dark:border-white/10">
          <div className="flex flex-wrap gap-2">
            {hasCoordinates(report) ? (
              <>
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-xs font-black text-white"
                  href={`/map?lat=${report.latitude}&lng=${report.longitude}&type=report&reportId=${report.id}` as Route}
                >
                  <MapPinned aria-hidden className="h-4 w-4" />
                  Mở bản đồ
                </Link>
                <a
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden className="h-4 w-4" />
                  Chỉ đường
                </a>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  onClick={() => void copyCoordinates()}
                  type="button"
                >
                  <Copy aria-hidden className="h-4 w-4" />
                  Sao chép tọa độ
                </button>
              </>
            ) : (
              <span className="inline-flex h-10 items-center rounded-2xl border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                Báo cáo này chưa có tọa độ.
              </span>
            )}

            {canManage && onUpdateStatus ? (
              <>
                <StatusButton disabled={isUpdating} label="Xác minh" onClick={() => onUpdateStatus("VERIFIED")} />
                <StatusButton disabled={isUpdating} label="Đã xử lý" onClick={() => onUpdateStatus("RESOLVED")} />
                <StatusButton disabled={isUpdating} label="Từ chối" onClick={() => onUpdateStatus("REJECTED")} tone="danger" />
              </>
            ) : null}
          </div>
        </footer>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function StatusButton({
  disabled,
  label,
  onClick,
  tone = "default"
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  tone?: "danger" | "default";
}) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400 ${
        tone === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
