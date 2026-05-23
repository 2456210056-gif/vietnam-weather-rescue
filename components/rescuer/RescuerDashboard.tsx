"use client";

import { Loader2, MapPinned, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO, type SOSStatus } from "@/types/sos";

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

function statusTone(status: SOSStatus) {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700";
  if (status === "APPROACHING" || status === "REACHED") return "bg-violet-50 text-violet-700";
  if (status === "ACKNOWLEDGED") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
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
    <div className="space-y-6">
      <section className="rounded-[32px] bg-slate-950 p-6 text-white shadow-2xl lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
          Rescuer dashboard
        </p>
        <h2 className="mt-2 text-3xl font-black lg:text-4xl">Điều phối tín hiệu SOS</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Danh sách làm mới mỗi 15 giây. Vào bản đồ để xem marker, chỉ đường và cập nhật trạng thái.
        </p>
        <Link
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white"
          href="/map"
        >
          <MapPinned aria-hidden className="h-4 w-4" />
          Mở bản đồ cứu hộ
        </Link>
      </section>

      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-44 animate-pulse rounded-[28px] bg-white/80" key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.signals.map((signal) => (
            <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]" key={signal.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {signal.reporterName ?? "Người dùng SOS"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {signal.coordinates.latitude.toFixed(5)}, {signal.coordinates.longitude.toFixed(5)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone(signal.status)}`}>
                  {SOS_STATUS_LABELS[signal.status]}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                {signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ")}
              </p>
              {signal.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{signal.note}</p> : null}
              <div className="mt-4 grid gap-2">
                {STATUS_ACTIONS.map((action) => (
                  <button
                    className={`flex h-10 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-black text-white disabled:bg-slate-300 ${action.className}`}
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
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center sm:col-span-2">
              <p className="text-base font-black text-slate-950">Chưa có SOS đang chờ xử lý.</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Khi có tín hiệu mới, danh sách sẽ tự cập nhật.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
