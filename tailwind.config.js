/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette ported from the Android app (Figma)
        navy: {
          darkest: "#0E1E30",
          dark: "#1E3C65",
          medium: "#274C7F",
        },
        accent: "#C7B853",
        purple: "#432E89",
        success: "#2E7D32",
        successbg: "#E8F5E9",
        danger: "#C62828",
        dangerbg: "#FDECEA",
        warn: "#B26A00",
        warnbg: "#FFF4E0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
