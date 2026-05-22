import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ProfileAliasPage() {
  redirect("/dashboard" as Route);
}
