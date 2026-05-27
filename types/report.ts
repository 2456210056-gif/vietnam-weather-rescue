export type WeatherReportDTO = {
  id: string;
  userId?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  area: string;
  type: string;
  description: string;
  contact?: string | null;
  severity: "low" | "medium" | "high" | "critical";
  status: "NEW" | "REVIEWING" | "VERIFIED" | "ASSIGNED" | "RESOLVED" | "REJECTED";
  latitude?: number | null;
  longitude?: number | null;
  handledBy?: string | null;
  handledAt?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  FLOOD: "Mưa lớn / ngập",
  LANDSLIDE: "Sạt lở",
  OTHER: "Khác",
  RESCUE_SHORTAGE: "Thiếu cứu hộ",
  STORM: "Gió mạnh / bão"
};

export const REPORT_STATUS_LABELS: Record<WeatherReportDTO["status"], string> = {
  ASSIGNED: "Đã phân công",
  NEW: "Chờ xử lý",
  REJECTED: "Từ chối",
  RESOLVED: "Đã xử lý",
  REVIEWING: "Đang kiểm tra",
  VERIFIED: "Đã xác minh"
};

export const REPORT_SEVERITY_LABELS: Record<WeatherReportDTO["severity"], string> = {
  critical: "Khẩn cấp",
  high: "Cao",
  low: "Thấp",
  medium: "Trung bình"
};
