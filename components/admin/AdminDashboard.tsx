"use client";

import { ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import type { UserRole } from "@/types/roles";
import { SOS_NEED_LABELS, SOS_STATUS_LABELS, type SOSSignalDTO } from "@/types/sos";

type AdminUser = {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
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

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu quản trị.");
  }

  return payload;
}

function roleTone(role: UserRole) {
  if (role === "admin") return "bg-blue-50 text-blue-700";
  if (role === "rescuer") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const { data, error, isLoading, mutate } = useSWR<AdminSummary>(
    "/api/admin/summary",
    fetcher<AdminSummary>,
    {
      refreshInterval: 20_000
    }
  );

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

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-slate-950 p-6 text-white shadow-2xl lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
          Admin dashboard
        </p>
        <h2 className="mt-2 text-3xl font-black lg:text-4xl">Quản trị hệ thống cứu hộ</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Quản lý người dùng, vai trò cứu hộ và tín hiệu SOS toàn hệ thống.
        </p>
      </section>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error.message}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[28px] bg-white/80" key={index} />
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Tổng user" value={data?.stats.totalUsers ?? 0} />
            <StatCard label="Tổng SOS" value={data?.stats.totalSOS ?? 0} />
            <StatCard label="Đang chờ" value={data?.stats.pendingSOS ?? 0} />
            <StatCard label="Đã xử lý" value={data?.stats.resolvedSOS ?? 0} />
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2">
              <UsersRound aria-hidden className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-950">Người dùng</h3>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Họ tên</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Điện thoại</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Đổi role</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((user) => (
                    <tr className="border-t border-slate-100" key={user.id}>
                      <td className="px-3 py-3 font-bold text-slate-950">
                        {user.fullName ?? "Chưa cập nhật"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{user.email}</td>
                      <td className="px-3 py-3 text-slate-600">{user.phone ?? "--"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${roleTone(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold"
                          disabled={updatingUserId === user.id}
                          onChange={(event) => void updateRole(user, event.target.value as UserRole)}
                          value={user.role}
                        >
                          <option value="user">user</option>
                          <option value="rescuer">rescuer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {data?.sosSignals.slice(0, 12).map((signal) => (
              <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]" key={signal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">
                      {signal.reporterName ?? "Người dùng SOS"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {signal.coordinates.latitude.toFixed(5)}, {signal.coordinates.longitude.toFixed(5)}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                    {SOS_STATUS_LABELS[signal.status]}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">
                  {signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ")}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <ShieldCheck aria-hidden className="h-4 w-4 text-blue-600" />
                  Mã SOS: {signal.id.slice(-6).toUpperCase()}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
