import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#010813",
        night: "#121212",
        frost: "rgba(255, 255, 255, 0.08)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      boxShadow: {
        glow: "0 0 64px rgba(79, 172, 254, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
