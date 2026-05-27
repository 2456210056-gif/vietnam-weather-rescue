import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeWeatherReport } from "@/lib/reports/serialize";
import {
  WeatherReport,
  WEATHER_REPORT_SEVERITIES,
  WEATHER_REPORT_TYPES,
  type WeatherReportSeverity,
  type WeatherReportType
} from "@/models/WeatherReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReportInput = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  area?: unknown;
  type?: unknown;
  description?: unknown;
  contact?: unknown;
  severity?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 80) : 12;
}

function parseOptionalCoordinate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ reports: [] });
  }

  try {
    await connectMongo();

    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "true";
    const scope = url.searchParams.get("scope");
    const status = url.searchParams.get("status");
    const limit = normalizeLimit(url.searchParams.get("limit"));
    const query: Record<string, unknown> = {};

    if (session.user.role === "admin" && !mine) {
      // Admin can see all reports.
    } else if ((session.user.role === "rescuer" || session.user.role === "admin") && scope === "field" && !mine) {
      query.$or = [
        { severity: { $in: ["medium", "high", "critical"] } },
        { type: { $in: ["FLOOD", "LANDSLIDE", "RESCUE_SHORTAGE", "STORM"] } },
        { status: { $in: ["NEW", "REVIEWING", "VERIFIED", "ASSIGNED"] } }
      ];
    } else {
      query.user = session.user.id;
    }

    if (status) {
      query.status = status;
    }

    const reports = await WeatherReport.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return NextResponse.json({
      reports: reports.map(serializeWeatherReport)
    });
  } catch (error) {
    console.error("Không thể tải lịch sử báo cáo.", error);
    return NextResponse.json(
      { message: "Không thể tải lịch sử báo cáo.", reports: [] },
      { status: 500 }
    );
  }
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
  const severity = cleanText(body.severity, 20) as WeatherReportSeverity;
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

  if (severity && !WEATHER_REPORT_SEVERITIES.includes(severity)) {
    return NextResponse.json({ message: "Mức độ báo cáo không hợp lệ." }, { status: 400 });
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
    severity: severity || "medium",
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
      report: serializeWeatherReport(report)
    },
    { status: 201 }
  );
}
