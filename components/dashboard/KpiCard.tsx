import type { ReactNode } from "react";

type KpiVariant = "blue" | "emerald" | "amber" | "red" | "slate" | "violet";

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: string;
  variant?: KpiVariant;
};

const VARIANT_STYLES: Record<KpiVariant, { icon: string; accent: string; trend: string }> = {
  blue: {
    icon: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-sky-300 dark:ring-blue-400/20",
    accent: "from-blue-500/24 to-sky-400/5",
    trend: "text-blue-700 dark:text-sky-300"
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
    accent: "from-emerald-500/22 to-emerald-400/5",
    trend: "text-emerald-700 dark:text-emerald-300"
  },
  amber: {
    icon: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
    accent: "from-amber-500/22 to-amber-400/5",
    trend: "text-amber-700 dark:text-amber-300"
  },
  red: {
    icon: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20",
    accent: "from-red-500/24 to-red-400/5",
    trend: "text-red-700 dark:text-red-300"
  },
  slate: {
    icon: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-400/20",
    accent: "from-slate-500/20 to-slate-400/5",
    trend: "text-slate-700 dark:text-slate-300"
  },
  violet: {
    icon: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20",
    accent: "from-violet-500/22 to-violet-400/5",
    trend: "text-violet-700 dark:text-violet-300"
  }
};

export function KpiCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "blue"
}: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <article className="group relative min-h-[104px] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 p-4 text-slate-900 shadow-xl shadow-slate-950/5 transition duration-200 hover:border-blue-200 hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-white dark:shadow-slate-950/30 dark:hover:border-white/20">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${styles.accent} opacity-90`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black leading-none text-slate-950 dark:text-white">{value}</p>
        </div>
        {icon ? (
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${styles.icon}`}>
            {icon}
          </div>
        ) : null}
      </div>
      {description || trend ? (
        <div className="relative mt-3 space-y-1">
          {description ? (
            <p className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">{description}</p>
          ) : null}
          {trend ? <p className={`text-xs font-black ${styles.trend}`}>{trend}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
