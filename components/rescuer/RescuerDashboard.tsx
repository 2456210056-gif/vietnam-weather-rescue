"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Compass,
  Loader2,
  MapPinned,
  PhoneCall,
  RadioTower,
  Route as RouteIcon,
  ShieldCheck,
  Siren,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  SOS_NEED_LABELS,
  SOS_STATUS_LABELS,
  type SOSSignalDTO,
  type SOSStatus
} from "@/types/sos";

type RescueResponse = {
  signals: SOSSignalDTO[];
};

const STATUS_ACTIONS: { status: SOSStatus; label: string; className: string }[] = [
  { status: "ACKNOWLEDGED", label: "Đã tiếp nhận", className: "bg-blue-600 hover:bg-blue-500" },
  { status: "APPROACHING", label: "Đang tiếp cận", className: "bg-violet-600 hover:bg-violet-500" },
  { status: "RESOLVED", label: "Đã xử lý", className: "bg-emerald-600 hover:bg-emerald-500" }
];

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu.");
  }

  return payload;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function getStatusCounts(signals: SOSSignalDTO[]) {
  return signals.reduce(
    (acc, signal) => {
      if (signal.status === "PENDING") acc.pending += 1;
      if (signal.status === "ACKNOWLEDGED") acc.acknowledged += 1;
      if (signal.status === "APPROACHING" || signal.status === "REACHED") acc.approaching += 1;
      if (signal.status === "RESOLVED") acc.resolved += 1;
      return acc;
    },
    {
      pending: 0,
      acknowledged: 0,
      approaching: 0,
      resolved: 0
    }
  );
}

function formatNeeds(signal: SOSSignalDTO) {
  return signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ");
}

export function RescuerDashboard() {
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<SOSSignalDTO | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | SOSStatus>("ALL");
  const { data, error, isLoading, mutate } = useSWR<RescueResponse>(
    "/api/rescuer/sos",
    fetcher<RescueResponse>,
    {
      refreshInterval: 15_000
    }
  );

  const signals = useMemo(() => data?.signals ?? [], [data?.signals]);
  const filteredSignals = useMemo(
    () =>
      statusFilter === "ALL"
        ? signals
        : signals.filter((signal) => signal.status === statusFilter),
    [signals, statusFilter]
  );
  const counts = useMemo(() => getStatusCounts(signals), [signals]);
  const urgentSignals = signals.filter((signal) => signal.status === "PENDING").slice(0, 5);

  async function updateStatus(signal: SOSSignalDTO, status: SOSStatus) {
    setUpdatingId(signal.id);
    setMessage("");

    const response = await fetch(`/api/sos/${signal.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    setUpdatingId("");
    setMessage(payload.message ?? "Đã cập nhật trạng thái.");
    await mutate();
  }

  return (
    <div className="rounded-[36px] bg-[#050B18] p-4 text-white shadow-2xl shadow-slate-950/35 lg:p-6">
      <div className="mb-6 rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Rescue Command Center
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white lg:text-4xl">
              Trung tâm điều phối cứu hộ
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              Theo dõi, nhận ca và xử lý tín hiệu SOS theo thời gian thực.
            </p>
          </div>
          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 active:scale-[0.98]"
            href="/map"
          >
            <MapPinned aria-hidden className="h-4 w-4" />
            Mở bản đồ cứu hộ
          </Link>
        </div>
      </div>

      {message ? (
        <p className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-100">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-32 animate-pulse rounded-3xl bg-slate-900/80" key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              description="Cần phản hồi ngay"
              icon={<Siren aria-hidden className="h-6 w-6" />}
              title="SOS đang chờ"
              value={counts.pending}
              variant="red"
            />
            <KpiCard
              description="Đã có đội phụ trách"
              icon={<ShieldCheck aria-hidden className="h-6 w-6" />}
              title="Đã tiếp nhận"
              value={counts.acknowledged}
              variant="blue"
            />
            <KpiCard
              description="Đang di chuyển"
              icon={<Compass aria-hidden className="h-6 w-6" />}
              title="Đang tiếp cận"
              value={counts.approaching}
              variant="violet"
            />
            <KpiCard
              description="Hoàn tất xử lý"
              icon={<CheckCircle2 aria-hidden className="h-6 w-6" />}
              title="Đã xử lý"
              value={counts.resolved}
              variant="emerald"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
            <DashboardSection
              description="Các tín hiệu mới nhất cần điều phối."
              eyebrow="SOS queue"
              title="Danh sách tín hiệu"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {(["ALL", "PENDING", "ACKNOWLEDGED", "APPROACHING", "RESOLVED", "CANCELLED"] as const).map(
                  (status) => (
                    <button
                      className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                        statusFilter === status
                          ? "border-blue-400/30 bg-blue-500/20 text-sky-100"
                          : "border-white/10 bg-slate-950/45 text-slate-300 hover:bg-white/10"
                      }`}
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      type="button"
                    >
                      {status === "ALL" ? "Tất cả" : SOS_STATUS_LABELS[status]}
                    </button>
                  )
                )}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredSignals.map((signal) => (
                    <SosDispatchCard
                      key={signal.id}
                      onOpenDetails={() => setSelectedSignal(signal)}
                      onUpdateStatus={(status) => void updateStatus(signal, status)}
                      signal={signal}
                      updating={updatingId === signal.id}
                  />
                ))}
                {filteredSignals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/35 p-8 text-center lg:col-span-2">
                    <RadioTower aria-hidden className="mx-auto h-8 w-8 text-slate-500" />
                    <p className="mt-3 text-base font-black text-white">
                      Chưa có tín hiệu SOS đang chờ xử lý.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Khi có tín hiệu mới, hệ thống sẽ tự cập nhật và hiển thị toast.
                    </p>
                  </div>
                ) : null}
              </div>
            </DashboardSection>

            <div className="space-y-6">
              <DashboardSection
                action={
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-200">
                    Polling 15s
                  </span>
                }
                eyebrow="Realtime"
                title="Điều phối nhanh"
              >
                <div className="space-y-3">
                  <Link
                    className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/45 p-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-blue-400/30"
                    href="/map"
                  >
                    <span className="flex items-center gap-3">
                      <MapPinned aria-hidden className="h-5 w-5 text-sky-300" />
                      Mở bản đồ realtime
                    </span>
                    <span className="text-slate-500">→</span>
                  </Link>
                  <a
                    className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/45 p-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-emerald-400/30"
                    href="tel:114"
                  >
                    <span className="flex items-center gap-3">
                      <PhoneCall aria-hidden className="h-5 w-5 text-emerald-300" />
                      Gọi PCCC/cứu nạn
                    </span>
                    <span className="text-slate-500">114</span>
                  </a>
                </div>
              </DashboardSection>

              <DashboardSection eyebrow="Priority" title="SOS ưu tiên">
                <div className="space-y-3">
                  {urgentSignals.map((signal) => (
                    <Link
                      className="block rounded-3xl border border-red-400/15 bg-red-500/10 p-4 transition hover:-translate-y-0.5 hover:border-red-300/30"
                      href={`/map?sosId=${signal.id}` as Route}
                      key={signal.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-black text-white">
                          {signal.reporterName ?? "Người dùng SOS"}
                        </p>
                        <StatusBadge tone="PENDING">Pending</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm font-bold text-red-100">{formatNeeds(signal)}</p>
                      <p className="mt-1 text-xs font-semibold text-red-100/70">
                        {formatTime(signal.createdAt)}
                      </p>
                    </Link>
                  ))}
                  {urgentSignals.length === 0 ? (
                    <p className="rounded-3xl border border-dashed border-white/15 p-5 text-center text-sm font-bold text-slate-500">
                      Không có SOS pending.
                    </p>
                  ) : null}
                </div>
              </DashboardSection>
            </div>
          </div>
        </div>
      )}
      {selectedSignal ? (
        <SosDetailDrawer
          onClose={() => setSelectedSignal(null)}
          onUpdateStatus={(status) => void updateStatus(selectedSignal, status)}
          signal={selectedSignal}
          updating={updatingId === selectedSignal.id}
        />
      ) : null}
    </div>
  );
}

function SosDispatchCard({
  onUpdateStatus,
  onOpenDetails,
  signal,
  updating
}: {
  onOpenDetails: () => void;
  onUpdateStatus: (status: SOSStatus) => void;
  signal: SOSSignalDTO;
  updating: boolean;
}) {
  const mapHref = `/map?sosId=${signal.id}` as Route;
  const routeHref = `/map?sosId=${signal.id}&route=1` as Route;

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-slate-950/20 transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black text-white">
            {signal.reporterName ?? "Người dùng SOS"}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {formatTime(signal.createdAt)}
          </p>
        </div>
        <StatusBadge tone={signal.status}>{SOS_STATUS_LABELS[signal.status]}</StatusBadge>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-slate-300">{formatNeeds(signal)}</p>
      {signal.note ? <p className="mt-2 text-sm leading-6 text-slate-500">{signal.note}</p> : null}

      <div className="mt-4 grid gap-2 text-xs font-bold text-slate-400 sm:grid-cols-2">
        <span className="rounded-2xl bg-white/5 px-3 py-2">
          {signal.coordinates.latitude.toFixed(5)}, {signal.coordinates.longitude.toFixed(5)}
        </span>
        <span className="rounded-2xl bg-white/5 px-3 py-2">
          Mã: {signal.id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-800 px-3 text-xs font-black text-white transition hover:bg-slate-700"
          onClick={onOpenDetails}
          type="button"
        >
          Chi tiết
        </button>
        <Link
          className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-800 px-3 text-xs font-black text-white transition hover:bg-slate-700"
          href={mapHref}
        >
          <MapPinned aria-hidden className="h-4 w-4" />
          Bản đồ
        </Link>
        <Link
          className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 text-xs font-black text-white transition active:scale-[0.98]"
          href={routeHref}
        >
          <RouteIcon aria-hidden className="h-4 w-4" />
          Chỉ đường
        </Link>
        {signal.reporterPhone ? (
          <a
            className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-500"
            href={`tel:${signal.reporterPhone}`}
          >
            <PhoneCall aria-hidden className="h-4 w-4" />
            Gọi
          </a>
        ) : (
          <span className="flex h-10 items-center justify-center rounded-2xl bg-white/5 px-3 text-xs font-bold text-slate-500">
            Chưa có SĐT
          </span>
        )}
      </div>

      {!["RESOLVED", "CANCELLED"].includes(signal.status) ? (
        <div className="mt-3 grid gap-2">
          {STATUS_ACTIONS.map((action) => (
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-black text-white transition disabled:bg-slate-700 disabled:text-slate-400 ${action.className}`}
              disabled={updating || signal.status === action.status}
              key={action.status}
              onClick={() => onUpdateStatus(action.status)}
              type="button"
            >
              {updating ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck aria-hidden className="h-4 w-4" />
              )}
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function SosDetailDrawer({
  onClose,
  onUpdateStatus,
  signal,
  updating
}: {
  onClose: () => void;
  onUpdateStatus: (status: SOSStatus) => void;
  signal: SOSSignalDTO;
  updating: boolean;
}) {
  const mapHref = `/map?sosId=${signal.id}` as Route;
  const routeHref = `/map?sosId=${signal.id}&route=1` as Route;
  const timeline = signal.timeline ?? [];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-sm lg:items-center lg:p-6">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/15 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              Chi tiết case SOS
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {signal.reporterName ?? "Người dùng SOS"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Mã SOS: {signal.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            aria-label="Đóng chi tiết SOS"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <DetailItem label="Loại sự cố" value={formatNeeds(signal)} />
          <DetailItem label="Trạng thái" value={SOS_STATUS_LABELS[signal.status]} />
          <DetailItem label="Số điện thoại" value={signal.reporterPhone ?? "Chưa có"} />
          <DetailItem
            label="Tọa độ"
            value={`${signal.coordinates.latitude.toFixed(5)}, ${signal.coordinates.longitude.toFixed(5)}`}
          />
          <DetailItem label="Địa chỉ mô tả" value={signal.addressText ?? "Chưa có"} />
          <DetailItem label="Thời gian gửi" value={formatTime(signal.createdAt)} />
          <DetailItem
            className="md:col-span-2"
            label="Mô tả"
            value={signal.note ?? "Chưa có mô tả thêm."}
          />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Link
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-800 px-3 text-sm font-black text-white transition hover:bg-slate-700"
            href={mapHref}
          >
            <MapPinned aria-hidden className="h-4 w-4" />
            Xem bản đồ
          </Link>
          <Link
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-3 text-sm font-black text-white"
            href={routeHref}
          >
            <RouteIcon aria-hidden className="h-4 w-4" />
            Chỉ đường
          </Link>
          {signal.reporterPhone ? (
            <a
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-sm font-black text-white transition hover:bg-emerald-500"
              href={`tel:${signal.reporterPhone}`}
            >
              <PhoneCall aria-hidden className="h-4 w-4" />
              Gọi nhanh
            </a>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            className="h-11 rounded-2xl bg-amber-600 px-3 text-sm font-black text-white transition hover:bg-amber-500 disabled:bg-slate-700"
            disabled={updating || signal.status === "PENDING"}
            onClick={() => onUpdateStatus("PENDING")}
            type="button"
          >
            Khôi phục về chờ xử lý
          </button>
          {STATUS_ACTIONS.map((action) => (
            <button
              className={`h-11 rounded-2xl px-3 text-sm font-black text-white transition disabled:bg-slate-700 ${action.className}`}
              disabled={updating || signal.status === action.status}
              key={action.status}
              onClick={() => onUpdateStatus(action.status)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/65 p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">
            Timeline xử lý
          </h3>
          <div className="mt-4 space-y-3">
            {timeline.map((item, index) => (
              <div className="flex gap-3" key={`${item.timestamp}-${index}`}>
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]" />
                <div>
                  <p className="text-sm font-black text-white">
                    {item.type.replaceAll("_", " ")}
                    {item.toStatus ? ` → ${SOS_STATUS_LABELS[item.toStatus]}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatTime(item.timestamp)}
                    {item.actorName ? ` · ${item.actorName}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {timeline.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">
                Chưa có timeline, dữ liệu cũ vẫn được giữ đầy đủ.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailItem({
  className = "",
  label,
  value
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-100">{value}</p>
    </div>
  );
}
