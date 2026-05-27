import { getServerSession } from "next-auth";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { authOptions } from "@/lib/auth/options";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (session?.user) {
    redirect(((params.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/dashboard") as Route));
  }

  return <LoginForm callbackUrl={params.callbackUrl ?? "/dashboard"} initialError={params.error} />;
}
