"use client";

import type { WeatherCondition } from "@/lib/weather/weather-condition";

type PremiumWeatherBackgroundProps = {
  condition: WeatherCondition;
};

const stars = Array.from({ length: 26 }, (_, index) => ({
  id: `premium-star-${index}`,
  left: `${(index * 29) % 96}%`,
  top: `${6 + ((index * 17) % 48)}%`,
  delay: `${(index % 8) * 0.35}s`
}));

const rainDrops = Array.from({ length: 52 }, (_, index) => ({
  id: `premium-rain-${index}`,
  left: `${(index * 13) % 100}%`,
  delay: `${(index % 11) * 0.1}s`,
  duration: `${0.8 + (index % 7) * 0.05}s`
}));

export function PremiumWeatherBackground({ condition }: PremiumWeatherBackgroundProps) {
  const isNight = condition === "night" || condition === "thunderstorm";
  const isRain = condition === "rain" || condition === "drizzle" || condition === "thunderstorm";

  return (
    <div aria-hidden className="weather-animated pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className={`absolute inset-0 ${getGradient(condition)}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-blue-950/70" />

      {isNight ? (
        <>
          <div className="weather-moon absolute right-8 top-16 h-24 w-24 rounded-full bg-white/85 shadow-[0_0_80px_rgba(255,255,255,0.45)] blur-[1px]" />
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
        <div className="weather-sun absolute right-8 top-16 h-28 w-28 rounded-full bg-amber-200/70 shadow-[0_0_90px_rgba(252,211,77,0.45)]" />
      )}

      <div className="weather-cloud weather-cloud--slow absolute left-[-20%] top-[10%] h-24 w-64 rounded-full bg-white/20 blur-xl" />
      <div className="weather-cloud weather-cloud--medium absolute left-[-30%] top-[26%] h-28 w-80 rounded-full bg-white/15 blur-2xl" />
      <div className="weather-cloud weather-cloud--fast absolute left-[-22%] top-[46%] h-20 w-56 rounded-full bg-white/10 blur-xl" />

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

      {condition === "thunderstorm" ? (
        <div className="weather-lightning absolute inset-0 bg-white/25" />
      ) : null}

      <div className="absolute inset-x-[-8%] bottom-0 h-44 rounded-t-[50%] bg-gradient-to-t from-emerald-950/80 via-blue-950/50 to-transparent" />
      <div className="absolute bottom-20 left-[-8%] h-14 w-[116%] rounded-[50%] bg-cyan-100/12 blur-md" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950/60 to-transparent" />
    </div>
  );
}

function getGradient(condition: WeatherCondition) {
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
