"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type RegisterResponse = {
  success?: boolean;
  message?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        inviteCode: inviteCode || undefined
      })
    });

    const payload = (await response.json().catch(() => ({}))) as RegisterResponse;
    setLoading(false);

    if (!response.ok || !payload.success) {
      setMessage(payload.message ?? "Không thể đăng ký tài khoản");
      return;
    }

    router.push("/login" as Route);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-950">Tạo tài khoản</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tài khoản email/password được lưu an toàn bằng mật khẩu đã hash.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Họ và tên</span>
            <input
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nguyễn Văn A"
              required
              type="text"
              value={fullName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Số điện thoại</span>
            <input
              autoComplete="tel"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="090..."
              type="tel"
              value={phone}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Mật khẩu</span>
            <input
              autoComplete="new-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Nhập lại mật khẩu</span>
            <input
              autoComplete="new-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              minLength={6}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Mã quyền đặc biệt</span>
            <input
              autoComplete="off"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Nhập mã admin/cứu hộ nếu có"
              type="text"
              value={inviteCode}
            />
          </label>

          {message ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {message}
            </p>
          ) : null}

          <button
            className="gpu-transition w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-base font-black text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link className="font-black text-blue-700" href={"/login" as Route}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
