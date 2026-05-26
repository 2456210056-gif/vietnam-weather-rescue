import { SOS_NEED_LABELS, type SOSNeed } from "@/types/sos";

type SOSMessageInput = {
  addressText?: string;
  createdAt: string;
  latitude?: number;
  locationStatus?: "gps_current" | "gps_unavailable" | "last_known" | "manual_required";
  longitude?: number;
  needs: SOSNeed[];
  note?: string;
};

export function buildSOSMessage(input: SOSMessageInput) {
  const needs = input.needs.map((need) => SOS_NEED_LABELS[need]).join(", ") || "Khẩn cấp";
  const coordinates =
    typeof input.latitude === "number" && typeof input.longitude === "number"
      ? input.locationStatus === "last_known"
        ? `gần nhất đã lưu: ${input.latitude.toFixed(6)}, ${input.longitude.toFixed(6)}`
        : `${input.latitude.toFixed(6)}, ${input.longitude.toFixed(6)}`
      : "chưa xác định";

  return [
    "Tôi cần cứu hộ khẩn cấp.",
    `Loại sự cố: ${needs}`,
    `Mô tả: ${input.note?.trim() || "Chưa có mô tả"}`,
    `Vị trí mô tả: ${input.addressText?.trim() || "Chưa có mô tả vị trí"}`,
    `Tọa độ: ${coordinates}`,
    `Thời gian: ${new Date(input.createdAt).toLocaleString("vi-VN")}`
  ].join("\n");
}

export function buildSMSHref(message: string) {
  return `sms:?body=${encodeURIComponent(message)}`;
}
