import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        soft: "rgb(var(--color-soft) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        moss: "rgb(var(--color-moss) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)"
      },
      boxShadow: {
        card: "var(--shadow-card)"
      }
    }
  },
  plugins: []
};

export default config;
