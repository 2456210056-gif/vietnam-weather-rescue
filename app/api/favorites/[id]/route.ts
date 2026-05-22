import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { FavoriteLocation } from "@/models/FavoriteLocation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Mã địa điểm không hợp lệ." }, { status: 400 });
  }

  await connectMongo();

  const deleted = await FavoriteLocation.findOneAndDelete({
    _id: id,
    user: session.user.id
  }).exec();

  if (!deleted) {
    return NextResponse.json({ message: "Không tìm thấy địa điểm." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Đã xóa địa điểm yêu thích."
  });
}
