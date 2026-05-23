"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SlidingAuthCardProps = {
  children: ReactNode;
  mode: "login" | "register";
};

export function SlidingAuthCard({ children, mode }: SlidingAuthCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="relative z-10 flex min-h-[520px] w-full items-center justify-center bg-white/90 p-6 text-slate-950 sm:p-8 lg:min-h-[560px] lg:p-10"
      initial={{ opacity: 0, x: mode === "login" ? 24 : -24, scale: 0.99 }}
      key={mode}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="mx-auto w-full max-w-md">{children}</div>
    </motion.section>
  );
}
