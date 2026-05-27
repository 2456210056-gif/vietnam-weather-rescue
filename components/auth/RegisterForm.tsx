"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, type ClientSafeProvider } from "next-auth/react";
import { KeyRound, Mail, Phone, ShieldPlus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

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
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    void getProviders().then((nextProviders) => setProviders(nextProviders));
  }, []);

  const enabledOAuthProviders = useMemo(
    () => ({
      google: providers?.google,
      facebook: providers?.facebook
    }),
    [providers]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
      return;
    }

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
      <div className="mb-5 text-center lg:text-left">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20 lg:mx-0">
          <ShieldPlus aria-hidden className="h-[18px] w-[18px]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-sky-300">
          New rescue account
        </p>
        <h2 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white">
          Tạo tài khoản
        </h2>
        <p className="mt-3 max-w-[380px] text-[15px] font-medium leading-6 text-slate-500 dark:text-slate-300">
          Lưu thông tin cá nhân để gửi SOS và nhận hỗ trợ nhanh hơn.
        </p>
      </div>

      <form className="grid gap-x-3 gap-y-3 sm:grid-cols-2" noValidate onSubmit={handleSubmit}>
        <AuthInput
          autoComplete="name"
          icon={<UserRound aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
          label="Họ và tên"
          onChange={setFullName}
          placeholder="Nguyễn Văn A"
          required
          type="text"
          value={fullName}
        />
        <AuthInput
          autoComplete="email"
          icon={<Mail aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
          label="Email"
          onChange={setEmail}
          placeholder="email@example.com"
          required
          type="email"
          value={email}
        />
        <AuthInput
          autoComplete="tel"
          icon={<Phone aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
          label="Số điện thoại"
          onChange={setPhone}
          placeholder="090..."
          type="tel"
          value={phone}
        />
        <AuthInput
          autoComplete="off"
          icon={<KeyRound aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
          label="Mã quyền"
          onChange={setInviteCode}
          placeholder="Nếu có"
          type="text"
          value={inviteCode}
        />
        <AuthInput
          autoComplete="new-password"
          icon={<KeyRound aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
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
          icon={<KeyRound aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />}
          label="Nhập lại mật khẩu"
          minLength={6}
          onChange={setConfirmPassword}
          placeholder="Nhập lại mật khẩu"
          required
          type="password"
          value={confirmPassword}
        />

        {message ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300 sm:col-span-2">
            {message}
          </p>
        ) : null}

        <button
          className="gpu-transition h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-[15px] font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </form>

      {enabledOAuthProviders.google || enabledOAuthProviders.facebook ? (
        <>
          <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            Hoặc
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <SocialAuthButtons callbackUrl="/dashboard" providers={enabledOAuthProviders} />
        </>
      ) : null}

      <div className="mt-5 space-y-2 text-center text-sm font-medium text-slate-500 dark:text-slate-300">
        <p>
          Đã có tài khoản?{" "}
          <Link className="font-bold text-blue-600 transition hover:text-emerald-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300" href={"/login" as Route}>
            Đăng nhập
          </Link>
        </p>
        <Link className="inline-flex font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300" href={"/" as Route}>
          Quay lại trang chủ
        </Link>
      </div>
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
      <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex h-[46px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 transition duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-white/20 dark:hover:bg-slate-900 dark:focus-within:border-blue-400 dark:focus-within:bg-slate-950 dark:focus-within:ring-blue-400/20">
        {icon}
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          onChange={(event) => onChange(event.target.value)}
          value={value}
          {...inputProps}
        />
      </div>
    </label>
  );
}
