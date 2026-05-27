import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { authOptions } from "@/lib/auth/options";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard" as Route);
  }

  return <RegisterForm />;
}
