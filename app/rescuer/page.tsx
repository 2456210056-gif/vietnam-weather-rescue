import { getServerSession } from "next-auth";
import type { Route } from "next";
import Link from "next/link";
import { RescuerDashboard } from "@/components/rescuer/RescuerDashboard";
import { authOptions } from "@/lib/auth/options";

export default async function RescuerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <AuthRequired />;
  }

  if (session.user.role !== "rescuer" && session.user.role !== "admin") {
    return <AccessDenied />;
  }

  return <RescuerDashboard />;
}

function AuthRequired() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-white/85 p-6 text-center shadow-soft backdrop-blur-xl">
      <h2 className="text-2xl font-black text-slate-950">Vui lòng đăng nhập</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Bạn cần đăng nhập bằng tài khoản cứu hộ hoặc quản trị để xem danh sách SOS.
      </p>
      <Link
        className="mt-4 inline-flex rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
        href={"/login" as Route}
      >
        Đăng nhập
      </Link>
    </section>
  );
}

function AccessDenied() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white/85 p-6 text-center shadow-soft backdrop-blur-xl">
      <h2 className="text-2xl font-black text-slate-950">
        Bạn không có quyền truy cập khu vực này
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Trang này chỉ dành cho Cứu hộ viên hoặc Quản trị viên.
      </p>
      <Link
        className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
        href="/dashboard"
      >
        Về Dashboard
      </Link>
    </section>
  );
}
