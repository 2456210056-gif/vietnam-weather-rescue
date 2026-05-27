import type {
  WeatherReportSeverity,
  WeatherReportStatus,
  WeatherReportType
} from "@/models/WeatherReport";

type ObjectIdLike = { toString(): string } | string;

type WeatherReportLike = {
  _id: ObjectIdLike;
  user?: ObjectIdLike | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  area: string;
  type: WeatherReportType;
  description: string;
  contact?: string | null;
  severity?: WeatherReportSeverity | null;
  status: WeatherReportStatus;
  location?: { coordinates?: number[] } | null;
  handledBy?: ObjectIdLike | null;
  handledAt?: Date | string | null;
  note?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function toId(value: unknown) {
  if (!value) return null;
  if (typeof value === "object" && "_id" in value) return String(value._id);
  return String(value);
}

function toISO(value?: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function serializeWeatherReport(report: WeatherReportLike) {
  const coordinates = report.location?.coordinates;

  return {
    id: String(report._id),
    userId: toId(report.user),
    fullName: report.fullName ?? null,
    email: report.email ?? null,
    phone: report.phone ?? null,
    area: report.area,
    type: report.type,
    description: report.description,
    contact: report.contact ?? null,
    severity: report.severity ?? "medium",
    status: report.status,
    latitude: Array.isArray(coordinates) ? coordinates[1] : null,
    longitude: Array.isArray(coordinates) ? coordinates[0] : null,
    handledBy: toId(report.handledBy),
    handledAt: toISO(report.handledAt),
    note: report.note ?? null,
    createdAt: toISO(report.createdAt) ?? new Date().toISOString(),
    updatedAt: toISO(report.updatedAt) ?? new Date().toISOString()
  };
}
