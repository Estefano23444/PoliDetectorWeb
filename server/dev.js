// LOCAL DEVELOPMENT ONLY — not used in production.
// In production, Vercel serves the static build and runs api/analyze.js as a
// serverless function. This Express server mirrors that endpoint for `npm run dev`
// (Vite proxies /api -> http://localhost:3001).

import express from "express";
import cors from "cors";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyzeActa } from "../api/_gemini.js";

// Load .env manually (no extra dependency).
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = join(__dirname, "..", ".env");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env file — rely on the shell environment.
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType, contexto } = req.body || {};
    const result = await analyzeActa({
      imageBase64,
      mimeType,
      contexto,
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Error desconocido." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.GEMINI_API_KEY) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[dev api] escuchando en http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[dev api] AVISO: GEMINI_API_KEY no esta configurada (.env). El analisis con IA fallara.");
  }
});
