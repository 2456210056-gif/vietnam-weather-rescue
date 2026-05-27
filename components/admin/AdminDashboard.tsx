"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Crown,
  FileText,
  ShieldCheck,
  UserCog,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ReportDetailModal } from "@/components/reports/ReportDetailModal";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SOSDetailModal } from "@/components/sos/SOSDetailModal";
import {
  REPORT_SEVERITY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type WeatherReportDTO
} from "@/types/report";
import type { UserRole } from "@/types/roles";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO } from "@/types/sos";

type AdminUser = {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
};

type AdminSummary = {
  stats: {
    totalUsers: number;
    totalSOS: number;
    pendingSOS: number;
    resolvedSOS: number;
  };
  users: AdminUser[];
  sosSignals: SOSSignalDTO[];
};

type ReportsResponse = {
  reports: WeatherReportDTO[];
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  rescuer: "Rescuer",
  user: "User"
};

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu quản trị.");
  }

  return payload;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function getRoleCounts(users: AdminUser[]) {
  return users.reduce(
    (acc, user) => {
      acc[user.role] += 1;
      return acc;
    },
    { admin: 0, rescuer: 0, user: 0 } satisfies Record<UserRole, number>
  );
}

export function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [confirmUserAction, setConfirmUserAction] = useState<{
    action: "deactivate" | "reactivate" | "delete";
    user: AdminUser;
  } | null>(null);
  const [selectedSOS, setSelectedSOS] = useState<SOSSignalDTO | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedReport, setSelectedReport] = useState<WeatherReportDTO | null>(null);
  const [updatingReportId, setUpdatingReportId] = useState("");
  const { data, error, isLoading, mutate } = useSWR<AdminSummary>(
    "/api/admin/summary",
    fetcher<AdminSummary>,
    {
      refreshInterval: 20_000
    }
  );
  const {
    data: reportsData,
    mutate: mutateReports
  } = useSWR<ReportsResponse>("/api/reports?scope=all&limit=20", fetcher<ReportsResponse>, {
    refreshInterval: 30_000
  });

  const roleCounts = useMemo(() => getRoleCounts(data?.users ?? []), [data?.users]);
  const totalUsers = data?.stats.totalUsers ?? 0;
  const recentSOS = data?.sosSignals.slice(0, 3) ?? [];
  const reports = reportsData?.reports ?? [];

  async function updateRole(user: AdminUser, role: UserRole) {
    setUpdatingUserId(user.id);
    setMessage("");

    const response = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role })
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    setUpdatingUserId("");
    setMessage(payload.message ?? "Đã cập nhật vai trò.");
    await mutate();
  }

  async function updateUserStatus(user: AdminUser, action: "deactivate" | "reactivate" | "delete") {
    setUpdatingUserId(user.id);
    setMessage("");

    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action })
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    setUpdatingUserId("");
    setConfirmUserAction(null);
    setMessage(payload.message ?? "Đã cập nhật trạng thái tài khoản.");
    await mutate();
  }

  async function updateReportStatus(report: WeatherReportDTO, status: WeatherReportDTO["status"]) {
    setUpdatingReportId(report.id);
    setMessage("");

    const response = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
      report?: WeatherReportDTO;
    };

    setUpdatingReportId("");
    setMessage(payload.message ?? "Đã cập nhật báo cáo.");
    if (payload.report) setSelectedReport(payload.report);
    await mutateReports();
  }

  return (
    <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-5 text-slate-900 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-slate-950/35 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-slate-950/30 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white lg:text-3xl">
            Quản trị hệ thống cứu hộ
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
            Theo dõi người dùng, quyền truy cập và tín hiệu SOS toàn hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Realtime SOS
          </span>
          <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-blue-700 dark:text-sky-200">
            MongoDB
          </span>
        </div>
      </div>

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

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900/80" key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <KpiCard
              description="Tất cả tài khoản"
              icon={<UsersRound aria-hidden className="h-6 w-6" />}
              title="Tổng người dùng"
              value={totalUsers}
              variant="blue"
            />
            <KpiCard
              description="Quản trị viên"
              icon={<Crown aria-hidden className="h-6 w-6" />}
              title="Admin"
              value={roleCounts.admin}
              variant="blue"
            />
            <KpiCard
              description="Đội cứu hộ"
              icon={<ShieldCheck aria-hidden className="h-6 w-6" />}
              title="Rescuer"
              value={roleCounts.rescuer}
              variant="emerald"
            />
            <KpiCard
              description="Tài khoản thường"
              icon={<UserCog aria-hidden className="h-6 w-6" />}
              title="User"
              value={roleCounts.user}
              variant="slate"
            />
            <KpiCard
              description="Cần xử lý"
              icon={<AlertTriangle aria-hidden className="h-6 w-6" />}
              title="SOS pending"
              value={data?.stats.pendingSOS ?? 0}
              variant="red"
            />
            <KpiCard
              description="Đã đóng ca"
              icon={<CheckCircle2 aria-hidden className="h-6 w-6" />}
              title="Đã xử lý"
              value={data?.stats.resolvedSOS ?? 0}
              variant="emerald"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            <DashboardSection
              className="xl:col-span-8"
              description="Quản lý vai trò và thông tin tài khoản."
              eyebrow="User management"
              title="Danh sách người dùng"
            >
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/45">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950/70 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-4">Người dùng</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Điện thoại</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-4 py-4">Trạng thái</th>
                      <th className="px-4 py-4">Cập nhật</th>
                      <th className="px-4 py-4">Quản lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-white/10 dark:bg-slate-900/45">
                    {data?.users.map((user) => (
                      <tr className="transition hover:bg-sky-50/70 dark:hover:bg-white/[0.04]" key={user.id}>
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-950 dark:text-white">
                            {user.fullName ?? "Chưa cập nhật"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {formatTime(user.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{user.email}</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.phone ?? "--"}</td>
                        <td className="px-4 py-4">
                          <StatusBadge tone={user.role}>{ROLE_LABELS[user.role]}</StatusBadge>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge tone={user.isActive ? "emerald" : "amber"}>
                            {user.isActive ? "Active" : "Disabled"}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none transition focus:border-blue-400 disabled:opacity-50 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                            disabled={updatingUserId === user.id}
                            onChange={(event) =>
                              void updateRole(user, event.target.value as UserRole)
                            }
                            value={user.role}
                          >
                            <option value="user">user</option>
                            <option value="rescuer">rescuer</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-sky-100 dark:hover:bg-blue-500/25"
                              onClick={() => setSelectedUser(user)}
                              type="button"
                            >
                              Chi tiết
                            </button>
                            <button
                              className={`rounded-2xl px-3 py-2 text-xs font-black transition ${
                                user.isActive
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-100 dark:hover:bg-amber-500/25"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-100 dark:hover:bg-emerald-500/25"
                              }`}
                              disabled={updatingUserId === user.id}
                              onClick={() =>
                                setConfirmUserAction({
                                  action: user.isActive ? "deactivate" : "reactivate",
                                  user
                                })
                              }
                              type="button"
                            >
                              {user.isActive ? "Khóa" : "Mở khóa"}
                            </button>
                            <button
                              className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-100 dark:hover:bg-red-500/25"
                              disabled={updatingUserId === user.id}
                              onClick={() => setConfirmUserAction({ action: "delete", user })}
                              type="button"
                            >
                              Xóa mềm
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardSection>

            <div className="space-y-6 xl:col-span-4">
              <DashboardSection eyebrow="Role summary" title="Cơ cấu quyền">
                <div className="space-y-4">
                  {(["admin", "rescuer", "user"] as const).map((role) => {
                    const value = roleCounts[role];
                    const percent = totalUsers ? Math.round((value / totalUsers) * 100) : 0;

                    return (
                      <div key={role}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <StatusBadge tone={role}>{ROLE_LABELS[role]}</StatusBadge>
                          <span className="font-black text-slate-950 dark:text-white">{value}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardSection>

              <DashboardSection eyebrow="Activity" title="SOS gần đây">
                <div className="space-y-3">
                  {recentSOS.map((signal) => (
                    <ActivityCard
                      description={signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ")}
                      key={signal.id}
                      meta={
                        <>
                          {signal.coordinates
                            ? `${signal.coordinates.latitude.toFixed(5)}, ${signal.coordinates.longitude.toFixed(5)}`
                            : "Chưa có tọa độ"}
                        </>
                      }
                      onClick={() => setSelectedSOS(signal)}
                      status={signal.status}
                      statusLabel={SOS_STATUS_LABELS[signal.status]}
                      subtitle={formatTime(signal.createdAt)}
                      title={signal.reporterName ?? "Người dùng SOS"}
                      tone={signal.status === "PENDING" ? "danger" : "default"}
                    />
                  ))}
                  {recentSOS.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-white/15 dark:bg-slate-950/35">
                      <Activity aria-hidden className="mx-auto h-7 w-7 text-slate-500" />
                      <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        Chưa có hoạt động SOS mới.
                      </p>
                    </div>
                  ) : null}
                </div>
              </DashboardSection>
            </div>
          </div>

          <DashboardSection
            action={<FileText aria-hidden className="h-5 w-5 text-blue-600" />}
            description="Báo cáo từ người dân gửi qua trang liên hệ, kèm trạng thái kiểm duyệt."
            eyebrow="Reports"
            title="Báo cáo thời tiết & sự cố"
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {reports.slice(0, 6).map((report) => (
                <button
                  className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-sky-50/70 dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-blue-400/30"
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950 dark:text-white">
                        {REPORT_TYPE_LABELS[report.type] ?? report.type} · {report.area}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {report.description}
                      </p>
                    </div>
                    <StatusBadge tone={report.status === "REJECTED" ? "red" : report.status === "RESOLVED" ? "emerald" : "amber"}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {REPORT_SEVERITY_LABELS[report.severity]}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {formatTime(report.createdAt)}
                    </span>
                    {typeof report.latitude === "number" && typeof report.longitude === "number" ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-500/15 dark:text-sky-200">
                        Có GIS
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
              {reports.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:bg-slate-950/35 dark:text-slate-400 lg:col-span-2">
                  Chưa có báo cáo nào.
                </div>
              ) : null}
            </div>
          </DashboardSection>
        </div>
      )}
      {confirmUserAction ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-[32px] border border-white/15 bg-slate-950 p-5 text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
              Xác nhận quản lý tài khoản
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {confirmUserAction.action === "reactivate"
                ? "Mở khóa tài khoản?"
                : confirmUserAction.action === "delete"
                  ? "Xóa mềm tài khoản?"
                  : "Vô hiệu hóa tài khoản?"}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
              Tài khoản:{" "}
              <span className="font-black text-white">
                {confirmUserAction.user.fullName ?? confirmUserAction.user.email}
              </span>
              . Dữ liệu lịch sử SOS và báo cáo vẫn được giữ để phục vụ kiểm tra.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-white transition duration-200 hover:bg-white/10 active:scale-[0.98]"
                onClick={() => setConfirmUserAction(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className={`h-12 rounded-2xl text-sm font-black text-white transition duration-200 active:scale-[0.98] ${
                  confirmUserAction.action === "reactivate"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
                disabled={updatingUserId === confirmUserAction.user.id}
                onClick={() =>
                  void updateUserStatus(confirmUserAction.user, confirmUserAction.action)
                }
                type="button"
              >
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {selectedSOS ? (
        <SOSDetailModal
          canManage
          onClose={() => setSelectedSOS(null)}
          onUpdateStatus={(status) => {
            void fetch(`/api/sos/${selectedSOS.id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status })
            }).then(() => mutate());
          }}
          signal={selectedSOS}
        />
      ) : null}
      {selectedUser ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-[32px] border border-white/15 bg-slate-950 p-5 text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              Chi tiết tài khoản
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {selectedUser.fullName ?? selectedUser.email}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <UserDetail label="Email" value={selectedUser.email} />
              <UserDetail label="Điện thoại" value={selectedUser.phone ?? "--"} />
              <UserDetail label="Role" value={ROLE_LABELS[selectedUser.role]} />
              <UserDetail label="Trạng thái" value={selectedUser.isActive ? "Active" : "Disabled"} />
              <UserDetail label="Ngày tạo" value={formatTime(selectedUser.createdAt)} />
              <UserDetail label="Deleted at" value={selectedUser.deletedAt ? formatTime(selectedUser.deletedAt) : "--"} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-white transition duration-200 hover:bg-white/10 active:scale-[0.98]"
                onClick={() => setSelectedUser(null)}
                type="button"
              >
                Đóng
              </button>
              <button
                className="h-12 rounded-2xl bg-red-600 text-sm font-black text-white transition duration-200 hover:bg-red-500 active:scale-[0.98]"
                onClick={() => {
                  setConfirmUserAction({
                    action: selectedUser.isActive ? "deactivate" : "reactivate",
                    user: selectedUser
                  });
                  setSelectedUser(null);
                }}
                type="button"
              >
                {selectedUser.isActive ? "Vô hiệu hóa" : "Mở khóa"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {selectedReport ? (
        <ReportDetailModal
          canManage
          isUpdating={updatingReportId === selectedReport.id}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={(status) => void updateReportStatus(selectedReport, status)}
          report={selectedReport}
        />
      ) : null}
    </div>
  );
}

function UserDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-black text-white">{value}</p>
    </div>
  );
}
