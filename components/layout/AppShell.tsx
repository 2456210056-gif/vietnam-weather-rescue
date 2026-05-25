"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { SosRealtimeNotifier } from "@/components/sos/SosRealtimeNotifier";
import { FloatingActionRail } from "@/components/ui/FloatingActionRail";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34rem),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.12),transparent_32rem),linear-gradient(180deg,#eff6ff,#f8fafc_46%,#ecfdf5)] text-slate-950 transition-colors duration-200 dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34rem),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.14),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#052e2b)] dark:text-slate-100">
      <Navigation
        mobileOpen={mobileDrawerOpen}
        onMobileOpenChange={setMobileDrawerOpen}
      />
      <div className="min-h-screen lg:pl-72">
        <Header onOpenMobileNav={() => setMobileDrawerOpen(true)} />
        <RouteTransition>{children}</RouteTransition>
        <Footer />
      </div>
      <FloatingActionRail />
      <SosRealtimeNotifier />
    </div>
  );
}
