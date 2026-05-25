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
      className={`rounded-3xl border p-4 shadow-2xl shadow-slate-950/15 transition duration-200 hover:-translate-y-0.5 ${
        danger
          ? "border-red-400/15 bg-red-500/10 hover:border-red-300/30"
          : "border-white/10 bg-slate-950/45 hover:border-white/20"
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
                danger ? "bg-red-500/15 text-red-200" : "bg-blue-500/15 text-sky-200"
              }`}
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-black text-white">{title}</p>
            {subtitle ? (
              <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {status && statusLabel ? <StatusBadge tone={status}>{statusLabel}</StatusBadge> : null}
      </div>

      {description ? (
        <p className="mt-3 text-sm font-bold leading-6 text-slate-300">{description}</p>
      ) : null}
      {meta ? <p className="mt-2 text-xs font-bold text-slate-500">{meta}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}
