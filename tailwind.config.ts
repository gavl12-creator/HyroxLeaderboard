import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: "#07090d",
        panel: "#111827",
        slateLine: "#223047",
        hyrox: "#ff4d2e",
        energy: "#b8ff3d",
        strava: "#fc4c02",
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 77, 46, 0.22)",
      },
      fontFamily: {
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
