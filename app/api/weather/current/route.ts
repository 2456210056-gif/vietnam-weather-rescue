import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/weather/weather-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));
  const locationName = url.searchParams.get("locationName") ?? undefined;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      {
        message: "Thiếu hoặc sai tham số lat/lon."
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const weather = await getCurrentWeather({
    latitude,
    longitude,
    locationName
  });

  return NextResponse.json(
    { weather },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
