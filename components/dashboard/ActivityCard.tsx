import type { ReactNode } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { SOSStatus } from "@/types/sos";

type ActivityCardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  meta?: ReactNode;
  icon?: ReactNode;
  status?: SOSStatus;
  statusLabel?: string;
  action?: ReactNode;
  onClick?: () => void;
  tone?: "default" | "danger";
};

export function ActivityCard({
  action,
  description,
  icon,
  meta,
  onClick,
  status,
  statusLabel,
  subtitle,
  title,
  tone = "default"
}: ActivityCardProps) {
  const danger = tone === "danger";

  return (
    <article
      className={`rounded-3xl border p-4 shadow-xl shadow-slate-950/5 transition duration-200 ${
        danger
          ? "border-red-200 bg-red-50/80 hover:border-red-300 dark:border-red-400/15 dark:bg-red-500/10 dark:hover:border-red-300/30"
          : "border-slate-200 bg-white/80 hover:border-blue-200 dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-white/20"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {icon ? (
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                danger ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200" : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-sky-200"
              }`}
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-black text-slate-950 dark:text-white">{title}</p>
            {subtitle ? (
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {status && statusLabel ? <StatusBadge tone={status}>{statusLabel}</StatusBadge> : null}
      </div>

      {description ? (
        <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}
      {meta ? <p className="mt-2 text-xs font-bold text-slate-500">{meta}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}
