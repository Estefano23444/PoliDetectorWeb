import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, the React app runs on Vite (5173) and proxies
// /api requests to the Express backend (3001), which holds the Gemini key.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    outDir: "dist",
  },
});
