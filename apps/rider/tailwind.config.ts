import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0FBF5",
          100: "#D1F5E2",
          200: "#A3EBC5",
          300: "#66D9A0",
          400: "#33C278",
          500: "#1B8A4C", // Tatka Forest Green
          600: "#166E3D",
          700: "#0E5230",
          800: "#08381F",
          900: "#031E11",
        },
        harvest: {
          50: "#FFF8F0",
          100: "#FDECD6",
          200: "#FACCAA",
          300: "#F7A769",
          400: "#F58D3F",
          500: "#F47920", // Tatka Harvest Orange
          600: "#D46218",
          700: "#A84B12",
        },
        rider: {
          darkBg: "#0B130E",
          darkSurface: "#122017",
          darkCard: "#16281E",
          darkBorder: "rgba(34, 197, 94, 0.18)",
          lightBg: "#F7FAF8",
          lightSurface: "#FFFFFF",
          lightCard: "#FFFFFF",
          lightBorder: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "Hind Siliguri", "sans-serif"],
        bengali: ["Hind Siliguri", "sans-serif"],
      },
      boxShadow: {
        'glow-brand': '0 0 20px -3px rgba(27, 138, 76, 0.35)',
        'glow-accent': '0 0 20px -3px rgba(244, 121, 32, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
