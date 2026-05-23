import { AuthStatus } from "@/components/layout/AuthStatus";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm shadow-blue-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            Vietnam Disaster Rescue
          </p>
          <h1 className="text-base font-black text-slate-950 sm:text-lg">
            Thời tiết, cảnh báo & cứu hộ
          </h1>
        </div>
        <AuthStatus />
      </div>
    </header>
  );
}
