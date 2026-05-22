"use client";

import { Loader2, MapPinned, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO, type SOSStatus } from "@/types/sos";

type RescueResponse = {
  signals: SOSSignalDTO[];
};

const STATUS_ACTIONS: { status: SOSStatus; label: string }[] = [
  { status: "ACKNOWLEDGED", label: "Đã tiếp nhận" },
  { status: "APPROACHING", label: "Đang tiếp cận" },
  { status: "RESOLVED", label: "Đã xử lý" }
];

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu.");
  }

  return payload;
}

export function RescuerDashboard() {
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const { data, error, isLoading, mutate } = useSWR<RescueResponse>(
    "/api/rescuer/sos",
    fetcher<RescueResponse>,
    {
      refreshInterval: 15_000
    }
  );

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
    <div className="space-y-5">
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">
          Rescuer dashboard
        </p>
        <h2 className="mt-2 text-3xl font-black">Điều phối tín hiệu SOS</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Danh sách tự làm mới mỗi 15 giây. Khi Pusher khả dụng, bản đồ sẽ nhận marker gần như
          tức thời.
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
          href="/map"
        >
          <MapPinned aria-hidden className="h-4 w-4" />
          Mở bản đồ cứu hộ
        </Link>
      </section>

      {message ? (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-44 animate-pulse rounded-3xl bg-slate-100" key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.signals.map((signal) => (
            <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" key={signal.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {signal.reporterName ?? "Người dùng SOS"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {signal.coordinates.latitude.toFixed(5)}, {signal.coordinates.longitude.toFixed(5)}
                  </p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                  {SOS_STATUS_LABELS[signal.status]}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                {signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ")}
              </p>
              {signal.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{signal.note}</p> : null}
              <div className="mt-3 grid gap-2">
                {STATUS_ACTIONS.map((action) => (
                  <button
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300"
                    disabled={updatingId === signal.id || signal.status === action.status}
                    key={action.status}
                    onClick={() => void updateStatus(signal, action.status)}
                    type="button"
                  >
                    {updatingId === signal.id ? (
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck aria-hidden className="h-4 w-4" />
                    )}
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {data?.signals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-bold text-slate-500 sm:col-span-2">
              Chưa có SOS đang chờ xử lý.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
