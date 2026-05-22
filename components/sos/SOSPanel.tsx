"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  PhoneCall,
  RadioTower,
  ShieldAlert,
  X
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useGeolocation, type GeolocationSnapshot } from "@/hooks/useGeolocation";
import { useSOSRealtime } from "@/hooks/useSOSRealtime";
import { useSOSStore } from "@/stores/sosStore";
import {
  SOS_NEED_LABELS,
  SOS_STATUS_LABELS,
  type SOSNeed,
  type SOSSignalDTO
} from "@/types/sos";

type SOSListResponse = {
  signals: SOSSignalDTO[];
};

const QUICK_NEEDS: SOSNeed[] = [
  "TRAPPED",
  "INJURY",
  "FOOD",
  "FLOOD",
  "FIRE",
  "LANDSLIDE",
  "OTHER"
];

const EMERGENCY_NUMBERS = [
  { number: "112", label: "Cứu nạn, thiên tai, thảm họa" },
  { number: "113", label: "Công an" },
  { number: "114", label: "PCCC / cứu nạn cứu hộ" },
  { number: "115", label: "Cấp cứu y tế" }
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function getStatusTone(status: SOSSignalDTO["status"]) {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700";
  if (status === "APPROACHING" || status === "REACHED") return "bg-sky-50 text-sky-700";
  if (status === "ACKNOWLEDGED") return "bg-amber-50 text-amber-700";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  return "bg-red-50 text-red-700";
}

export function SOSPanel() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const geolocation = useGeolocation();
  const realtime = useSOSRealtime(isAuthenticated);
  const signals = useSOSStore((state) => state.signals);
  const setSignals = useSOSStore((state) => state.setSignals);
  const upsertSignal = useSOSStore((state) => state.upsertSignal);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<SOSNeed[]>(["FLOOD"]);
  const [note, setNote] = useState("");
  const [addressText, setAddressText] = useState("");
  const [position, setPosition] = useState<GeolocationSnapshot | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const { data, mutate } = useSWR<SOSListResponse>(isAuthenticated ? "/api/sos" : null, {
    revalidateOnFocus: true,
    refreshInterval: realtime.isUnavailable ? 15_000 : 0
  });

  useEffect(() => {
    if (data?.signals) {
      setSignals(data.signals);
    }
  }, [data, setSignals]);

  const canSubmit = useMemo(
    () => isAuthenticated && selectedNeeds.length > 0 && submitState !== "sending",
    [isAuthenticated, selectedNeeds.length, submitState]
  );

  function toggleNeed(need: SOSNeed) {
    setSelectedNeeds((current) => {
      if (current.includes(need)) {
        const nextNeeds = current.filter((item) => item !== need);
        return nextNeeds.length ? nextNeeds : current;
      }

      return [...current, need];
    });
  }

  async function getPosition() {
    const nextPosition = await geolocation.requestLocation();

    if (nextPosition) {
      setPosition(nextPosition);
    }

    return nextPosition;
  }

  async function submitSOS() {
    if (!isAuthenticated) {
      await signIn(undefined, { callbackUrl: "/sos" });
      return;
    }

    setSubmitState("sending");
    setMessage("");

    const currentPosition = position ?? (await getPosition());

    if (!currentPosition) {
      setSubmitState("error");
      setMessage("Chưa thể gửi SOS vì hệ thống chưa lấy được vị trí GPS.");
      return;
    }

    const response = await fetch("/api/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        accuracy: currentPosition.accuracy,
        needs: selectedNeeds,
        note,
        addressText
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      signal?: SOSSignalDTO;
      message?: string;
    };

    if (!response.ok || !payload.signal) {
      setSubmitState("error");
      setMessage(payload.message ?? "Không thể gửi tín hiệu SOS.");
      return;
    }

    upsertSignal(payload.signal);
    await mutate();
    setSubmitState("success");
    setMessage(payload.message ?? "SOS đã được gửi.");
  }

  function openModal() {
    setSubmitState("idle");
    setMessage("");
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-soft">
        <div className="bg-red-600 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">
                SOS khẩn cấp
              </p>
              <h2 className="mt-1 text-2xl font-black">Phát tín hiệu cứu hộ</h2>
            </div>
            <ShieldAlert aria-hidden className="h-9 w-9 shrink-0" />
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Đây là hệ thống hỗ trợ báo sự cố trong phạm vi ứng dụng/đồ án. Khi nguy hiểm
            thật, hãy gọi ngay số khẩn cấp phù hợp.
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EMERGENCY_NUMBERS.map((item) => (
              <a
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-black text-red-700"
                href={`tel:${item.number}`}
                key={item.number}
              >
                <PhoneCall aria-hidden className="h-4 w-4" />
                {item.number}
              </a>
            ))}
          </div>

          <div className="flex justify-center py-3">
            <motion.button
              animate={{ scale: [1, 1.05, 1], opacity: [1, 0.96, 1] }}
              className="gpu-transition flex h-44 w-44 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_0_12px_rgba(220,38,38,0.10),0_24px_60px_rgba(220,38,38,0.38)] outline-none ring-4 ring-red-100 transition active:scale-95"
              onClick={openModal}
              transition={{
                duration: 1.15,
                ease: "easeInOut",
                repeat: Infinity
              }}
              type="button"
            >
              <AlertTriangle aria-hidden className="mb-2 h-10 w-10" />
              <span className="text-4xl font-black tracking-wide">SOS</span>
              <span className="mt-1 text-sm font-bold">Cứu hộ</span>
            </motion.button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoBox
              icon={<MapPin aria-hidden className="h-4 w-4 text-red-600" />}
              label="Vị trí"
              value={position ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}` : geolocation.message}
            />
            <InfoBox
              icon={<RadioTower aria-hidden className="h-4 w-4 text-red-600" />}
              label="Realtime"
              value={
                realtime.isConnected
                  ? "Đã kết nối Pusher."
                  : realtime.isUnavailable
                    ? "Chưa cấu hình Pusher, dùng polling 15 giây."
                    : "Đang sẵn sàng."
              }
            />
            <InfoBox
              icon={<CheckCircle2 aria-hidden className="h-4 w-4 text-red-600" />}
              label="Tài khoản"
              value={
                session?.user
                  ? `${session.user.name ?? session.user.email} (${session.user.role})`
                  : "Cần đăng nhập để gửi SOS vào hệ thống."
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-950">Tín hiệu gần đây</h3>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            {signals.length}
          </span>
        </div>

        <div className="grid gap-3">
          {signals.slice(0, 6).map((signal) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              key={signal.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {signal.reporterName ?? "Người dùng SOS"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatTime(signal.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusTone(signal.status)}`}>
                  {SOS_STATUS_LABELS[signal.status]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ")}
              </p>
              {signal.note ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{signal.note}</p>
              ) : null}
              <p className="mt-2 text-xs font-semibold text-slate-500">
                {signal.coordinates.latitude.toFixed(5)},{" "}
                {signal.coordinates.longitude.toFixed(5)}
              </p>
            </article>
          ))}

          {signals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-500">
              Chưa có tín hiệu SOS đang hoạt động.
            </div>
          ) : null}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-6"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl will-change-transform sm:p-5"
              exit={{ opacity: 0, y: 18 }}
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                    Xác nhận SOS
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    Bạn đang cần hỗ trợ gì?
                  </h3>
                </div>
                <button
                  aria-label="Đóng modal SOS"
                  className="rounded-full bg-slate-100 p-2 text-slate-700"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  <X aria-hidden className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {QUICK_NEEDS.map((need) => {
                  const active = selectedNeeds.includes(need);

                  return (
                    <button
                      className={`gpu-transition rounded-xl border px-3 py-3 text-left text-sm font-bold transition active:scale-[0.98] ${
                        active
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                      key={need}
                      onClick={() => toggleNeed(need)}
                      type="button"
                    >
                      {SOS_NEED_LABELS[need]}
                    </button>
                  );
                })}
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-slate-800">Mô tả thêm</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-100"
                  maxLength={500}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ví dụ: đang ở tầng 2, có trẻ em, nước lên nhanh..."
                  value={note}
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-slate-800">Địa chỉ mô tả</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-100"
                  maxLength={300}
                  onChange={(event) => setAddressText(event.target.value)}
                  placeholder="Tên đường, thôn/xã, mốc nhận diện..."
                  value={addressText}
                />
              </label>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">Vị trí GPS</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {position
                        ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)} - sai số ${Math.round(position.accuracy)}m`
                        : geolocation.message}
                    </p>
                  </div>
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={geolocation.isLoading}
                    onClick={() => void getPosition()}
                    type="button"
                  >
                    {geolocation.isLoading ? (
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin aria-hidden className="h-4 w-4" />
                    )}
                    Lấy vị trí
                  </button>
                </div>
              </div>

              {message ? (
                <p
                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                    submitState === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {!isAuthenticated && status !== "loading" ? (
                  <button
                    className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white sm:col-span-2"
                    onClick={() => signIn(undefined, { callbackUrl: "/sos" })}
                    type="button"
                  >
                    Đăng nhập để gửi SOS
                  </button>
                ) : (
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400 sm:col-span-2"
                    disabled={!canSubmit}
                    onClick={() => void submitSOS()}
                    type="button"
                  >
                    {submitState === "sending" ? (
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle aria-hidden className="h-4 w-4" />
                    )}
                    Gửi tín hiệu SOS
                  </button>
                )}
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{value}</p>
    </div>
  );
}
