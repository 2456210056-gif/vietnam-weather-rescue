export const SOS_NEEDS = [
  "TRAPPED",
  "INJURY",
  "FOOD",
  "FLOOD",
  "FIRE",
  "LANDSLIDE",
  "MEDICAL",
  "OTHER"
] as const;

export const SOS_STATUSES = [
  "PENDING",
  "ACKNOWLEDGED",
  "APPROACHING",
  "REACHED",
  "RESOLVED",
  "CANCELLED"
] as const;

export type SOSNeed = (typeof SOS_NEEDS)[number];
export type SOSStatus = (typeof SOS_STATUSES)[number];

export const SOS_NEED_LABELS: Record<SOSNeed, string> = {
  TRAPPED: "Bị mắc kẹt",
  INJURY: "Bị thương",
  FOOD: "Thiếu thức ăn / nước uống",
  FLOOD: "Ngập lụt",
  FIRE: "Cháy nổ",
  LANDSLIDE: "Sạt lở",
  MEDICAL: "Cần hỗ trợ y tế",
  OTHER: "Khác"
};

export const SOS_STATUS_LABELS: Record<SOSStatus, string> = {
  PENDING: "Đang chờ cứu hộ",
  ACKNOWLEDGED: "Đã tiếp nhận",
  APPROACHING: "Đang tiếp cận",
  REACHED: "Đã tiếp cận",
  RESOLVED: "Đã xử lý",
  CANCELLED: "Đã hủy"
};

export type SOSSignalDTO = {
  id: string;
  userId: string;
  reporterName?: string | null;
  reporterPhone?: string | null;
  needs: SOSNeed[];
  note?: string | null;
  addressText?: string | null;
  status: SOSStatus;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
  assignedRescuerId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastStatusAt: string;
};

export type SOSRealtimePayload = {
  signal: SOSSignalDTO;
  emittedAt: string;
};
