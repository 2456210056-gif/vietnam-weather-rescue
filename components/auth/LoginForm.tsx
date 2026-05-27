"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

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
      <div className="mb-5 text-center lg:text-left">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600 lg:mx-0">
          <ShieldCheck aria-hidden className="h-5 w-5" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
          Secure access
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Đăng nhập
        </h2>
        <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">
          Truy cập dashboard, lịch sử SOS và khu vực cứu hộ.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <div className="mt-1.5 flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Mail aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              autoComplete="email"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
              type="email"
              value={email}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
          <div className="mt-1.5 flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              autoComplete="current-password"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              type="password"
              value={password}
            />
          </div>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="gpu-transition h-11 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-base font-black text-white shadow-lg shadow-blue-950/15 transition hover:from-blue-500 hover:to-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>

      {enabledOAuthProviders.google || enabledOAuthProviders.facebook ? (
        <>
          <div className="my-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Hoặc
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3">
            {enabledOAuthProviders.google ? (
              <button
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 shadow-sm transition duration-200 hover:bg-slate-50 active:scale-[0.98]"
                onClick={() => signIn("google", { callbackUrl })}
                type="button"
              >
                Tiếp tục với Google
              </button>
            ) : null}
            {enabledOAuthProviders.facebook ? (
              <button
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 shadow-sm transition duration-200 hover:bg-slate-50 active:scale-[0.98]"
                onClick={() => signIn("facebook", { callbackUrl })}
                type="button"
              >
                Tiếp tục với Facebook
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <p className="mt-4 text-center text-sm font-semibold text-slate-500">
        Chưa có tài khoản?{" "}
        <Link className="font-black text-blue-600 transition hover:text-emerald-600" href={"/register" as Route}>
          Đăng ký
        </Link>
      </p>
      <p className="mt-2 text-center text-sm font-semibold text-slate-500">
        <Link className="font-black text-slate-700 transition hover:text-blue-600" href={"/" as Route}>
          Quay lại trang chủ
        </Link>
      </p>
    </AuthShell>
  );
}
