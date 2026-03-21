import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        paper: "#f7f4ea",
        coral: "#ef8354",
        moss: "#6b8f71",
        sand: "#dbc7a0"
      },
      boxShadow: {
        card: "0 18px 40px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
