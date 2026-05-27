"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

type LoginFormProps = {
  callbackUrl?: string;
  initialError?: string;
};

function getSafeErrorMessage(error: string) {
  if (!error) {
    return "";
  }

  if (error === "CredentialsSignin") {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (["OAuthSignin", "OAuthCallback", "Configuration"].includes(error)) {
    return "Đăng nhập Google/Facebook thất bại. Vui lòng kiểm tra OAuth callback URL.";
  }

  return "Không thể đăng nhập. Vui lòng thử lại.";
}

export function LoginForm({ callbackUrl = "/dashboard", initialError = "" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(getSafeErrorMessage(initialError));
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
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      callbackUrl,
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    router.push(safeCallbackUrl as Route);
    router.refresh();
  }

  return (
    <AuthShell mode="login">
      <div className="mb-6 text-center lg:text-left">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-sky-300 dark:ring-blue-400/20 lg:mx-0">
          <ShieldCheck aria-hidden className="h-[18px] w-[18px]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          Secure access
        </p>
        <h2 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white">
          Đăng nhập
        </h2>
        <p className="mt-3 max-w-[380px] text-[15px] font-medium leading-6 text-slate-500 dark:text-slate-300">
          Truy cập hồ sơ, lịch sử SOS và các công cụ cứu hộ của bạn.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
          <div className="flex h-[46px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-white/20 dark:hover:bg-slate-900 dark:focus-within:border-blue-400 dark:focus-within:bg-slate-950 dark:focus-within:ring-blue-400/20">
            <Mail aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              autoComplete="email"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nhập email của bạn"
              required
              type="email"
              value={email}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Mật khẩu</span>
          <div className="flex h-[46px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-white/20 dark:hover:bg-slate-900 dark:focus-within:border-blue-400 dark:focus-within:bg-slate-950 dark:focus-within:ring-blue-400/20">
            <LockKeyhole aria-hidden className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              autoComplete="current-password"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
              required
              type="password"
              value={password}
            />
          </div>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          className="gpu-transition h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-[15px] font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>

      {enabledOAuthProviders.google || enabledOAuthProviders.facebook ? (
        <>
          <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            Hoặc
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <SocialAuthButtons callbackUrl={callbackUrl} providers={enabledOAuthProviders} />
        </>
      ) : null}

      <div className="mt-5 space-y-2 text-center text-sm font-medium text-slate-500 dark:text-slate-300">
        <p>
          Chưa có tài khoản?{" "}
          <Link className="font-bold text-blue-600 transition hover:text-emerald-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300" href={"/register" as Route}>
            Đăng ký
          </Link>
        </p>
        <Link className="inline-flex font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300" href={"/" as Route}>
          Quay lại trang chủ
        </Link>
      </div>
    </AuthShell>
  );
}
