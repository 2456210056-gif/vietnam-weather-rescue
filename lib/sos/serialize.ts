import type { Types } from "mongoose";
import type { SOSNeed, SOSSignalDTO, SOSStatus, SOSTimelineEvent } from "@/types/sos";

type ObjectIdLike = Types.ObjectId | string;

type UserLike =
  | ObjectIdLike
  | {
      _id?: ObjectIdLike;
      fullName?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    };

type SOSSignalLike = {
  _id: ObjectIdLike;
  user: UserLike;
  fullName?: string | null;
  phone?: string | null;
  needs: SOSNeed[];
  note?: string | null;
  description?: string | null;
  addressText?: string | null;
  status: SOSStatus;
  assignedRescuer?: ObjectIdLike | null;
  acceptedAt?: Date | string | null;
  resolvedAt?: Date | string | null;
  timeline?: Array<
    Omit<SOSTimelineEvent, "timestamp"> & {
      timestamp: Date | string;
    }
  >;
  location?: {
    coordinates: [number, number];
  } | null;
  accuracy?: number | null;
  locationStatus?: "gps_current" | "gps_unavailable" | "last_known" | "manual_required" | null;
  lastStatusAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function toISODate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "_id" in value && value._id !== value) {
    return toId(value._id);
  }

  return String(value);
}

function getReporterName(signal: SOSSignalLike): string | null {
  if (signal.fullName) {
    return signal.fullName;
  }

  const user = signal.user;

  if (!user || typeof user !== "object" || !("name" in user)) {
    return null;
  }

  return user.fullName ?? user.name ?? user.email ?? null;
}

function getReporterPhone(signal: SOSSignalLike): string | null {
  if (signal.phone) {
    return signal.phone;
  }

  const user = signal.user;

  if (!user || typeof user !== "object" || !("phone" in user)) {
    return null;
  }

  return user.phone ?? null;
}

function serializeTimeline(signal: SOSSignalLike): SOSTimelineEvent[] {
  const existingTimeline = signal.timeline ?? [];

  if (existingTimeline.length) {
    return existingTimeline.map((item) => ({
      type: item.type,
      timestamp: toISODate(item.timestamp),
      actorId: item.actorId ?? null,
      actorName: item.actorName ?? null,
      fromStatus: item.fromStatus ?? null,
      toStatus: item.toStatus ?? null,
      note: item.note ?? null
    }));
  }

  return [
    {
      type: "created",
      timestamp: toISODate(signal.createdAt),
      actorId: toId(signal.user),
      actorName: getReporterName(signal),
      fromStatus: null,
      toStatus: "PENDING",
      note: null
    }
  ];
}

export function serializeSOSSignal(signal: SOSSignalLike): SOSSignalDTO {
  const coordinates = signal.location?.coordinates;
  const [longitude, latitude] = Array.isArray(coordinates) ? coordinates : [null, null];

  return {
    id: toId(signal._id),
    userId: toId(signal.user),
    reporterName: getReporterName(signal),
    reporterPhone: getReporterPhone(signal),
    needs: signal.needs,
    note: signal.note ?? signal.description ?? null,
    addressText: signal.addressText ?? null,
    status: signal.status,
    coordinates:
      typeof latitude === "number" && typeof longitude === "number"
        ? {
            latitude,
            longitude,
            accuracy: signal.accuracy ?? null
          }
        : null,
    locationStatus: signal.locationStatus ?? (typeof latitude === "number" && typeof longitude === "number" ? "gps_current" : "gps_unavailable"),
    assignedRescuerId: signal.assignedRescuer ? toId(signal.assignedRescuer) : null,
    assignedRescuerName: null,
    acceptedAt: signal.acceptedAt ? toISODate(signal.acceptedAt) : null,
    resolvedAt: signal.resolvedAt ? toISODate(signal.resolvedAt) : null,
    timeline: serializeTimeline(signal),
    createdAt: toISODate(signal.createdAt),
    updatedAt: toISODate(signal.updatedAt),
    lastStatusAt: toISODate(signal.lastStatusAt)
  };
}
