"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, LocateFixed, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
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

async function submitReport(payload: ReportPayload) {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "Không thể gửi báo cáo.");
  }

  return data;
}

export function ContactReportForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState<(typeof REPORT_TYPES)[number]["value"]>("FLOOD");
  const [description, setDescription] = useState("");
  const { status, position, message: geolocationMessage, requestLocation } = useGeolocation();

  const mutation = useMutation({
    mutationFn: submitReport,
    onSuccess() {
      setFullName("");
      setEmail("");
      setPhone("");
      setArea("");
      setType("FLOOD");
      setDescription("");
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
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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
        <span className="text-sm font-bold text-slate-800">Loại báo cáo</span>
        <select
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
        <span className="text-sm font-bold text-slate-800">Nội dung</span>
        <textarea
          className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          minLength={10}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mô tả ngắn tình hình thực tế..."
          required
          value={description}
        />
      </label>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">Tọa độ GIS</p>
          <p className="text-sm font-semibold text-slate-600">{locationLabel}</p>
          {status === "permission_denied" || status === "error" || status === "unsupported" ? (
            <p className="mt-1 text-xs font-semibold text-red-700">{geolocationMessage}</p>
          ) : null}
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700"
          disabled={status === "loading"}
          onClick={requestLocation}
          type="button"
        >
          <LocateFixed aria-hidden className="h-4 w-4" />
          Lấy vị trí
        </button>
      </div>

      {mutation.error ? (
        <p className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle aria-hidden className="h-4 w-4" />
          {mutation.error.message}
        </p>
      ) : null}

      {mutation.isSuccess ? (
        <p className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          Đã gửi báo cáo. Báo cáo được lưu vào MongoDB.
        </p>
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
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
