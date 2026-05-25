import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import {
  WeatherReport,
  WEATHER_REPORT_TYPES,
  type WeatherReportType
} from "@/models/WeatherReport";

export const runtime = "nodejs";

type ReportInput = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  area?: unknown;
  type?: unknown;
  description?: unknown;
  contact?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

function serializeReport(report: {
  _id: { toString(): string };
  fullName?: string;
  email?: string;
  area: string;
  type: WeatherReportType;
  description: string;
  status: string;
  location?: { coordinates?: number[] };
  createdAt: Date;
  updatedAt: Date;
}) {
  const coordinates = report.location?.coordinates;

  return {
    id: report._id.toString(),
    fullName: report.fullName ?? null,
    email: report.email ?? null,
    area: report.area,
    type: report.type,
    description: report.description,
    status: report.status,
    latitude: Array.isArray(coordinates) ? coordinates[1] : null,
    longitude: Array.isArray(coordinates) ? coordinates[0] : null,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ reports: [] });
  }

  await connectMongo();

  const reports = await WeatherReport.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean()
    .exec();

  return NextResponse.json({
    reports: reports.map(serializeReport)
  });
}

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseOptionalCoordinate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  let body: ReportInput;

  try {
    body = (await request.json()) as ReportInput;
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const fullName = cleanText(body.fullName, 120);
  const email = cleanText(body.email, 160);
  const phone = cleanText(body.phone, 30);
  const area = cleanText(body.area, 160);
  const description = cleanText(body.description, 1200);
  const contact = cleanText(body.contact, 160);
  const type = cleanText(body.type, 40) as WeatherReportType;
  const latitude = parseOptionalCoordinate(body.latitude);
  const longitude = parseOptionalCoordinate(body.longitude);

  if (fullName && fullName.length < 2) {
    return NextResponse.json({ message: "Họ tên không hợp lệ." }, { status: 400 });
  }

  if (email && !email.includes("@")) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  if (area.length < 2) {
    return NextResponse.json({ message: "Vui lòng nhập khu vực báo cáo." }, { status: 400 });
  }

  if (!WEATHER_REPORT_TYPES.includes(type)) {
    return NextResponse.json({ message: "Loại báo cáo không hợp lệ." }, { status: 400 });
  }

  if (description.length < 10) {
    return NextResponse.json(
      { message: "Nội dung báo cáo cần ít nhất 10 ký tự." },
      { status: 400 }
    );
  }

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ message: "Tọa độ không hợp lệ." }, { status: 400 });
  }

  const hasLocation = latitude !== null && longitude !== null;

  if (
    hasLocation &&
    (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
  ) {
    return NextResponse.json({ message: "Tọa độ nằm ngoài phạm vi hợp lệ." }, { status: 400 });
  }

  await connectMongo();

  const report = await WeatherReport.create({
    user: session?.user?.id,
    fullName: fullName || session?.user?.name || undefined,
    email: email || session?.user?.email || undefined,
    phone: phone || undefined,
    area,
    type,
    description,
    contact: contact || phone || email || undefined,
    location: hasLocation
      ? {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      : undefined,
    status: "NEW"
  });

  return NextResponse.json(
    {
      message: "Báo cáo đã được gửi cho hệ thống điều phối.",
      report: serializeReport(report)
    },
    { status: 201 }
  );
}
