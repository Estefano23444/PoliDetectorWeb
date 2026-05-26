import type { ApiResult } from "../types";

export interface AnalyzeArgs {
  base64: string;
  mimeType: string;
  contexto?: string;
}

/** Calls the serverless backend, which holds the Gemini key. */
export async function analyzeActa({ base64, mimeType, contexto }: AnalyzeArgs): Promise<ApiResult> {
  const resp = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType, contexto }),
  });

  let payload: { result?: ApiResult; error?: string } = {};
  try {
    payload = await resp.json();
  } catch {
    throw new Error("El servidor devolvio una respuesta invalida.");
  }

  if (!resp.ok || !payload.result) {
    throw new Error(payload.error || `Error del servidor (${resp.status}).`);
  }
  return payload.result;
}
