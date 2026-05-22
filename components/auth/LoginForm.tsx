"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import { motion } from "framer-motion";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { WeatherCinematicBackground } from "@/components/weather/WeatherCinematicBackground";

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
    <section className="relative mx-auto -mt-2 flex min-h-[calc(100svh-7rem)] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[40px] px-4 py-10 shadow-2xl shadow-blue-950/20">
      <WeatherCinematicBackground condition="night" variant="auth" />
      <div className="absolute inset-0 z-[1] bg-slate-950/25" />

      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-[34px] border border-white/20 bg-slate-950/30 p-5 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-emerald-100">
            <ShieldCheck aria-hidden className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/80">
            Vietnam Rescue
          </p>
          <h2 className="mt-2 text-3xl font-black">Đăng nhập</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Truy cập dashboard, lịch sử SOS và các khu vực cứu hộ bằng tài khoản đã đăng ký.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-white/80">Email</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-emerald-200/70 focus-within:ring-4 focus-within:ring-emerald-300/15">
              <Mail aria-hidden className="h-4 w-4 text-white/60" />
              <input
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-white/80">Mật khẩu</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-emerald-200/70 focus-within:ring-4 focus-within:ring-emerald-300/15">
              <LockKeyhole aria-hidden className="h-4 w-4 text-white/60" />
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
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
            <p className="rounded-2xl border border-red-200/20 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-50">
              {error}
            </p>
          ) : null}

          <button
            className="gpu-transition w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-base font-black text-white shadow-lg shadow-blue-950/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </form>

        {enabledOAuthProviders.google || enabledOAuthProviders.facebook ? (
          <>
            <div className="my-5 h-px bg-white/15" />
            <div className="grid gap-3">
              {enabledOAuthProviders.google ? (
                <button
                  className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm font-black text-slate-900 shadow-sm transition-transform duration-200 hover:scale-[1.01]"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  type="button"
                >
                  Tiếp tục với Google
                </button>
              ) : null}
              {enabledOAuthProviders.facebook ? (
                <button
                  className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm font-black text-slate-900 shadow-sm transition-transform duration-200 hover:scale-[1.01]"
                  onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                  type="button"
                >
                  Tiếp tục với Facebook
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        <p className="mt-5 text-center text-sm text-white/70">
          Chưa có tài khoản?{" "}
          <Link className="font-black text-emerald-100" href={"/register" as Route}>
            Đăng ký
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
