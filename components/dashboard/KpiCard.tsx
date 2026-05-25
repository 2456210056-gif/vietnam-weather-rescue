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
    icon: "bg-blue-500/15 text-sky-300 ring-blue-400/20",
    accent: "from-blue-500/24 to-sky-400/5",
    trend: "text-sky-300"
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
    accent: "from-emerald-500/22 to-emerald-400/5",
    trend: "text-emerald-300"
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
    accent: "from-amber-500/22 to-amber-400/5",
    trend: "text-amber-300"
  },
  red: {
    icon: "bg-red-500/15 text-red-300 ring-red-400/20",
    accent: "from-red-500/24 to-red-400/5",
    trend: "text-red-300"
  },
  slate: {
    icon: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
    accent: "from-slate-500/20 to-slate-400/5",
    trend: "text-slate-300"
  },
  violet: {
    icon: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
    accent: "from-violet-500/22 to-violet-400/5",
    trend: "text-violet-300"
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
    <article className="group relative min-h-[112px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80 p-4 text-white shadow-2xl shadow-slate-950/30 transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${styles.accent} opacity-90`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black leading-none text-white">{value}</p>
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
            <p className="text-xs font-semibold leading-5 text-slate-400">{description}</p>
          ) : null}
          {trend ? <p className={`text-xs font-black ${styles.trend}`}>{trend}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
