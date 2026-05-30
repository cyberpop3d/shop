import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        skyglass: {
          50: "#f4fbff",
          100: "#dff3ff",
          200: "#b8e7ff",
          300: "#7ed6ff",
          400: "#35bbf4",
          500: "#0ca3dc"
        }
      },
      boxShadow: {
        soft: "0 24px 70px rgba(8, 60, 90, .16)",
        card: "0 18px 45px rgba(15, 66, 97, .12)"
      }
    }
  },
  plugins: []
};

export default config;
