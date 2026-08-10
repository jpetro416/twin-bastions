import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bastion: {
          dark: "#0a0e17",
          panel: "#121826",
          border: "#1e2a3a",
          accent: "#3b82f6",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#22c55e",
          colossus: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};
export default config;
