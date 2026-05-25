"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();
  const isDark = mounted && theme === "dark";

  return (
    <button
      aria-label={isDark ? "Chế độ sáng" : "Chế độ tối"}
      className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg shadow-blue-950/10 backdrop-blur-xl transition hover:scale-[1.03] hover:border-blue-200 hover:text-blue-700 active:scale-95 dark:border-white/15 dark:bg-slate-950/90 dark:text-slate-100 dark:shadow-slate-950/30 dark:hover:text-emerald-300"
      onClick={toggleTheme}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
      type="button"
    >
      {isDark ? <Sun aria-hidden className="h-5 w-5" /> : <Moon aria-hidden className="h-5 w-5" />}
    </button>
  );
}
