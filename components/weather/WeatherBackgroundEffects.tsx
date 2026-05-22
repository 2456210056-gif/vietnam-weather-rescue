"use client";

import type { WeatherCondition } from "@/lib/weather/weather-condition";

type WeatherBackgroundEffectsProps = {
  condition: WeatherCondition;
  intensity?: "low" | "medium" | "high";
};

const RAIN_COUNT_BY_INTENSITY = {
  low: 28,
  medium: 42,
  high: 58
} as const;

const stars = Array.from({ length: 24 }, (_, index) => ({
  id: `star-${index}`,
  left: `${(index * 37) % 96}%`,
  top: `${8 + ((index * 19) % 58)}%`,
  delay: `${(index % 7) * 0.45}s`,
  size: `${2 + (index % 3)}px`
}));

const rainDrops = Array.from({ length: 58 }, (_, index) => ({
  id: `rain-${index}`,
  left: `${(index * 17) % 100}%`,
  delay: `${(index % 12) * 0.12}s`,
  duration: `${0.72 + (index % 9) * 0.04}s`,
  opacity: 0.24 + (index % 5) * 0.08
}));

export function WeatherBackgroundEffects({
  condition,
  intensity = "medium"
}: WeatherBackgroundEffectsProps) {
  const rainCount = RAIN_COUNT_BY_INTENSITY[intensity];

  return (
    <div
      aria-hidden
      className="weather-animated pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className={`absolute inset-0 ${getGradientClass(condition)}`} />

      {condition === "clear" ? <SunnyEffects /> : null}
      {condition === "clouds" ? <CloudEffects /> : null}
      {condition === "rain" || condition === "drizzle" ? (
        <>
          <CloudEffects dense />
          <RainEffects count={condition === "drizzle" ? Math.min(30, rainCount) : rainCount} />
        </>
      ) : null}
      {condition === "thunderstorm" ? (
        <>
          <CloudEffects dense />
          <RainEffects count={Math.min(50, rainCount)} />
          <div className="weather-lightning absolute inset-0 bg-white/35" />
        </>
      ) : null}
      {condition === "mist" || condition === "fog" ? <FogEffects /> : null}
      {condition === "night" ? <NightEffects /> : null}
      {condition === "unknown" ? <UnknownGlow /> : null}
    </div>
  );
}

function getGradientClass(condition: WeatherCondition) {
  switch (condition) {
    case "clear":
      return "weather-gradient bg-[linear-gradient(135deg,#38bdf8_0%,#60a5fa_46%,#fde68a_100%)]";
    case "clouds":
      return "weather-gradient bg-[linear-gradient(135deg,#64748b_0%,#93c5fd_54%,#e0f2fe_100%)]";
    case "rain":
    case "drizzle":
      return "weather-gradient bg-[linear-gradient(135deg,#0f172a_0%,#334155_48%,#64748b_100%)]";
    case "thunderstorm":
      return "weather-gradient bg-[linear-gradient(135deg,#020617_0%,#1e293b_55%,#334155_100%)]";
    case "mist":
    case "fog":
      return "weather-gradient bg-[linear-gradient(135deg,#475569_0%,#94a3b8_48%,#e2e8f0_100%)]";
    case "night":
      return "weather-gradient bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#312e81_100%)]";
    default:
      return "weather-gradient bg-[linear-gradient(135deg,#111827_0%,#7f1d1d_48%,#f8fafc_100%)]";
  }
}

function SunnyEffects() {
  return (
    <>
      <div className="weather-sun absolute right-8 top-8 h-32 w-32 rounded-full bg-amber-200/80 blur-sm md:right-16 md:top-12 md:h-40 md:w-40" />
      <div className="weather-sun-ray absolute right-2 top-0 h-56 w-56 rounded-full border border-amber-100/30 md:right-10 md:h-72 md:w-72" />
      <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
    </>
  );
}

function CloudEffects({ dense = false }: { dense?: boolean }) {
  const opacity = dense ? "bg-white/25" : "bg-white/35";

  return (
    <>
      <div className={`weather-cloud weather-cloud--slow absolute left-[-18%] top-[14%] h-20 w-48 rounded-full ${opacity} blur-sm`} />
      <div className={`weather-cloud weather-cloud--medium absolute left-[-28%] top-[42%] h-24 w-64 rounded-full ${opacity} blur-md`} />
      <div className={`weather-cloud weather-cloud--fast absolute left-[-24%] top-[68%] h-16 w-44 rounded-full ${opacity} blur-sm`} />
    </>
  );
}

function RainEffects({ count }: { count: number }) {
  return (
    <div className="absolute inset-x-0 -top-12 bottom-0">
      {rainDrops.slice(0, count).map((drop) => (
        <span
          className="weather-raindrop absolute block h-12 w-px rounded-full bg-cyan-100/80"
          key={drop.id}
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity
          }}
        />
      ))}
    </div>
  );
}

function FogEffects() {
  return (
    <>
      <div className="weather-fog absolute left-[-18%] top-[18%] h-24 w-[70%] rounded-full bg-white/24 blur-2xl" />
      <div className="weather-fog weather-fog--late absolute left-[-32%] top-[48%] h-28 w-[82%] rounded-full bg-white/20 blur-3xl" />
      <div className="weather-fog weather-fog--slow absolute left-[-20%] top-[72%] h-20 w-[64%] rounded-full bg-slate-100/24 blur-2xl" />
    </>
  );
}

function NightEffects() {
  return (
    <>
      <div className="weather-moon absolute right-10 top-10 h-24 w-24 rounded-full bg-slate-100/85 shadow-[0_0_60px_rgba(226,232,240,0.45)] md:right-16 md:top-12" />
      {stars.map((star) => (
        <span
          className="weather-star absolute rounded-full bg-white/90"
          key={star.id}
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
            animationDelay: star.delay
          }}
        />
      ))}
    </>
  );
}

function UnknownGlow() {
  return (
    <>
      <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-red-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
    </>
  );
}
