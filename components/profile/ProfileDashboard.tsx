"use client";

import {
  AlertTriangle,
  Bell,
  ChevronRight,
  FileText,
  History,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Siren,
  Star,
  Trash2,
  UserRound,
  WifiOff
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import useSWR from "swr";
import { CompactWeatherWidget } from "@/components/dashboard/CompactWeatherWidget";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SOSDetailModal } from "@/components/sos/SOSDetailModal";
import { useOfflineSOSQueue } from "@/hooks/useOfflineSOSQueue";
import type { OfflineSOSQueueItem } from "@/lib/offline-sos-queue";
import { DEFAULT_WEATHER_LOCATIONS } from "@/lib/weather/locations";
import type { ProfileSummaryDTO } from "@/types/profile";
import type { UserRole } from "@/types/roles";
import type { SOSNeed, SOSSignalDTO, SOSStatus } from "@/types/sos";

type ProfileResponse = {
  profile: ProfileSummaryDTO;
};

type ReportDTO = {
  id: string;
  area: string;
  type: string;
  description: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
};

type ReportsResponse = {
  reports: ReportDTO[];
};

type ProfileDashboardProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
};

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Người dùng",
  rescuer: "Cứu hộ viên",
  admin: "Quản trị viên"
};

const SOS_STATUS_TEXT: Record<SOSStatus, string> = {
  PENDING: "Chờ cứu hộ",
  ACKNOWLEDGED: "Đã tiếp nhận",
  APPROACHING: "Đang tiếp cận",
  REACHED: "Đã tiếp cận",
  RESOLVED: "Đã xử lý",
  CANCELLED: "Đã hủy"
};

const SOS_NEED_TEXT: Record<SOSNeed, string> = {
  TRAPPED: "Bị mắc kẹt",
  INJURY: "Bị thương",
  FOOD: "Thiếu thức ăn / nước",
  FLOOD: "Ngập lụt",
  FIRE: "Cháy nổ",
  LANDSLIDE: "Sạt lở",
  MEDICAL: "Y tế",
  OTHER: "Khác"
};

async function fetcher<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    console.warn(
      `Dashboard expected JSON from ${url} but got ${contentType || "unknown content type"}.`,
      text.slice(0, 120)
    );
    throw new Error("API không trả JSON hợp lệ.");
  }

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu dashboard.");
  }

  return payload;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function formatSOSNeeds(signal: SOSSignalDTO) {
  return signal.needs.map((need) => SOS_NEED_TEXT[need]).join(", ") || "SOS";
}

function reportStatusLabel(status: string) {
  if (status === "RESOLVED") return "Đã xử lý";
  if (status === "REVIEWING") return "Đang xem xét";
  return "Đã ghi nhận";
}

export function ProfileDashboard({ user }: ProfileDashboardProps) {
  const [locationId, setLocationId] = useState(DEFAULT_WEATHER_LOCATIONS[0].id);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState<SOSSignalDTO | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher<ProfileResponse>,
    { revalidateOnFocus: true }
  );
  const { data: reportsData } = useSWR<ReportsResponse>(
    "/api/reports",
    fetcher<ReportsResponse>,
    { revalidateOnFocus: true }
  );
  const offlineSOSQueue = useOfflineSOSQueue();

  const profile = data?.profile;
  const favorites = useMemo(
    () => (Array.isArray(profile?.favorites) ? profile.favorites : []),
    [profile]
  );
  const sosHistory = useMemo(
    () => (Array.isArray(profile?.sosHistory) ? profile.sosHistory : []),
    [profile]
  );
  const reports = useMemo(
    () => (Array.isArray(reportsData?.reports) ? reportsData.reports : []),
    [reportsData]
  );
  const displayName =
    profile?.user.fullName ?? profile?.user.name ?? user.name ?? user.email ?? "Người dùng";
  const displayEmail = profile?.user.email ?? user.email ?? "";
  const displayRole = profile?.user.role ?? user.role;
  const avatar = profile?.user.avatar ?? profile?.user.image ?? user.image ?? "";
  const activeSOS = useMemo(
    () =>
      sosHistory.find((signal) =>
        ["PENDING", "ACKNOWLEDGED", "APPROACHING", "REACHED"].includes(signal.status)
      ) ?? null,
    [sosHistory]
  );
  const notificationItems = useMemo(() => {
    const sosItems = sosHistory.slice(0, 3).map((signal) => ({
      id: `sos-${signal.id}`,
      title: SOS_STATUS_TEXT[signal.status],
      message: formatSOSNeeds(signal),
      time: signal.updatedAt
    }));
    const reportItems = reports.slice(0, 2).map((report) => ({
      id: `report-${report.id}`,
      title: reportStatusLabel(report.status),
      message: `${report.type} · ${report.area}`,
      time: report.updatedAt
    }));

    return [...sosItems, ...reportItems].slice(0, 5);
  }, [sosHistory, reports]);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        avatar: formData.get("avatar")
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    setSavingProfile(false);
    setMessage(payload.message ?? "Đã cập nhật hồ sơ.");
    await mutate();
    setIsEditingProfile(false);
  }

  async function addFavorite() {
    setSavingFavorite(true);
    setMessage("");

    try {
      const response = await fetch("/api/favorite-locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ locationId })
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setMessage(payload.message ?? "Đã cập nhật địa điểm yêu thích.");
      await mutate();
    } finally {
      setSavingFavorite(false);
    }
  }

  async function deleteFavorite(id: string) {
    setMessage("");
    const response = await fetch(`/api/favorite-locations/${id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    setMessage(payload.message ?? "Đã cập nhật địa điểm yêu thích.");
    await mutate();
  }

  if (isLoading) {
    return (
      <div className="rounded-[32px] bg-[#050B18] p-5 text-white shadow-2xl shadow-slate-950/35">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[24px] bg-slate-900/80" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] bg-[#050B18] p-4 text-white shadow-2xl shadow-slate-950/35 lg:p-5">
      <section className="mb-5 rounded-[28px] border border-white/10 bg-slate-900/80 p-3 shadow-2xl shadow-slate-950/25 lg:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
              <UserRound aria-hidden className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-300">
                Bảng điều khiển cá nhân
              </p>
              <h1 className="truncate text-xl font-black text-white lg:text-2xl">
                Xin chào, {displayName}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex h-10 max-w-[360px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/75 px-3 text-xs font-bold text-slate-200">
              <MapPin aria-hidden className="h-4 w-4 text-emerald-300" />
              <span className="truncate">Vị trí: xem trong widget thời tiết</span>
            </div>
            <div className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/75 px-2.5">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="h-8 w-8 rounded-full object-cover" src={avatar} />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-500/20 text-sky-200">
                  <UserRound aria-hidden className="h-4 w-4" />
                </div>
              )}
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-36 truncate text-xs font-black text-white">{displayName}</p>
                <p className="max-w-36 truncate text-[11px] font-semibold text-slate-400">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">
          {error.message}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-100">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          description="Tín hiệu cá nhân"
          icon={<Siren aria-hidden className="h-5 w-5" />}
          title="SOS đã gửi"
          value={profile?.stats?.sosCount ?? sosHistory.length}
          variant="blue"
        />
        <KpiCard
          description="Báo cáo thời tiết"
          icon={<FileText aria-hidden className="h-5 w-5" />}
          title="Báo cáo đã gửi"
          value={reports.length}
          variant="emerald"
        />
        <KpiCard
          description="Khu vực theo dõi"
          icon={<Star aria-hidden className="h-5 w-5" />}
          title="Địa điểm yêu thích"
          value={profile?.stats?.favoriteCount ?? favorites.length}
          variant="violet"
        />
        <KpiCard
          description="Cập nhật cá nhân"
          icon={<Bell aria-hidden className="h-5 w-5" />}
          title="Thông báo mới"
          value={notificationItems.length + offlineSOSQueue.items.length}
          variant="amber"
        />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-12 xl:items-start">
        <div className="space-y-5 xl:col-span-8">
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <SafetyStatusCard signal={activeSOS} onOpen={() => activeSOS && setSelectedSOS(activeSOS)} />
            <CompactWeatherWidget />
          </div>

          <DashboardCard action={<History aria-hidden className="h-5 w-5 text-sky-300" />} title="SOS gần đây">
            {offlineSOSQueue.items.length ? (
              <OfflineSOSQueueCard queue={offlineSOSQueue} />
            ) : null}
            <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
              {sosHistory.slice(0, 5).map((signal) => (
                <button
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/65 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-blue-400/30"
                  key={signal.id}
                  onClick={() => setSelectedSOS(signal)}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{formatSOSNeeds(signal)}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                      {formatDate(signal.createdAt)} · {signal.coordinates.latitude.toFixed(5)},{" "}
                      {signal.coordinates.longitude.toFixed(5)}
                    </p>
                    {signal.note ? (
                      <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-500">
                        {signal.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge tone={signal.status}>{SOS_STATUS_TEXT[signal.status]}</StatusBadge>
                    <ChevronRight aria-hidden className="h-4 w-4 text-slate-500" />
                  </div>
                </button>
              ))}
              {sosHistory.length === 0 ? (
                <EmptyState text="Bạn chưa phát tín hiệu SOS nào." />
              ) : null}
            </div>
          </DashboardCard>

          <ReportsCard onSelectReport={setSelectedReport} reports={reports} />
        </div>


        <aside className="space-y-5 xl:col-span-4">
          <DashboardCard
            action={<UserRound aria-hidden className="h-5 w-5 text-sky-300" />}
            title="Thông tin cá nhân"
          >
            <ProfileSummaryCard
              avatar={avatar}
              displayEmail={displayEmail}
              displayName={displayName}
              displayRole={displayRole}
              isEditing={isEditingProfile}
              onCancelEdit={() => setIsEditingProfile(false)}
              onToggleEdit={() => setIsEditingProfile((current) => !current)}
              profile={profile}
              savingProfile={savingProfile}
              updateProfile={updateProfile}
              user={user}
            />
          </DashboardCard>

          <DashboardCard
            action={<Star aria-hidden className="h-5 w-5 text-violet-300" />}
            title="Địa điểm yêu thích"
          >
            <div className="grid max-h-[320px] gap-3 overflow-y-auto pr-1">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
                <select
                  className="h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none focus:border-blue-400"
                  onChange={(event) => setLocationId(event.target.value)}
                  value={locationId}
                >
                  {DEFAULT_WEATHER_LOCATIONS.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
                  disabled={savingFavorite}
                  onClick={() => void addFavorite()}
                  type="button"
                >
                  {savingFavorite ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : "Lưu địa điểm"}
                </button>
              </div>

              {favorites.slice(0, 3).map((favorite) => (
                <article
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/65 p-3"
                  key={favorite.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{favorite.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      aria-label="Xem thời tiết"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-sky-200"
                      href="/"
                    >
                      <MapPin aria-hidden className="h-4 w-4" />
                    </Link>
                    <button
                      aria-label="Xóa địa điểm"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/15 text-red-200"
                      onClick={() => void deleteFavorite(favorite.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
              {favorites.length === 0 ? (
                <EmptyState text="Chưa có địa điểm yêu thích." />
              ) : null}
            </div>
          </DashboardCard>

          <NotificationsCard items={notificationItems} />
        </aside>

      </div>

      {selectedSOS ? (
        <SOSDetailModal onClose={() => setSelectedSOS(null)} signal={selectedSOS} />
      ) : null}
      {selectedReport ? (
        <ReportDetailModal onClose={() => setSelectedReport(null)} report={selectedReport} />
      ) : null}
    </div>
  );
}

function OfflineSOSQueueCard({
  queue
}: {
  queue: ReturnType<typeof useOfflineSOSQueue>;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-slate-950">
          <WifiOff aria-hidden className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-amber-100">SOS chờ gửi</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-amber-100/80">
            {queue.items.length} tín hiệu đang lưu tạm trên thiết bị. Hệ thống sẽ tự gửi khi có
            mạng và có tọa độ hợp lệ.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {queue.items.slice(0, 3).map((item) => (
          <OfflineSOSQueueItem
            item={item}
            key={item.localId}
            onRemove={() => queue.remove(item.localId)}
            onRetry={() => void queue.retryNow()}
          />
        ))}
      </div>
    </div>
  );
}

function OfflineSOSQueueItem({
  item,
  onRemove,
  onRetry
}: {
  item: OfflineSOSQueueItem;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const hasCoordinates =
    typeof item.latitude === "number" && typeof item.longitude === "number";
  const locationBadge =
    item.locationStatus === "last_known"
      ? "Vị trí gần nhất"
      : hasCoordinates
        ? "Có GPS"
        : item.addressText
          ? "Vị trí thủ công"
          : "Thiếu GPS";

  return (
    <details className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-sm text-white">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-black">
              {item.needs.map((need) => SOS_NEED_TEXT[need]).join(", ") || "SOS offline"}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {formatDate(item.createdAt)} · {hasCoordinates
                ? `${item.latitude?.toFixed(5)}, ${item.longitude?.toFixed(5)}`
                : "Chưa có tọa độ"}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-amber-300/25 bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-100">
            {locationBadge}
          </span>
        </div>
      </summary>

      <div className="mt-3 rounded-2xl bg-slate-950/60 p-3">
        <p className="text-xs font-semibold leading-5 text-slate-300">
          {item.note || "Chưa có mô tả sự cố."}
        </p>
        <p className="mt-2 text-xs font-semibold text-slate-400">
          Vị trí: {item.addressText || "Chưa có mô tả vị trí."}
        </p>
        {item.lastError ? (
          <p className="mt-2 flex items-start gap-2 text-xs font-bold text-amber-200">
            <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {item.lastError}
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-amber-500 px-3 text-xs font-black text-slate-950"
          onClick={onRetry}
          type="button"
        >
          Gửi lại ngay
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/15 px-3 text-xs font-black text-red-100"
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden className="h-4 w-4" />
          Xóa khỏi hàng chờ
        </button>
      </div>
    </details>
  );
}

function ReportsCard({
  onSelectReport,
  reports
}: {
  onSelectReport: (report: ReportDTO) => void;
  reports: ReportDTO[];
}) {
  return (
    <DashboardCard
      action={<FileText aria-hidden className="h-5 w-5 text-emerald-300" />}
      title="Báo cáo thời tiết đã gửi"
    >
      <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
        {reports.slice(0, 6).map((report) => (
          <button
            className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/65 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/30"
            key={report.id}
            onClick={() => onSelectReport(report)}
            type="button"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {report.type} · {report.area}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">
                {report.description}
              </p>
              <p className="mt-2 text-xs font-bold text-slate-500">
                {formatDate(report.createdAt)}
                {typeof report.latitude === "number" && typeof report.longitude === "number"
                  ? ` · ${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`
                  : ""}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-200">
              {reportStatusLabel(report.status)}
            </span>
          </button>
        ))}
        {reports.length === 0 ? <EmptyState text="Bạn chưa gửi báo cáo nào." /> : null}
      </div>
    </DashboardCard>
  );
}

function NotificationsCard({
  items
}: {
  items: Array<{ id: string; message: string; time: string; title: string }>;
}) {
  return (
    <DashboardCard
      action={<Bell aria-hidden className="h-5 w-5 text-amber-300" />}
      title="Thông báo của tôi"
    >
      <div className="grid max-h-[300px] gap-3 overflow-y-auto pr-1">
        {items.slice(0, 6).map((item) => (
          <article
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-3"
            key={item.id}
          >
            <p className="text-sm font-black text-white">{item.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              {item.message}
            </p>
            <p className="mt-2 text-[11px] font-bold text-slate-500">
              {formatDate(item.time)}
            </p>
          </article>
        ))}
        {items.length === 0 ? <EmptyState text="Chưa có thông báo cá nhân." /> : null}
      </div>
    </DashboardCard>
  );
}

function DashboardCard({
  action,
  children,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/25">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProfileSummaryCard({
  avatar,
  displayEmail,
  displayName,
  displayRole,
  isEditing,
  onCancelEdit,
  onToggleEdit,
  profile,
  savingProfile,
  updateProfile,
  user
}: {
  avatar: string;
  displayEmail: string;
  displayName: string;
  displayRole: UserRole;
  isEditing: boolean;
  onCancelEdit: () => void;
  onToggleEdit: () => void;
  profile?: ProfileSummaryDTO;
  savingProfile: boolean;
  updateProfile: (event: FormEvent<HTMLFormElement>) => void;
  user: ProfileDashboardProps["user"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-16 w-16 shrink-0 rounded-3xl object-cover ring-1 ring-white/10"
            src={avatar}
          />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-blue-500/20 text-sky-200 ring-1 ring-white/10">
            <UserRound aria-hidden className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-white">{displayName}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-400">
            {displayEmail || "--"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone={displayRole}>{ROLE_LABELS[displayRole]}</StatusBadge>
            {profile?.user.phone ? (
              <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-xs font-bold text-slate-300">
                {profile.user.phone}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <button
        className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
        onClick={onToggleEdit}
        type="button"
      >
        {isEditing ? "Ẩn chỉnh sửa" : "Chỉnh sửa"}
      </button>

      {isEditing ? (
        <form
          className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/45 p-3"
          onSubmit={updateProfile}
        >
          <ProfileInput
            defaultValue={profile?.user.fullName ?? profile?.user.name ?? user.name ?? ""}
            label="Họ tên"
            name="fullName"
            placeholder="Nguyễn Văn A"
          />
          <ProfileInput
            defaultValue={profile?.user.phone ?? ""}
            label="Số điện thoại"
            name="phone"
            placeholder="090..."
            type="tel"
          />
          <ProfileInput
            defaultValue={avatar}
            label="Avatar URL tùy chọn"
            name="avatar"
            placeholder="https://..."
            type="url"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white"
              onClick={onCancelEdit}
              type="button"
            >
              Hủy
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
              disabled={savingProfile}
              type="submit"
            >
              {savingProfile ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <Save aria-hidden className="h-4 w-4" />
              )}
              Lưu
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function ProfileInput({
  defaultValue,
  label,
  name,
  placeholder,
  type = "text"
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <input
        className="mt-2 h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none focus:border-blue-400"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function SafetyStatusCard({
  onOpen,
  signal
}: {
  onOpen: () => void;
  signal: SOSSignalDTO | null;
}) {
  const active = Boolean(signal);
  const activeSignal = signal;

  return (
    <section
      className={`flex min-h-[220px] flex-col justify-between rounded-[24px] border p-4 shadow-2xl shadow-slate-950/25 ${
        active
          ? "border-red-400/20 bg-red-500/15"
          : "border-emerald-400/20 bg-emerald-500/15"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
              active ? "bg-red-600 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {active ? (
              <Siren aria-hidden className="h-5 w-5" />
            ) : (
              <ShieldCheck aria-hidden className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-300">
              Trạng thái an toàn
            </p>
            <h2 className="mt-2 text-lg font-black leading-tight text-white sm:text-xl">
              {active ? "Đang theo dõi SOS" : "Bạn đang an toàn"}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-5 text-slate-300">
              {activeSignal
                ? `${SOS_STATUS_TEXT[activeSignal.status]} · ${formatDate(activeSignal.createdAt)}`
                : "Không có yêu cầu SOS đang theo dõi."}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge tone={activeSignal?.status ?? "emerald"}>
            {activeSignal ? SOS_STATUS_TEXT[activeSignal.status] : "An toàn"}
          </StatusBadge>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {activeSignal ? (
          <>
            <button
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-red-700"
              onClick={onOpen}
              type="button"
            >
              Xem chi tiết
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-black text-white"
              href={`/map?sosId=${activeSignal.id}`}
            >
              Xem bản đồ
            </Link>
          </>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-black text-white sm:col-span-2">
            An toàn
          </span>
        )}
        </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/35 p-4 text-center text-sm font-bold text-slate-400">
      {text}
    </div>
  );
}

function ReportDetailModal({ onClose, report }: { onClose: () => void; report: ReportDTO }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/68 p-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-[32px] border border-white/15 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Chi tiết báo cáo
            </p>
            <h2 className="mt-2 text-2xl font-black">{report.type} · {report.area}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Mã báo cáo: {report.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoPill label="Trạng thái" value={reportStatusLabel(report.status)} />
          <InfoPill label="Thời gian gửi" value={formatDate(report.createdAt)} />
          <InfoPill
            label="Tọa độ GIS"
            value={
              typeof report.latitude === "number" && typeof report.longitude === "number"
                ? `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`
                : "--"
            }
          />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Nội dung
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
            {report.description}
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-slate-200">{value}</p>
    </div>
  );
}
