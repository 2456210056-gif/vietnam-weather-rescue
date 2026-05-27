import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardSection({
  action,
  children,
  className = "",
  description,
  eyebrow,
  title
}: DashboardSectionProps) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200/80 bg-white/90 p-5 text-slate-900 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:text-white dark:shadow-slate-950/30 lg:p-6 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-sky-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white lg:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
