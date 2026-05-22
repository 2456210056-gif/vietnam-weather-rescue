import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { FloatingActionRail } from "@/components/ui/FloatingActionRail";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34rem),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.12),transparent_32rem),linear-gradient(180deg,#eff6ff,#f8fafc_46%,#ecfdf5)] text-slate-950">
      <Navigation />
      <div className="min-h-screen md:pl-72">
        <Header />
        <RouteTransition>{children}</RouteTransition>
        <Footer />
      </div>
      <FloatingActionRail />
    </div>
  );
}
