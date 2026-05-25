"use client";

import { Copy, ExternalLink, Navigation, Phone, RotateCcw, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO, type SOSStatus } from "@/types/sos";

type SOSDetailModalProps = {
  canManage?: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: SOSStatus) => void;
  signal: SOSSignalDTO;
  updating?: boolean;
};

const MANAGE_ACTIONS: Array<{ status: SOSStatus; label: string; className: string }> = [
  { status: "ACKNOWLEDGED", label: "Đã tiếp nhận", className: "bg-blue-600 hover:bg-blue-500" },
  { status: "APPROACHING", label: "Đang xử lý", className: "bg-violet-600 hover:bg-violet-500" },
  { status: "RESOLVED", label: "Hoàn thành", className: "bg-emerald-600 hover:bg-emerald-500" }
];

function formatTime(value?: string | null) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatNeeds(signal: SOSSignalDTO) {
  return signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ") || "Chưa phân loại";
}

export function SOSDetailModal({
  canManage = false,
  onClose,
  onUpdateStatus,
  signal,
  updating = false
}: SOSDetailModalProps) {
  const mapHref = `/map?sosId=${encodeURIComponent(signal.id)}` as Route;
  const routeHref = `/map?sosId=${encodeURIComponent(signal.id)}&route=1` as Route;
  const coordinates = `${signal.coordinates.latitude.toFixed(6)}, ${signal.coordinates.longitude.toFixed(6)}`;

  function copyCoordinates() {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(coordinates);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/68 p-4 backdrop-blur-sm">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/15 bg-white text-slate-950 shadow-2xl dark:bg-slate-950 dark:text-white">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Chi tiết SOS
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {signal.reporterName ?? "Người gửi SOS"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Mã SOS: {signal.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            aria-label="Đóng chi tiết SOS"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[calc(88vh-88px)] overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Số điện thoại" value={signal.reporterPhone ?? "--"} />
            <DetailItem label="Loại sự cố" value={formatNeeds(signal)} />
            <DetailItem label="Trạng thái" value={SOS_STATUS_LABELS[signal.status]} />
            <DetailItem label="Người tiếp nhận" value={signal.assignedRescuerName ?? signal.assignedRescuerId ?? "--"} />
            <DetailItem label="Thời gian gửi" value={formatTime(signal.createdAt)} />
            <DetailItem label="Thời gian tiếp nhận" value={formatTime(signal.acceptedAt)} />
            <DetailItem label="Thời gian hoàn thành" value={formatTime(signal.resolvedAt)} />
            <DetailItem label="Tọa độ" value={coordinates} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Vị trí / mô tả
            </p>
            <p className="mt-2 text-sm font-bold leading-6">
              {signal.addressText ?? "Chưa có địa chỉ văn bản."}
            </p>
            {signal.note ? (
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                {signal.note}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-xs font-black text-white hover:bg-blue-500"
              href={mapHref}
            >
              <ExternalLink aria-hidden className="h-4 w-4" />
              Xem bản đồ
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-500"
              href={routeHref}
            >
              <Navigation aria-hidden className="h-4 w-4" />
              Chỉ đường
            </Link>
            {signal.reporterPhone ? (
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-xs font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                href={`tel:${signal.reporterPhone}`}
              >
                <Phone aria-hidden className="h-4 w-4" />
                Gọi điện
              </a>
            ) : null}
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              onClick={copyCoordinates}
              type="button"
            >
              <Copy aria-hidden className="h-4 w-4" />
              Sao chép tọa độ
            </button>
          </div>

          {canManage && onUpdateStatus ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-3 text-xs font-black text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={updating || signal.status === "PENDING"}
                onClick={() => onUpdateStatus("PENDING")}
                type="button"
              >
                <RotateCcw aria-hidden className="h-4 w-4" />
                Khôi phục chờ
              </button>
              {MANAGE_ACTIONS.map((action) => (
                <button
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400 ${action.className}`}
                  disabled={updating || signal.status === action.status}
                  key={action.status}
                  onClick={() => onUpdateStatus(action.status)}
                  type="button"
                >
                  <ShieldCheck aria-hidden className="h-4 w-4" />
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Timeline xử lý
            </p>
            <div className="mt-3 space-y-3">
              {(signal.timeline ?? []).map((item, index) => (
                <div className="flex gap-3" key={`${item.type}-${item.timestamp}-${index}`}>
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                  <div>
                    <p className="text-sm font-black">
                      {item.type}
                      {item.toStatus ? ` → ${SOS_STATUS_LABELS[item.toStatus]}` : ""}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {formatTime(item.timestamp)}
                      {item.actorName ? ` · ${item.actorName}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {(signal.timeline ?? []).length === 0 ? (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Chưa có timeline xử lý.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-black">{value}</p>
    </div>
  );
}
