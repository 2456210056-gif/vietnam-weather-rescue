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
      className={`rounded-[32px] border border-white/10 bg-slate-900/72 p-5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-6 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-black text-white lg:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
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
