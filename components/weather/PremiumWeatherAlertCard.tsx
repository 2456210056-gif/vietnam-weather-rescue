"use client";

import { motion } from "framer-motion";
import { CloudRain, TriangleAlert } from "lucide-react";

type PremiumWeatherAlertCardProps = {
  title: string;
  message: string;
  riskPercent?: number;
  severity?: "low" | "medium" | "high";
};

export function PremiumWeatherAlertCard({
  title,
  message,
  riskPercent,
  severity = "low"
}: PremiumWeatherAlertCardProps) {
  const Icon = severity === "high" ? TriangleAlert : CloudRain;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 rounded-[34px] border border-white/10 bg-blue-950/35 p-5 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-black">
            <Icon aria-hidden className={severity === "high" ? "h-5 w-5 text-orange-300" : "h-5 w-5"} />
            {title}
          </p>
          <p className="mt-4 max-w-[28rem] text-base font-black leading-7 text-white md:text-lg">
            {message}
          </p>
        </div>
        {riskPercent !== undefined ? (
          <p className="shrink-0 text-3xl font-black md:text-4xl">{riskPercent}%</p>
        ) : null}
      </div>
      <div className="mt-5 flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-white" : "bg-white/25"}`}
            key={index}
          />
        ))}
      </div>
    </motion.section>
  );
}
