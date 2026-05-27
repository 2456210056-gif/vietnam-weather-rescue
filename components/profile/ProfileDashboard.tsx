"use client";

import {
  Bell,
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
import type { Route } from "next";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import useSWR from "swr";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SOSDetailModal } from "@/components/sos/SOSDetailModal";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineSOSQueue } from "@/hooks/useOfflineSOSQueue";
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

type DashboardNotification = {
  id: string;
  kind: "sos" | "report";
  refId: string;
  message: string;
  time: string;
  title: string;
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
  const [syncingOfflineSOS, setSyncingOfflineSOS] = useState(false);
  const [showOfflineQueueDetails, setShowOfflineQueueDetails] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState<SOSSignalDTO | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher<ProfileResponse>,
    { revalidateOnFocus: true }
  );
  const { data: reportsData } = useSWR<ReportsResponse>(
    "/api/reports?mine=true",
    fetcher<ReportsResponse>,
    { revalidateOnFocus: true }
  );
  const offlineSOSQueue = useOfflineSOSQueue();
  const { isOnline } = useNetworkStatus();

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
      kind: "sos" as const,
      refId: signal.id,
      title: SOS_STATUS_TEXT[signal.status],
      message: formatSOSNeeds(signal),
      time: signal.updatedAt
    }));
    const reportItems = reports.slice(0, 2).map((report) => ({
      id: `report-${report.id}`,
      kind: "report" as const,
      refId: report.id,
      title: reportStatusLabel(report.status),
      message: `${report.type} · ${report.area}`,
      time: report.updatedAt
    }));

    return [...sosItems, ...reportItems].slice(0, 5);
  }, [sosHistory, reports]);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openNotificationItem(item: DashboardNotification) {
    if (item.kind === "sos") {
      const signal = sosHistory.find((entry) => entry.id === item.refId);
      if (signal) setSelectedSOS(signal);
      return;
    }

    const report = reports.find((entry) => entry.id === item.refId);
    if (report) setSelectedReport(report);
  }

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
    if (!window.confirm("Xóa địa điểm yêu thích này?")) {
      return;
    }

    setMessage("");
    const response = await fetch(`/api/favorite-locations/${id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    setMessage(payload.message ?? "Đã cập nhật địa điểm yêu thích.");
    await mutate();
  }

  async function retryOfflineSOSQueue() {
    setMessage("");

    if (!offlineSOSQueue.items.length) {
      setMessage("Không có SOS chờ gửi.");
      return;
    }

    if (!isOnline) {
      setMessage("Chưa có kết nối mạng. SOS sẽ tiếp tục được lưu tạm.");
      return;
    }

    setSyncingOfflineSOS(true);

    try {
      const result = await offlineSOSQueue.retryNow();
      await mutate();

      if (result.total === 0) {
        setMessage("Không có SOS chờ gửi.");
      } else if (result.synced === result.total) {
        setMessage("Đã gửi các SOS đang chờ.");
      } else if (result.synced > 0) {
        setMessage(
          result.errors[0]
            ? `Đã gửi ${result.synced}/${result.total} SOS. Lỗi còn lại: ${result.errors[0]}`
            : `Đã gửi ${result.synced}/${result.total} SOS. Một số tín hiệu vẫn đang chờ.`
        );
      } else {
        setMessage(result.errors[0] ?? "Chưa thể gửi SOS. Vui lòng thử lại.");
      }
    } finally {
      setSyncingOfflineSOS(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 text-slate-900 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-slate-950/35">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-900/80" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 text-slate-900 dark:text-white">
      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-100">
          {error.message}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-100">
          {message}
        </p>
      ) : null}

      <ProfileHeroCard
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatButton
          icon={<Siren aria-hidden className="h-5 w-5" />}
          label="SOS đã gửi"
          onClick={() => scrollToSection("recent-sos")}
          tone="blue"
          value={profile?.stats?.sosCount ?? sosHistory.length}
        />
        <StatButton
          icon={<WifiOff aria-hidden className="h-5 w-5" />}
          label="Chờ gửi"
          onClick={() => scrollToSection("recent-sos")}
          tone="amber"
          value={offlineSOSQueue.items.length}
        />
        <StatButton
          icon={<FileText aria-hidden className="h-5 w-5" />}
          label="Báo cáo"
          onClick={() => scrollToSection("reports")}
          tone="emerald"
          value={reports.length}
        />
        <StatButton
          icon={<Star aria-hidden className="h-5 w-5" />}
          label="Địa điểm đã lưu"
          onClick={() => scrollToSection("favorites")}
          tone="violet"
          value={profile?.stats?.favoriteCount ?? favorites.length}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] xl:items-start">
        <div className="space-y-6">
          <SafetyStatusCard
            isOnline={isOnline}
            offlineCount={offlineSOSQueue.items.length}
            onOpen={() => activeSOS && setSelectedSOS(activeSOS)}
            onOpenHistory={() => scrollToSection("recent-sos")}
            onOpenQueue={() => setShowOfflineQueueDetails(true)}
            onSyncOffline={() => void retryOfflineSOSQueue()}
            signal={activeSOS}
            syncingOffline={syncingOfflineSOS}
          />
          <div id="recent-sos">
            <SOSHistoryCard
              isRetrying={syncingOfflineSOS}
              onOpenSOS={setSelectedSOS}
              onRetryOffline={() => void retryOfflineSOSQueue()}
              queue={offlineSOSQueue}
              sosHistory={sosHistory}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div id="favorites">
            <FavoritesCard
              favorites={favorites}
              locationId={locationId}
              onDeleteFavorite={deleteFavorite}
              onSaveFavorite={addFavorite}
              onSelectLocation={setLocationId}
              savingFavorite={savingFavorite}
            />
          </div>

          <div id="notifications">
            <NotificationsCard items={notificationItems} onSelectItem={openNotificationItem} />
          </div>
        </aside>
      </div>

      <div id="reports">
        <ReportsCard onSelectReport={setSelectedReport} reports={reports} />
      </div>

      {selectedSOS ? (
        <SOSDetailModal onClose={() => setSelectedSOS(null)} signal={selectedSOS} />
      ) : null}
      {selectedReport ? (
        <ReportDetailModal onClose={() => setSelectedReport(null)} report={selectedReport} />
      ) : null}
      {showOfflineQueueDetails ? (
        <OfflineQueueDetailModal
          isRetrying={syncingOfflineSOS}
          onClose={() => setShowOfflineQueueDetails(false)}
          onRemove={(localId) => {
            if (window.confirm("Xóa SOS này khỏi hàng chờ?")) {
              offlineSOSQueue.remove(localId);
              setMessage("Đã xóa SOS khỏi hàng chờ.");
            }
          }}
          onRetry={() => void retryOfflineSOSQueue()}
          queue={offlineSOSQueue}
        />
      ) : null}
    </div>
  );
}

function StatButton({
  icon,
  label,
  onClick,
  tone,
  value
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone: "blue" | "emerald" | "violet" | "amber";
  value: number;
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20"
      : tone === "violet"
        ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20"
          : "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-sky-300 dark:ring-blue-400/20";

  return (
    <button
      className="group flex min-h-[104px] items-start justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-white/95 p-4 text-left shadow-lg shadow-slate-950/5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white active:scale-[0.99] dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-white/20"
      onClick={onClick}
      type="button"
    >
      <span>
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="mt-3 block text-3xl font-black leading-none text-slate-950 dark:text-white">
          {value}
        </span>
      </span>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${toneClass}`}>
        {icon}
      </span>
    </button>
  );
}

function SOSHistoryCard({
  isRetrying,
  onOpenSOS,
  onRetryOffline,
  queue,
  sosHistory
}: {
  isRetrying: boolean;
  onOpenSOS: (signal: SOSSignalDTO) => void;
  onRetryOffline: () => void;
  queue: ReturnType<typeof useOfflineSOSQueue>;
  sosHistory: SOSSignalDTO[];
}) {
  const [showAllSOS, setShowAllSOS] = useState(false);
  const visibleSOS = showAllSOS ? sosHistory : sosHistory.slice(0, 3);

  return (
    <DashboardCard
      action={<History aria-hidden className="h-5 w-5 text-sky-500 dark:text-sky-300" />}
      title="SOS gần đây"
    >
      {queue.items.length ? (
        <OfflineSOSQueueCard isRetrying={isRetrying} onRetry={onRetryOffline} queue={queue} />
      ) : null}
      <div className="grid gap-3">
        {visibleSOS.map((signal) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-sky-50/50 dark:border-white/10 dark:bg-slate-950/65 dark:hover:border-blue-400/30"
            key={signal.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                  {formatSOSNeeds(signal)}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  {formatDate(signal.createdAt)} ·{" "}
                  {signal.coordinates
                    ? `${signal.coordinates.latitude.toFixed(5)}, ${signal.coordinates.longitude.toFixed(5)}`
                    : "chưa có tọa độ"}
                </p>
                {signal.note ? (
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                    {signal.note}
                  </p>
                ) : null}
              </div>
              <StatusBadge tone={signal.status}>{SOS_STATUS_TEXT[signal.status]}</StatusBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="inline-flex h-9 items-center justify-center rounded-2xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800 dark:bg-white/10"
                onClick={() => onOpenSOS(signal)}
                type="button"
              >
                Xem chi tiết
              </button>
              {signal.coordinates ? (
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  href={`/map?lat=${signal.coordinates.latitude}&lng=${signal.coordinates.longitude}&type=sos&id=${signal.id}` as Route}
                >
                  Xem trên bản đồ
                </Link>
              ) : (
                <button
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-800 transition hover:bg-amber-100"
                  onClick={() => window.alert("Tín hiệu này chưa có tọa độ.")}
                  type="button"
                >
                  Chưa có tọa độ
                </button>
              )}
            </div>
          </article>
        ))}
        {sosHistory.length > 3 ? (
          <button
            className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-500 transition hover:bg-slate-100 dark:bg-slate-950/45 dark:text-slate-400"
            onClick={() => setShowAllSOS((current) => !current)}
            type="button"
          >
            {showAllSOS ? "Thu gọn" : "Xem tất cả"}
          </button>
        ) : null}
        {sosHistory.length === 0 ? (
          <EmptyState text="Chưa có tín hiệu SOS nào." />
        ) : null}
      </div>
    </DashboardCard>
  );
}

function OfflineSOSQueueCard({
  isRetrying,
  onRetry,
  queue
}: {
  isRetrying: boolean;
  onRetry: () => void;
  queue: ReturnType<typeof useOfflineSOSQueue>;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-slate-950">
          <WifiOff aria-hidden className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-amber-900 dark:text-amber-100">SOS chờ gửi</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-amber-800 dark:text-amber-100/80">
            {queue.items.length} tín hiệu đang lưu tạm trên thiết bị. Hệ thống sẽ tự gửi khi có mạng trở lại.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <button
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-3 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          disabled={isRetrying}
          onClick={onRetry}
          type="button"
        >
          {isRetrying ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
          {isRetrying ? "Đang gửi..." : "Gửi lại ngay"}
        </button>
      </div>
    </div>
  );
}

function ReportsCard({
  onSelectReport,
  reports
}: {
  onSelectReport: (report: ReportDTO) => void;
  reports: ReportDTO[];
}) {
  const [showAllReports, setShowAllReports] = useState(false);
  const visibleReports = showAllReports ? reports : reports.slice(0, 3);

  return (
    <DashboardCard
      action={<FileText aria-hidden className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />}
      title="Báo cáo thời tiết đã gửi"
    >
      <div className="grid gap-3">
        {visibleReports.map((report) => (
          <button
            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition duration-200 hover:border-emerald-200 hover:bg-emerald-50/50 active:scale-[0.99] dark:border-white/10 dark:bg-slate-950/65 dark:hover:border-emerald-400/30 dark:hover:bg-slate-950/80"
            key={report.id}
            onClick={() => onSelectReport(report)}
            type="button"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950 dark:text-white">
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
            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-200">
              {reportStatusLabel(report.status)}
            </span>
          </button>
        ))}
        {reports.length > 3 ? (
          <button
            className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-500 transition hover:bg-slate-100 dark:bg-slate-950/45 dark:text-slate-400"
            onClick={() => setShowAllReports((current) => !current)}
            type="button"
          >
            {showAllReports ? "Thu gọn" : "Xem tất cả"}
          </button>
        ) : null}
        {reports.length === 0 ? <EmptyState text="Bạn chưa gửi báo cáo nào." /> : null}
      </div>
    </DashboardCard>
  );
}

function FavoritesCard({
  favorites,
  locationId,
  onDeleteFavorite,
  onSaveFavorite,
  onSelectLocation,
  savingFavorite
}: {
  favorites: ProfileSummaryDTO["favorites"];
  locationId: string;
  onDeleteFavorite: (id: string) => Promise<void>;
  onSaveFavorite: () => Promise<void>;
  onSelectLocation: (id: string) => void;
  savingFavorite: boolean;
}) {
  return (
    <DashboardCard
      action={<Star aria-hidden className="h-5 w-5 text-violet-500 dark:text-violet-300" />}
      title="Địa điểm yêu thích"
    >
      <div className="grid gap-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
          <select
            className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
            onChange={(event) => onSelectLocation(event.target.value)}
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
            onClick={() => void onSaveFavorite()}
            type="button"
          >
            {savingFavorite ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : "Lưu địa điểm"}
          </button>
        </div>

        <div className="grid gap-3">
          {favorites.slice(0, 2).map((favorite) => (
            <article
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/65"
              key={favorite.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950 dark:text-white">{favorite.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  aria-label="Mở bản đồ"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-700 dark:text-sky-200"
                  href={`/map?lat=${favorite.latitude}&lng=${favorite.longitude}` as Route}
                >
                  <MapPin aria-hidden className="h-4 w-4" />
                </Link>
                <button
                  aria-label="Xóa địa điểm"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/15 text-red-700 dark:text-red-200"
                  onClick={() => void onDeleteFavorite(favorite.id)}
                  type="button"
                >
                  <Trash2 aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {favorites.length > 2 ? (
            <p className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-500 dark:bg-slate-950/45 dark:text-slate-400">
              Hiển thị 2 địa điểm gần nhất
            </p>
          ) : null}
          {favorites.length === 0 ? (
            <EmptyState text="Chưa có địa điểm yêu thích." />
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}

function NotificationsCard({
  items,
  onSelectItem
}: {
  items: DashboardNotification[];
  onSelectItem: (item: DashboardNotification) => void;
}) {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const visibleItems = showAllNotifications ? items : items.slice(0, 3);

  return (
    <DashboardCard
      action={<Bell aria-hidden className="h-5 w-5 text-amber-500 dark:text-amber-300" />}
      title="Thông báo của tôi"
    >
      <div className="grid gap-3">
        {visibleItems.map((item) => (
          <button
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-sky-50/70 dark:border-white/10 dark:bg-slate-950/65 dark:hover:border-blue-400/30"
            key={item.id}
            onClick={() => onSelectItem(item)}
            type="button"
          >
            <p className="text-sm font-black text-slate-950 dark:text-white">{item.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              {item.message}
            </p>
            <p className="mt-2 text-[11px] font-bold text-slate-500">
              {formatDate(item.time)}
            </p>
          </button>
        ))}
        {items.length > 3 ? (
          <button
            className="rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-500 transition hover:bg-slate-100 dark:bg-slate-950/45 dark:text-slate-400"
            onClick={() => setShowAllNotifications((current) => !current)}
            type="button"
          >
            {showAllNotifications ? "Thu gọn" : "Xem tất cả"}
          </button>
        ) : null}
        {items.length === 0 ? <EmptyState text="Không có thông báo mới." /> : null}
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
    <section className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-slate-950/25">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-950 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProfileHeroCard({
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
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-slate-950/25 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
              className="h-20 w-20 shrink-0 rounded-3xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
            src={avatar}
          />
        ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-blue-50 text-blue-700 ring-1 ring-slate-200 dark:bg-blue-500/20 dark:text-sky-200 dark:ring-white/10">
              <UserRound aria-hidden className="h-8 w-8" />
          </div>
        )}
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-sky-300">
              Hồ sơ cá nhân
            </p>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-950 dark:text-white">
              {displayName}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
            {displayEmail || "--"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone={displayRole}>{ROLE_LABELS[displayRole]}</StatusBadge>
            {profile?.user.phone ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-300">
                {profile.user.phone}
              </span>
            ) : null}
          </div>
        </div>
      </div>

        <div className="grid gap-2 sm:grid-cols-2 md:min-w-[260px]">
          <button
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white transition duration-200 hover:brightness-105 active:scale-[0.98]"
            onClick={onToggleEdit}
            type="button"
          >
            {isEditing ? "Ẩn chỉnh sửa" : "Chỉnh sửa hồ sơ"}
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition duration-200 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            href="/map"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            Mở bản đồ
          </Link>
        </div>
      </div>

      {isEditing ? (
        <form
          className="mt-5 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/45 sm:grid-cols-2"
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
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
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
    </section>
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
        className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function SafetyStatusCard({
  isOnline,
  offlineCount,
  onOpen,
  onOpenHistory,
  onOpenQueue,
  onSyncOffline,
  signal,
  syncingOffline
}: {
  isOnline: boolean;
  offlineCount: number;
  onOpen: () => void;
  onOpenHistory: () => void;
  onOpenQueue: () => void;
  onSyncOffline: () => void;
  signal: SOSSignalDTO | null;
  syncingOffline: boolean;
}) {
  const active = Boolean(signal);
  const activeSignal = signal;
  const hasOfflineQueue = !active && offlineCount > 0;
  const title = active
    ? "Đang theo dõi SOS"
    : hasOfflineQueue
      ? "Có SOS chờ gửi"
      : "Bạn đang an toàn";
  const description = activeSignal
    ? `${SOS_STATUS_TEXT[activeSignal.status]} · ${formatDate(activeSignal.createdAt)}`
    : hasOfflineQueue
      ? `${offlineCount} tín hiệu đang lưu tạm trên thiết bị.`
      : "Không có yêu cầu SOS đang theo dõi.";

  return (
    <section
      className={`flex min-h-[180px] flex-col justify-between rounded-[24px] border bg-white/90 p-5 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/25 ${
        active || hasOfflineQueue
          ? "border-amber-200 dark:border-amber-400/20 dark:bg-amber-500/15"
          : "border-emerald-200 dark:border-emerald-400/20 dark:bg-emerald-500/15"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
              active || hasOfflineQueue ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-white"
            }`}
          >
            {active || hasOfflineQueue ? (
              <Siren aria-hidden className="h-5 w-5" />
            ) : (
              <ShieldCheck aria-hidden className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              Trạng thái an toàn
            </p>
            <h2 className="mt-2 text-lg font-black leading-tight text-slate-950 dark:text-white sm:text-xl">
              {title}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge tone={activeSignal?.status ?? (hasOfflineQueue ? "PENDING" : "emerald")}>
            {activeSignal ? SOS_STATUS_TEXT[activeSignal.status] : hasOfflineQueue ? "Chờ gửi" : "An toàn"}
          </StatusBadge>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {activeSignal ? (
          <button
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 text-sm font-black text-white sm:col-span-2"
            onClick={onOpen}
            type="button"
          >
            Xem chi tiết cứu hộ
          </button>
        ) : hasOfflineQueue ? (
          <>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              disabled={!isOnline || syncingOffline}
              onClick={onSyncOffline}
              type="button"
            >
              {syncingOffline ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
              {syncingOffline ? "Đang gửi..." : isOnline ? "Gửi lại ngay" : "Chờ có mạng"}
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-800 transition hover:bg-amber-50 dark:border-white/10 dark:bg-white/10 dark:text-amber-100"
              onClick={onOpenQueue}
              type="button"
            >
              Xem chi tiết
            </button>
          </>
        ) : (
          <button
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-black text-white sm:col-span-2"
            onClick={onOpenHistory}
            type="button"
          >
            Xem lịch sử SOS
          </button>
        )}
        </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:bg-slate-950/35 dark:text-slate-400">
      {text}
    </div>
  );
}

function OfflineQueueDetailModal({
  isRetrying,
  onClose,
  onRemove,
  onRetry,
  queue
}: {
  isRetrying: boolean;
  onClose: () => void;
  onRemove: (localId: string) => void;
  onRetry: () => void;
  queue: ReturnType<typeof useOfflineSOSQueue>;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/68 p-4 backdrop-blur-sm">
      <section className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-600">
              SOS chờ gửi
            </p>
            <h2 className="mt-2 text-2xl font-black">Hàng chờ offline</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {queue.items.length} tín hiệu đang lưu tạm trên thiết bị.
            </p>
          </div>
          <button
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-white"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {queue.items.map((item) => {
            const latitude = item.latitude ?? item.lat ?? item.coordinates?.latitude ?? item.coordinates?.lat;
            const longitude = item.longitude ?? item.lng ?? item.coordinates?.longitude ?? item.coordinates?.lng;
            const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
            const needs = item.needs?.length ? item.needs.map((need) => SOS_NEED_TEXT[need]).join(", ") : "Khác";

            return (
              <article
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-50"
                key={item.localId}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{needs}</p>
                    <p className="mt-1 text-xs font-bold opacity-80">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-black text-amber-800 dark:bg-white/10 dark:text-amber-100">
                    {hasCoordinates ? "Có GPS" : "Thiếu GPS"}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6">
                  {item.note || item.description || "Chưa có mô tả bổ sung."}
                </p>
                <p className="mt-2 text-xs font-bold opacity-80">
                  {item.addressText || item.locationText || item.address || "Chưa có mô tả vị trí."}
                </p>
                <p className="mt-2 text-xs font-bold opacity-80">
                  {hasCoordinates ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}` : "Tọa độ: chưa xác định"}
                </p>
                {item.lastError ? (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    Lỗi gần nhất: {item.lastError}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-3 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={isRetrying}
                    onClick={onRetry}
                    type="button"
                  >
                    {isRetrying ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
                    {isRetrying ? "Đang gửi..." : "Gửi lại"}
                  </button>
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-2xl border border-red-200 bg-white px-3 text-xs font-black text-red-700"
                    onClick={() => onRemove(item.localId)}
                    type="button"
                  >
                    Xóa khỏi hàng chờ
                  </button>
                </div>
              </article>
            );
          })}
          {queue.items.length === 0 ? <EmptyState text="Không còn SOS nào trong hàng chờ." /> : null}
        </div>
      </section>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-slate-100">{value}</p>
    </div>
  );
}
