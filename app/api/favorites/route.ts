import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeFavoriteLocation } from "@/lib/profile/serialize";
import { getDefaultWeatherLocation } from "@/lib/weather/locations";
import { FavoriteLocation } from "@/models/FavoriteLocation";

export const runtime = "nodejs";

type FavoriteCreateBody = {
  locationId?: unknown;
  name?: unknown;
  province?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  isDefault?: unknown;
};

function cleanText(value: unknown, maxLength = 120) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseCoordinate(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveFavoriteInput(body: FavoriteCreateBody) {
  const locationId = cleanText(body.locationId);
  const defaultLocation = locationId ? getDefaultWeatherLocation(locationId) : null;
  const latitude = parseCoordinate(body.latitude);
  const longitude = parseCoordinate(body.longitude);

  if (defaultLocation) {
    return {
      name: defaultLocation.name,
      province: defaultLocation.province,
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude,
      isDefault: Boolean(body.isDefault)
    };
  }

  return {
    name: cleanText(body.name),
    province: cleanText(body.province),
    latitude,
    longitude,
    isDefault: Boolean(body.isDefault)
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  await connectMongo();
  const favorites = await FavoriteLocation.find({ user: session.user.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .exec();

  return NextResponse.json({
    favorites: favorites.map(serializeFavoriteLocation)
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  let body: FavoriteCreateBody;

  try {
    body = (await request.json()) as FavoriteCreateBody;
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const input = resolveFavoriteInput(body);

  if (!input.name) {
    return NextResponse.json({ message: "Vui lòng nhập tên địa điểm." }, { status: 400 });
  }

  if (
    input.latitude === null ||
    input.longitude === null ||
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return NextResponse.json({ message: "Tọa độ địa điểm không hợp lệ." }, { status: 400 });
  }

  await connectMongo();

  if (input.isDefault) {
    await FavoriteLocation.updateMany(
      { user: session.user.id },
      {
        $set: {
          isDefault: false
        }
      }
    );
  }

  const favorite = await FavoriteLocation.findOneAndUpdate(
    {
      user: session.user.id,
      name: input.name
    },
    {
      $set: {
        province: input.province || undefined,
        location: {
          type: "Point",
          coordinates: [input.longitude, input.latitude]
        },
        isDefault: input.isDefault
      },
      $setOnInsert: {
        user: session.user.id,
        name: input.name
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).exec();

  return NextResponse.json(
    {
      favorite: serializeFavoriteLocation(favorite),
      message: "Đã lưu địa điểm yêu thích."
    },
    { status: 201 }
  );
}
