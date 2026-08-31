import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#FF0000",
        muted: "#999999",
      },
      fontFamily: {
        sans: ["var(--font-hanken-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        DEFAULT: "0px",
        none: "0px",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
