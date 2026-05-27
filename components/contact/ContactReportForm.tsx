"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, LocateFixed, RefreshCw, Send } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import useSWR from "swr";
import { useGeolocation } from "@/hooks/useGeolocation";

const REPORT_TYPES = [
  { value: "FLOOD", label: "Mưa lớn / ngập" },
  { value: "LANDSLIDE", label: "Sạt lở" },
  { value: "STORM", label: "Gió mạnh / bão" },
  { value: "RESCUE_SHORTAGE", label: "Thiếu cứu hộ" },
  { value: "OTHER", label: "Khác" }
] as const;

type ReportPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  area: string;
  type: string;
  description: string;
  latitude?: number;
  longitude?: number;
};

type ReportDTO = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  area: string;
  type: string;
  description: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
};

type ReportsResponse = {
  reports: ReportDTO[];
};

type ReportSubmitResponse = {
  message?: string;
  report?: ReportDTO;
};

async function fetchReports(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as ReportsResponse & { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "Không thể tải lịch sử báo cáo.");
  }

  return data;
}

async function submitReport(payload: ReportPayload) {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as ReportSubmitResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Không thể gửi báo cáo.");
  }

  return data;
}

function formatReportTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function getReportStatusLabel(status: string) {
  if (status === "RESOLVED") return "Đã xử lý";
  if (status === "REVIEWING") return "Đang xem xét";
  return "Đã ghi nhận";
}

export function ContactReportForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState<(typeof REPORT_TYPES)[number]["value"]>("FLOOD");
  const [description, setDescription] = useState("");
  const [submittedReport, setSubmittedReport] = useState<ReportDTO | null>(null);
  const { status, position, message: geolocationMessage, requestLocation } = useGeolocation();
  const {
    data: reportsData,
    isLoading: isLoadingReports,
    mutate: mutateReports
  } = useSWR<ReportsResponse>("/api/reports", fetchReports, {
    revalidateOnFocus: true
  });

  const mutation = useMutation({
    mutationFn: submitReport,
    onSuccess(data) {
      setSubmittedReport(data.report ?? null);
      setFullName("");
      setEmail("");
      setPhone("");
      setArea("");
      setType("FLOOD");
      setDescription("");
      void mutateReports();
    }
  });

  const locationLabel = useMemo(() => {
    if (status === "loading") {
      return "Đang lấy vị trí...";
    }

    if (status === "success" && position) {
      return `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
    }

    if (status === "permission_denied") {
      return "Trình duyệt chưa cấp quyền vị trí";
    }

    return "Đính kèm vị trí hiện tại";
  }, [position, status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({
      fullName: fullName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      area,
      type,
      description,
      latitude: position?.latitude,
      longitude: position?.longitude
    });
  }

  return (
    <div className="mt-6 grid gap-5">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Họ tên" onChange={setFullName} placeholder="Nguyễn Văn A" value={fullName} />
          <TextInput label="Số điện thoại" onChange={setPhone} placeholder="090..." type="tel" value={phone} />
        </div>
        <TextInput label="Email" onChange={setEmail} placeholder="email@example.com" type="email" value={email} />
        <TextInput
          label="Khu vực"
          onChange={setArea}
          placeholder="Ví dụ: Đà Nẵng, Cần Thơ..."
          required
          value={area}
        />

        <label className="block">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Loại báo cáo</span>
          <select
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            onChange={(event) => setType(event.target.value as typeof type)}
            value={type}
          >
            {REPORT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Nội dung</span>
          <textarea
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            minLength={10}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Mô tả ngắn tình hình thực tế..."
            required
            value={description}
          />
        </label>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/55 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Tọa độ GIS</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{locationLabel}</p>
            {status === "permission_denied" || status === "error" || status === "unsupported" ? (
              <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-300">{geolocationMessage}</p>
            ) : null}
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={status === "loading"}
            onClick={() => void requestLocation()}
            type="button"
          >
            <LocateFixed aria-hidden className="h-4 w-4" />
            Lấy vị trí
          </button>
        </div>

        {mutation.error ? (
          <p className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle aria-hidden className="h-4 w-4" />
            {mutation.error.message}
          </p>
        ) : null}

        {mutation.isSuccess ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-black">Đã gửi báo cáo</p>
                <p className="mt-1 text-sm font-semibold leading-6">
                  Báo cáo đã được lưu vào hệ thống.
                  {submittedReport ? ` Mã báo cáo: ${submittedReport.id.slice(-6).toUpperCase()}.` : ""}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {submittedReport ? (
                <a
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white"
                  href={`#report-${submittedReport.id}`}
                >
                  Xem báo cáo
                </a>
              ) : null}
              <button
                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black text-emerald-800 dark:border-emerald-400/20 dark:bg-slate-950/70 dark:text-emerald-100"
                onClick={() => mutation.reset()}
                type="button"
              >
                Gửi báo cáo khác
              </button>
            </div>
          </section>
        ) : null}

        <motion.button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white shadow-lg shadow-blue-950/15 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          disabled={mutation.isPending}
          type="submit"
          whileTap={{ scale: 0.98 }}
        >
          <Send aria-hidden className="h-4 w-4" />
          {mutation.isPending ? "Đang gửi..." : "Gửi báo cáo"}
        </motion.button>
      </form>

      <section className="rounded-[28px] border border-slate-200 bg-white/95 p-4 text-slate-950 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-slate-950/25">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Báo cáo đã gửi</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Lịch sử báo cáo gần đây được lưu trong hệ thống.
            </p>
          </div>
          <button
            aria-label="Làm mới lịch sử báo cáo"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={() => void mutateReports()}
            type="button"
          >
            <RefreshCw aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {isLoadingReports ? <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-950/70" /> : null}

          {(reportsData?.reports ?? []).map((report) => (
            <article
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/55"
              id={`report-${report.id}`}
              key={report.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
                    <FileText aria-hidden className="h-4 w-4 text-blue-600" />
                    {report.type} · {report.area}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {report.description}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    Mã: {report.id.slice(-6).toUpperCase()} · {formatReportTime(report.createdAt)}
                  </p>
                  {typeof report.latitude === "number" && typeof report.longitude === "number" ? (
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      GIS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                    </p>
                  ) : null}
                </div>
                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                  {getReportStatusLabel(report.status)}
                </span>
              </div>
            </article>
          ))}

          {!isLoadingReports && (reportsData?.reports ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:text-slate-400">
              Chưa có báo cáo nào được gửi.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function TextInput({
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
