import { NextResponse } from "next/server";
import { AuthError, requireAuth, requireRole } from "@/lib/auth/permissions";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeWeatherReport } from "@/lib/reports/serialize";
import {
  WeatherReport,
  WEATHER_REPORT_STATUSES,
  type WeatherReportStatus
} from "@/models/WeatherReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function cleanText(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await connectMongo();

    const report = await WeatherReport.findById(id).lean().exec();

    if (!report) {
      return NextResponse.json({ message: "Không tìm thấy báo cáo." }, { status: 404 });
    }

    const isOwner = report.user && String(report.user) === String(user._id);
    const role = String(user.role ?? "user");

    if (!isOwner && role !== "admin" && role !== "rescuer") {
      return NextResponse.json({ message: "Bạn không có quyền xem báo cáo này." }, { status: 403 });
    }

    return NextResponse.json({ report: serializeWeatherReport(report) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể tải chi tiết báo cáo." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireRole(["admin", "rescuer"]);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      note?: unknown;
      status?: unknown;
    };
    const status = typeof body.status === "string" ? (body.status as WeatherReportStatus) : null;

    if (!status || !WEATHER_REPORT_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Trạng thái báo cáo không hợp lệ." }, { status: 400 });
    }

    await connectMongo();

    const report = await WeatherReport.findByIdAndUpdate(
      id,
      {
        $set: {
          handledAt: new Date(),
          handledBy: user._id,
          note: cleanText(body.note),
          status
        }
      },
      { new: true }
    )
      .lean()
      .exec();

    if (!report) {
      return NextResponse.json({ message: "Không tìm thấy báo cáo." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Đã cập nhật trạng thái báo cáo.",
      report: serializeWeatherReport(report)
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể cập nhật báo cáo." }, { status: 500 });
  }
}
