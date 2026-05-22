import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { connectMongo } from "@/lib/db/mongoose";
import { serializeProfileUser } from "@/lib/profile/user";
import { User } from "@/models/User";

export const runtime = "nodejs";

type ProfileUpdateBody = {
  fullName?: unknown;
  name?: unknown;
  phone?: unknown;
  avatar?: unknown;
  image?: unknown;
};

function cleanText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  await connectMongo();
  const user = await User.findById(session.user.id)
    .select("_id fullName name email phone avatar image role")
    .lean()
    .exec();

  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
  }

  return NextResponse.json({
    user: serializeProfileUser(user)
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  let body: ProfileUpdateBody;

  try {
    body = (await request.json()) as ProfileUpdateBody;
  } catch {
    return NextResponse.json({ message: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const fullName = cleanText(body.fullName || body.name, 120);
  const phone = cleanText(body.phone, 30);
  const avatar = cleanText(body.avatar || body.image, 500);

  if (fullName && fullName.length < 2) {
    return NextResponse.json(
      { message: "Họ tên phải có ít nhất 2 ký tự." },
      { status: 400 }
    );
  }

  await connectMongo();
  const user = await User.findByIdAndUpdate(
    session.user.id,
    {
      $set: {
        ...(fullName ? { fullName, name: fullName } : {}),
        phone,
        ...(avatar ? { avatar, image: avatar } : {})
      }
    },
    {
      new: true
    }
  )
    .select("_id fullName name email phone avatar image role")
    .lean()
    .exec();

  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
  }

  return NextResponse.json({
    user: serializeProfileUser(user),
    message: "Đã cập nhật hồ sơ."
  });
}
