"use client";

import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type LoginFormProps = {
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

export function LoginForm({ initialError = "" }: LoginFormProps) {
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
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-950">Đăng nhập</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Dùng email/mật khẩu hoặc OAuth đã cấu hình để truy cập Dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <span className="text-sm font-semibold text-slate-800">Mật khẩu</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="gpu-transition w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-base font-black text-white shadow-lg shadow-blue-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </form>

        {enabledOAuthProviders.google || enabledOAuthProviders.facebook ? (
          <>
            <div className="my-5 h-px bg-slate-200" />
            <div className="grid gap-3">
              {enabledOAuthProviders.google ? (
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  type="button"
                >
                  Tiếp tục với Google
                </button>
              ) : null}
              {enabledOAuthProviders.facebook ? (
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm"
                  onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                  type="button"
                >
                  Tiếp tục với Facebook
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        <p className="mt-5 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link className="font-black text-blue-700" href={"/register" as Route}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
