import {
  SOS_NEEDS,
  SOS_STATUSES,
  type SOSNeed,
  type SOSStatus
} from "@/types/sos";

type SOSCreateInput = {
  latitude: number | null;
  longitude: number | null;
  accuracy?: number;
  locationStatus?: "gps_current" | "gps_unavailable" | "last_known" | "manual_required";
  needs: SOSNeed[];
  note?: string;
  addressText?: string;
};

type MutableSOSStatus = Extract<
  SOSStatus,
  "PENDING" | "ACKNOWLEDGED" | "APPROACHING" | "REACHED" | "RESOLVED" | "CANCELLED"
>;

type SOSStatusInput = {
  status: MutableSOSStatus;
};

type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
      status: number;
    };

const STATUS_ALIASES: Record<string, MutableSOSStatus> = {
  accepted: "ACKNOWLEDGED",
  acknowledged: "ACKNOWLEDGED",
  pending: "PENDING",
  restored_to_pending: "PENDING",
  approaching: "APPROACHING",
  in_progress: "APPROACHING",
  reached: "REACHED",
  resolved: "RESOLVED",
  cancelled: "CANCELLED",
  PENDING: "PENDING",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  APPROACHING: "APPROACHING",
  REACHED: "REACHED",
  RESOLVED: "RESOLVED",
  CANCELLED: "CANCELLED"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSOSNeed(value: unknown): value is SOSNeed {
  return typeof value === "string" && SOS_NEEDS.includes(value as SOSNeed);
}

function normalizeSOSStatus(value: unknown): MutableSOSStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  return STATUS_ALIASES[value.trim()] ?? null;
}

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : undefined;
}

export function parseSOSCreateInput(body: unknown): ValidationResult<SOSCreateInput> {
  if (!isRecord(body)) {
    return { ok: false, message: "Body JSON không hợp lệ.", status: 400 };
  }

  const latitudeInput = body.latitude ?? body.lat ?? (isRecord(body.coordinates) ? body.coordinates.latitude ?? body.coordinates.lat : undefined);
  const longitudeInput = body.longitude ?? body.lng ?? (isRecord(body.coordinates) ? body.coordinates.longitude ?? body.coordinates.lng : undefined);
  const latitude =
    latitudeInput === undefined || latitudeInput === null || latitudeInput === ""
      ? null
      : Number(latitudeInput);
  const longitude =
    longitudeInput === undefined || longitudeInput === null || longitudeInput === ""
      ? null
      : Number(longitudeInput);
  const accuracy =
    body.accuracy === undefined || body.accuracy === null
      ? undefined
      : Number(body.accuracy);

  if (
    (latitude !== null && !isValidLatitude(latitude)) ||
    (longitude !== null && !isValidLongitude(longitude)) ||
    (latitude === null) !== (longitude === null)
  ) {
    return { ok: false, message: "Tọa độ không hợp lệ.", status: 400 };
  }

  if (accuracy !== undefined && (!Number.isFinite(accuracy) || accuracy < 0)) {
    return { ok: false, message: "Độ chính xác GPS không hợp lệ.", status: 400 };
  }

  const rawNeeds = Array.isArray(body.needs)
    ? body.needs
    : [body.emergencyType, body.type].filter(Boolean);
  const needs = rawNeeds.filter(isSOSNeed);

  if (!needs.length) {
    return {
      ok: false,
      message: "Vui lòng chọn ít nhất một tình huống cần cứu hộ.",
      status: 400
    };
  }

  const addressText = cleanText(body.addressText ?? body.locationText ?? body.address, 300);
  const note = cleanText(body.note ?? body.description, 500);
  const locationStatus = cleanText(body.locationStatus, 40) as SOSCreateInput["locationStatus"] | undefined;

  if ((latitude === null || longitude === null) && !addressText && !note) {
    return {
      ok: false,
      message: "SOS thiếu GPS cần có mô tả vị trí hoặc nội dung bổ sung.",
      status: 400
    };
  }

  return {
    ok: true,
    data: {
      latitude,
      longitude,
      accuracy,
      locationStatus,
      needs: [...new Set(needs)],
      note,
      addressText
    }
  };
}

export function parseSOSStatusInput(body: unknown): ValidationResult<SOSStatusInput> {
  if (!isRecord(body)) {
    return { ok: false, message: "Body JSON không hợp lệ.", status: 400 };
  }

  const status = normalizeSOSStatus(body.status);

  if (!status || !SOS_STATUSES.includes(status)) {
    return { ok: false, message: "Trạng thái SOS không hợp lệ.", status: 400 };
  }

  return {
    ok: true,
    data: {
      status
    }
  };
}
