"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Phone, ShieldPlus, UserRound } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

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
    <AuthShell mode="register">
      <div className="mb-6 text-center lg:text-left">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 lg:mx-0">
          <ShieldPlus aria-hidden className="h-6 w-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          New rescue account
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Mã quyền chỉ dùng cho cứu hộ hoặc quản trị.
        </p>
      </div>

      <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        <AuthInput
          autoComplete="name"
          icon={<UserRound aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Họ và tên"
          onChange={setFullName}
          placeholder="Nguyễn Văn A"
          required
          type="text"
          value={fullName}
        />
        <AuthInput
          autoComplete="email"
          icon={<Mail aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Email"
          onChange={setEmail}
          placeholder="email@..."
          required
          type="email"
          value={email}
        />
        <AuthInput
          autoComplete="tel"
          icon={<Phone aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Số điện thoại"
          onChange={setPhone}
          placeholder="090..."
          type="tel"
          value={phone}
        />
        <AuthInput
          autoComplete="off"
          icon={<KeyRound aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Mã quyền"
          onChange={setInviteCode}
          placeholder="Nếu có"
          type="text"
          value={inviteCode}
        />
        <AuthInput
          autoComplete="new-password"
          icon={<KeyRound aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Mật khẩu"
          minLength={6}
          onChange={setPassword}
          placeholder="6+ ký tự"
          required
          type="password"
          value={password}
        />
        <AuthInput
          autoComplete="new-password"
          icon={<KeyRound aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />}
          label="Nhập lại mật khẩu"
          minLength={6}
          onChange={setConfirmPassword}
          placeholder="Nhập lại"
          required
          type="password"
          value={confirmPassword}
        />

        {message ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 sm:col-span-2">
            {message}
          </p>
        ) : null}

        <button
          className="gpu-transition h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-base font-black text-white shadow-lg shadow-blue-950/15 transition hover:from-blue-500 hover:to-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm font-semibold text-slate-500">
        Đã có tài khoản?{" "}
        <Link className="font-black text-blue-600 transition hover:text-emerald-600" href={"/login" as Route}>
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
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
      <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-600">{label}</span>
      <div className="mt-2 flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        {icon}
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
          onChange={(event) => onChange(event.target.value)}
          value={value}
          {...inputProps}
        />
      </div>
    </label>
  );
}
