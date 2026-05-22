"use client";

import {
  Heart,
  History,
  Loader2,
  MapPin,
  Save,
  Trash2,
  UserRound
} from "lucide-react";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { DEFAULT_WEATHER_LOCATIONS } from "@/lib/weather/locations";
import {
  SOS_NEED_LABELS,
  SOS_STATUS_LABELS,
  type SOSSignalDTO
} from "@/types/sos";
import type { ProfileSummaryDTO } from "@/types/profile";
import type { UserRole } from "@/types/roles";

type ProfileResponse = {
  profile: ProfileSummaryDTO;
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

async function fetcher<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Không thể tải dữ liệu hồ sơ.");
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
  return signal.needs.map((need) => SOS_NEED_LABELS[need]).join(", ");
}

export function ProfileDashboard({ user }: ProfileDashboardProps) {
  const [locationId, setLocationId] = useState(DEFAULT_WEATHER_LOCATIONS[0].id);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher<ProfileResponse>,
    {
      revalidateOnFocus: true
    }
  );

  const profile = data?.profile;
  const displayName =
    profile?.user.fullName ??
    profile?.user.name ??
    user.name ??
    user.email ??
    "Người dùng";
  const displayEmail = profile?.user.email ?? user.email ?? "";
  const displayRole = profile?.user.role ?? user.role;

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
        body: JSON.stringify({
          locationId
        })
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

    const response = await fetch(`/api/favorite-locations/${id}`, {
      method: "DELETE"
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    setMessage(payload.message ?? "Đã cập nhật địa điểm yêu thích.");
    await mutate();
  }

  return (
    <div className="space-y-5">
      <section className="theme-glass rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <UserRound aria-hidden className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Hồ sơ
            </p>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-950">
              {displayName}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard label="Vai trò" value={ROLE_LABELS[displayRole]} />
          <StatCard label="Địa điểm" value={profile?.stats.favoriteCount ?? 0} />
          <StatCard label="SOS" value={profile?.stats.sosCount ?? 0} />
        </div>
      </section>

      <section className="theme-glass rounded-2xl p-4">
        <h3 className="text-lg font-black text-slate-950">Thông tin cá nhân</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Cập nhật họ tên, số điện thoại và avatar để phục vụ điều phối cứu hộ.
        </p>

        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={updateProfile}>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Họ tên</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              defaultValue={profile?.user.fullName ?? profile?.user.name ?? user.name ?? ""}
              name="fullName"
              placeholder="Nguyễn Văn A"
              type="text"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Số điện thoại</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              defaultValue={profile?.user.phone ?? ""}
              name="phone"
              placeholder="090..."
              type="tel"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-slate-800">Avatar URL</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              defaultValue={profile?.user.avatar ?? profile?.user.image ?? user.image ?? ""}
              name="avatar"
              placeholder="https://..."
              type="url"
            />
          </label>
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400 sm:col-span-2"
            disabled={savingProfile}
            type="submit"
          >
            {savingProfile ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Save aria-hidden className="h-4 w-4" />
            )}
            Lưu hồ sơ
          </button>
        </form>
      </section>

      <section className="theme-glass rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-950">Địa điểm yêu thích</h3>
            <p className="text-sm font-semibold text-slate-500">
              Lưu các khu vực cần theo dõi thường xuyên.
            </p>
          </div>
          <Heart aria-hidden className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400"
            disabled={savingFavorite}
            onClick={() => void addFavorite()}
            type="button"
          >
            {savingFavorite ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
            Lưu địa điểm
          </button>
        </div>

        {message ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error.message}
          </p>
        ) : null}

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile?.favorites.map((favorite) => (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={favorite.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{favorite.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {favorite.province ?? "Việt Nam"}
                    </p>
                  </div>
                  <button
                    aria-label="Xóa địa điểm"
                    className="rounded-full bg-white p-2 text-slate-500 shadow-sm"
                    onClick={() => void deleteFavorite(favorite.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <MapPin aria-hidden className="h-4 w-4 text-blue-600" />
                  {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                </p>
              </article>
            ))}
            {profile?.favorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm font-bold text-slate-500 sm:col-span-2 lg:col-span-3">
                Chưa có địa điểm yêu thích.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="theme-glass rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-950">Lịch sử SOS</h3>
            <p className="text-sm font-semibold text-slate-500">
              Các tín hiệu đã phát từ tài khoản này.
            </p>
          </div>
          <History aria-hidden className="h-6 w-6 text-blue-600" />
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {profile?.sosHistory.map((signal) => (
              <article className="rounded-2xl border border-slate-200 p-4" key={signal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{formatSOSNeeds(signal)}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {formatDate(signal.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      signal.status === "REACHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {SOS_STATUS_LABELS[signal.status]}
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">
                  {signal.coordinates.latitude.toFixed(5)},{" "}
                  {signal.coordinates.longitude.toFixed(5)}
                </p>
              </article>
            ))}
            {profile?.sosHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm font-bold text-slate-500 sm:col-span-2">
                Chưa có lịch sử SOS.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="theme-glass rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          Bản quyền đồ án
        </p>
        <p className="mt-2 text-base font-black text-slate-950">
          © Thiết kế bởi nhóm DongVan - 2026
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" key={index} />
      ))}
    </div>
  );
}
