import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "sans-serif"]
      },
      colors: {
        rescue: {
          red: "#dc2626",
          blue: "#2563EB",
          green: "#10B981",
          amber: "#d97706"
        },
        brand: {
          blue: "#2563EB",
          blueDark: "#1D4ED8",
          green: "#10B981",
          greenLight: "#ECFDF5",
          navy: "#0F172A",
          sky: "#EFF6FF"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 23, 42, 0.10)",
        glass: "0 22px 70px rgba(37, 99, 235, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
