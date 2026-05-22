import { getServerSession } from "next-auth";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login" as Route);
  }

  return (
    <div className="space-y-5">
      <WeatherDashboard />
      <ProfileDashboard user={session.user} />
    </div>
  );
}
