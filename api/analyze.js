// Vercel Serverless Function: POST /api/analyze
// Receives a base64 image from the browser, calls Gemini server-side
// (so the API key never reaches the client), and returns structured acta data.

import { analyzeActa } from "./_gemini.js";

export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" },
  },
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido. Usa POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { imageBase64, mimeType, contexto } = body;

    const result = await analyzeActa({
      imageBase64,
      mimeType,
      contexto,
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    });

    return res.status(200).json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido en el analisis.";
    return res.status(500).json({ error: message });
  }
}
