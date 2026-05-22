import { NextResponse } from "next/server";
import { getWeatherDashboardData } from "@/lib/weather/openweather";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationId = url.searchParams.get("location") ?? undefined;
  const weather = await getWeatherDashboardData(locationId);

  return NextResponse.json({
    weather,
    meta: {
      source: weather.source,
      fallbackReason: weather.fallbackReason ?? null
    }
  });
}
