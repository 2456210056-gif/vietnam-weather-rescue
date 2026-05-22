"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type RouteTransitionProps = {
  children: React.ReactNode;
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        animate={{ opacity: 1, y: 0 }}
        className="gpu-transition mx-auto min-h-[calc(100vh-8rem)] w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6"
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
