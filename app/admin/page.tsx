import { getServerSession } from "next-auth";
import type { Route } from "next";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { authOptions } from "@/lib/auth/options";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <AuthRequired />;
  }

  if (session.user.role !== "admin") {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}

function AuthRequired() {
  return (
    <section className="mx-auto max-w-xl rounded-[32px] border border-white/70 bg-white/85 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <h2 className="text-2xl font-black text-slate-950">Vui lòng đăng nhập</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        Bạn cần tài khoản quản trị để xem trang Admin.
      </p>
      <Link
        className="mt-4 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white"
        href={"/login" as Route}
      >
        Đăng nhập
      </Link>
    </section>
  );
}

function AccessDenied() {
  return (
    <section className="mx-auto max-w-xl rounded-[32px] border border-red-100 bg-white/85 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <h2 className="text-2xl font-black text-slate-950">
        Bạn không có quyền truy cập khu vực này
      </h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        Trang này chỉ dành cho Quản trị viên.
      </p>
      <Link
        className="mt-4 inline-flex h-12 items-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
        href="/dashboard"
      >
        Về Dashboard
      </Link>
    </section>
  );
}
