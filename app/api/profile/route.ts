import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeFavoriteLocation } from "@/lib/profile/serialize";
import { serializeProfileUser } from "@/lib/profile/user";
import { serializeSOSSignal } from "@/lib/sos/serialize";
import { FavoriteLocation } from "@/models/FavoriteLocation";
import { SOSSignal } from "@/models/SOSSignal";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  await connectMongo();

  const [user, favorites, sosHistory, sosCount, activeSOSCount] = await Promise.all([
    User.findById(session.user.id).select("_id fullName name email phone avatar image role").lean(),
    FavoriteLocation.find({ user: session.user.id }).sort({ isDefault: -1, createdAt: -1 }).exec(),
    SOSSignal.find({ user: session.user.id }).sort({ createdAt: -1 }).limit(12).exec(),
    SOSSignal.countDocuments({ user: session.user.id }),
    SOSSignal.countDocuments({
      user: session.user.id,
      status: {
        $in: ["PENDING", "ACKNOWLEDGED", "APPROACHING", "REACHED"]
      }
    })
  ]);

  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      user: serializeProfileUser(user),
      favorites: favorites.map(serializeFavoriteLocation),
      sosHistory: sosHistory.map(serializeSOSSignal),
      stats: {
        favoriteCount: favorites.length,
        sosCount,
        activeSOSCount
      }
    }
  });
}
