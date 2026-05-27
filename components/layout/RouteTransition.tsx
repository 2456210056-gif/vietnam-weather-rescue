import type { ReactNode } from "react";

type RouteTransitionProps = {
  children: ReactNode;
};

export function RouteTransition({ children }: RouteTransitionProps) {
  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
