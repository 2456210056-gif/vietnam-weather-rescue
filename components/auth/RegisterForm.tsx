"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Mail, Phone, ShieldPlus, UserRound } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { WeatherCinematicBackground } from "@/components/weather/WeatherCinematicBackground";

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
    <section className="relative mx-auto -mt-2 flex min-h-[calc(100svh-7rem)] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[40px] px-4 py-10 shadow-2xl shadow-blue-950/20">
      <WeatherCinematicBackground condition="clouds" variant="auth" />
      <div className="absolute inset-0 z-[1] bg-slate-950/25" />

      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-lg rounded-[34px] border border-white/20 bg-slate-950/30 p-5 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-emerald-100">
            <ShieldPlus aria-hidden className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/80">
            Vietnam Rescue
          </p>
          <h2 className="mt-2 text-3xl font-black">Tạo tài khoản</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Mật khẩu được hash trước khi lưu. Mã quyền đặc biệt chỉ dùng khi bạn được cấp quyền cứu hộ/quản trị.
          </p>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <AuthInput
            autoComplete="name"
            icon={<UserRound aria-hidden className="h-4 w-4 text-white/60" />}
            label="Họ và tên"
            onChange={setFullName}
            placeholder="Nguyễn Văn A"
            required
            type="text"
            value={fullName}
          />
          <AuthInput
            autoComplete="email"
            icon={<Mail aria-hidden className="h-4 w-4 text-white/60" />}
            label="Email"
            onChange={setEmail}
            placeholder="email@example.com"
            required
            type="email"
            value={email}
          />
          <AuthInput
            autoComplete="tel"
            icon={<Phone aria-hidden className="h-4 w-4 text-white/60" />}
            label="Số điện thoại"
            onChange={setPhone}
            placeholder="090..."
            type="tel"
            value={phone}
          />
          <AuthInput
            autoComplete="off"
            icon={<KeyRound aria-hidden className="h-4 w-4 text-white/60" />}
            label="Mã quyền đặc biệt"
            onChange={setInviteCode}
            placeholder="Admin/cứu hộ nếu có"
            type="text"
            value={inviteCode}
          />
          <AuthInput
            autoComplete="new-password"
            icon={<KeyRound aria-hidden className="h-4 w-4 text-white/60" />}
            label="Mật khẩu"
            minLength={6}
            onChange={setPassword}
            placeholder="Tối thiểu 6 ký tự"
            required
            type="password"
            value={password}
          />
          <AuthInput
            autoComplete="new-password"
            icon={<KeyRound aria-hidden className="h-4 w-4 text-white/60" />}
            label="Nhập lại mật khẩu"
            minLength={6}
            onChange={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            required
            type="password"
            value={confirmPassword}
          />

          {message ? (
            <p className="rounded-2xl border border-red-200/20 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-50 sm:col-span-2">
              {message}
            </p>
          ) : null}

          <button
            className="gpu-transition rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-base font-black text-white shadow-lg shadow-blue-950/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/70">
          Đã có tài khoản?{" "}
          <Link className="font-black text-emerald-100" href={"/login" as Route}>
            Đăng nhập
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

function AuthInput({
  label,
  icon,
  value,
  onChange,
  ...inputProps
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-white/80">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-emerald-200/70 focus-within:ring-4 focus-within:ring-emerald-300/15">
        {icon}
        <input
          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
          onChange={(event) => onChange(event.target.value)}
          value={value}
          {...inputProps}
        />
      </div>
    </label>
  );
}
