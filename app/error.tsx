"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="theme-smooth mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-5 text-center shadow-soft dark:border-red-400/20 dark:bg-slate-900/90">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
        <AlertTriangle aria-hidden className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Đã xảy ra lỗi</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Một phần dữ liệu không tải được. Hãy thử tải lại màn hình hiện tại.
      </p>
      <button
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-950"
        onClick={reset}
        type="button"
      >
        <RefreshCw aria-hidden className="h-4 w-4" />
        Tải lại
      </button>
    </section>
  );
}
