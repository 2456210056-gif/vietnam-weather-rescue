"use client";

import type { WeatherCondition } from "@/lib/weather/weather-condition";

type WeatherCinematicBackgroundProps = {
  condition: WeatherCondition;
  variant?: "weather" | "auth";
};

const stars = Array.from({ length: 28 }, (_, index) => ({
  id: `cinematic-star-${index}`,
  left: `${(index * 31) % 98}%`,
  top: `${5 + ((index * 19) % 52)}%`,
  delay: `${(index % 9) * 0.32}s`
}));

const rainDrops = Array.from({ length: 54 }, (_, index) => ({
  id: `cinematic-rain-${index}`,
  left: `${(index * 17) % 100}%`,
  delay: `${(index % 12) * 0.09}s`,
  duration: `${0.78 + (index % 8) * 0.05}s`
}));

export function WeatherCinematicBackground({
  condition,
  variant = "weather"
}: WeatherCinematicBackgroundProps) {
  const isNight = condition === "night" || condition === "thunderstorm" || variant === "auth";
  const isRain = condition === "rain" || condition === "drizzle" || condition === "thunderstorm";

  return (
    <div aria-hidden className="weather-animated pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className={`absolute inset-0 weather-gradient ${getGradient(condition, variant)}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-blue-950/10 to-blue-950/75" />
      <div className="absolute left-[-10%] top-[-18%] h-72 w-72 rounded-full bg-blue-300/25 blur-3xl md:h-96 md:w-96" />
      <div className="absolute right-[-12%] top-[12%] h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl md:h-[28rem] md:w-[28rem]" />

      {isNight ? (
        <>
          <div className="weather-moon absolute right-8 top-16 h-24 w-24 rounded-full bg-white/80 shadow-[0_0_90px_rgba(255,255,255,0.42)] blur-[1px]" />
          {stars.map((star) => (
            <span
              className="weather-star absolute h-1 w-1 rounded-full bg-white/90"
              key={star.id}
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay
              }}
            />
          ))}
        </>
      ) : (
        <>
          <div className="weather-sun absolute right-8 top-14 h-28 w-28 rounded-full bg-amber-200/75 shadow-[0_0_100px_rgba(252,211,77,0.45)]" />
          <div className="weather-sun-ray absolute right-[-4rem] top-[-4rem] h-72 w-72 rounded-full border border-amber-100/20" />
        </>
      )}

      <div className="weather-cloud weather-cloud--slow absolute left-[-18%] top-[10%] h-24 w-64 rounded-full bg-white/20 blur-xl" />
      <div className="weather-cloud weather-cloud--medium absolute left-[-32%] top-[27%] h-28 w-80 rounded-full bg-white/15 blur-2xl" />
      <div className="weather-cloud weather-cloud--fast absolute left-[-22%] top-[48%] h-20 w-56 rounded-full bg-white/10 blur-xl" />

      {condition === "mist" || condition === "fog" ? (
        <>
          <div className="weather-fog absolute left-[-20%] top-[34%] h-24 w-[70%] rounded-full bg-white/20 blur-3xl" />
          <div className="weather-fog weather-fog--late absolute left-[-35%] top-[58%] h-28 w-[82%] rounded-full bg-white/15 blur-3xl" />
        </>
      ) : null}

      {isRain ? (
        <div className="absolute inset-x-0 -top-10 bottom-0">
          {rainDrops.map((drop) => (
            <span
              className="weather-raindrop absolute block h-12 w-px rounded-full bg-cyan-100/75"
              key={drop.id}
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration
              }}
            />
          ))}
        </div>
      ) : null}

      {condition === "thunderstorm" ? <div className="weather-lightning absolute inset-0 bg-white/25" /> : null}

      <div className="absolute inset-x-[-10%] bottom-0 h-48 rounded-t-[50%] bg-gradient-to-t from-emerald-950/80 via-blue-950/50 to-transparent" />
      <div className="absolute bottom-20 left-[-8%] h-14 w-[116%] rounded-[50%] bg-cyan-100/10 blur-md" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />
    </div>
  );
}

function getGradient(condition: WeatherCondition, variant: "weather" | "auth") {
  if (variant === "auth") {
    return "bg-gradient-to-b from-blue-700 via-blue-950 to-emerald-950";
  }

  switch (condition) {
    case "clear":
      return "bg-gradient-to-b from-sky-500 via-blue-700 to-blue-950";
    case "clouds":
      return "bg-gradient-to-b from-blue-700 via-blue-900 to-slate-950";
    case "rain":
    case "drizzle":
      return "bg-gradient-to-b from-slate-700 via-blue-950 to-slate-950";
    case "thunderstorm":
      return "bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950";
    case "mist":
    case "fog":
      return "bg-gradient-to-b from-slate-500 via-blue-800 to-blue-950";
    case "night":
      return "bg-gradient-to-b from-blue-800 via-blue-950 to-slate-950";
    default:
      return "bg-gradient-to-b from-blue-700 via-blue-900 to-slate-950";
  }
}
