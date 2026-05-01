import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#F0FBF4",
          100: "#D4F0DE",
          200: "#A8E0BC",
          300: "#6CC79A",
          400: "#3DAD77",
          500: "#2D7D5A",
          600: "#236346",
          700: "#1A4A34",
          800: "#113122",
          900: "#091911",
        },
        teal: {
          50: "#F0FAFA",
          100: "#CCEEEE",
          200: "#99DDDD",
          300: "#66CCCC",
          400: "#3ABFBF",
          500: "#2EA5A5",
          600: "#237F7F",
          700: "#195F5F",
        },
        sand: {
          50: "#FDFAF6",
          100: "#FDF6EC",
          200: "#F5EDD8",
          300: "#EAD9B5",
        },
        charcoal: {
          100: "#E2E8E8",
          200: "#C4D0D1",
          400: "#6B8485",
          500: "#486668",
          700: "#28393B",
          800: "#1E2D2F",
          900: "#141F20",
        },
        amber: { 400: "#F4A535", 500: "#E08B20" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
