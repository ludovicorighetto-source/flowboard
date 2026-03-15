import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "#f5f5f7",
        card: "#ffffff",
        ink: "#1d1d1f",
        muted: "#6e6e73",
        action: "#0071e3",
        line: "#e4e4e7"
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"SF Pro Text\"",
          "\"SF Pro Display\"",
          "sans-serif"
        ]
      },
      borderRadius: {
        panel: "12px",
        control: "8px"
      },
      boxShadow: {
        card: "0 12px 30px rgba(17, 24, 39, 0.06)",
        soft: "0 6px 18px rgba(17, 24, 39, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
