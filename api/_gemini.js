// Shared Gemini logic used by both the Vercel serverless function (api/analyze.js)
// and the local dev Express server (server/dev.js).
//
// Files prefixed with "_" are NOT treated as routes by Vercel.

const SYSTEM_PROMPT = `
Eres un digitador electoral experto del Consejo Nacional Electoral de Ecuador.
Tu trabajo es leer Actas de Escrutinio con total precision y extraer los valores.

REGLAS DE LECTURA:
1. Lee EXACTAMENTE lo que esta escrito a mano en la columna "Total en Letras".
2. Lee los digitos en las casillas (Centenas, Decenas, Unidades) y concatenalos.
   Ejemplo: casillas 3, 1, 5 -> numero = 315. Casillas 0, 6, 2 -> numero = 62.
3. Corrige errores de caligrafia OBVIOS al interpretar el valor numerico:
   - "Secenta" = "Sesenta" = 60
   - "Trecientos" = "Trescientos" = 300
   - "Beinte" = "Veinte" = 20
   - "Qonce" / "Qoince" = "Quince" = 15
   - "Sinco" = "Cinco" = 5
4. Para cada casilla vacia, asume 0.
5. valor_letras = el numero que representan las palabras escritas a mano.
   valor_numeros = el numero que forman los digitos de las casillas.
   Pueden diferir: esa diferencia es justamente lo que queremos detectar.

IMPORTANTE:
- La fila "TOTAL DE SUFRAGANTES" es el valor de referencia, NO es un candidato.
- Los votos blancos y nulos van en sus campos propios, no como candidatos.
- En el arreglo "candidatos" incluye SOLO a los candidatos/listas/opciones reales.

FORMATO DE RESPUESTA:
Responde UNICAMENTE con JSON puro y valido. Sin markdown, sin texto fuera del JSON.
`;

function buildUserPrompt(contexto) {
  const ctx = contexto && contexto.trim().length
    ? `Contexto de esta acta (proporcionado por el veedor): ${contexto.trim()}\n\n`
    : "";
  return `${ctx}Analiza esta imagen de un Acta de Escrutinio electoral de Ecuador y devuelve SOLO este JSON:
{
  "dignidad": "dignidad detectada si es visible, ej: PRESIDENTE, ASAMBLEA NACIONAL (o cadena vacia)",
  "total_sufragantes": { "texto_letras": "", "valor_letras": 0, "valor_numeros": 0 },
  "votos_blancos": { "texto_letras": "", "valor_letras": 0, "valor_numeros": 0 },
  "votos_nulos": { "texto_letras": "", "valor_letras": 0, "valor_numeros": 0 },
  "candidatos": [
    { "nombre": "NOMBRE O LISTA", "texto_letras": "", "valor_letras": 0, "valor_numeros": 0 }
  ],
  "resumen": "Breve descripcion de lo leido y cualquier observacion (campos ilegibles, tachones, etc.)"
}`;
}

const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Calls the Gemini vision API and returns the parsed acta structure.
 * @param {{ imageBase64: string, mimeType?: string, contexto?: string, apiKey: string, model?: string }} opts
 */
export async function analyzeActa({ imageBase64, mimeType, contexto, apiKey, model }) {
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el servidor. Configurala como variable de entorno.");
  }
  if (!imageBase64) {
    throw new Error("No se recibio ninguna imagen.");
  }

  const usedModel = model || DEFAULT_MODEL;
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
          { text: buildUserPrompt(contexto) },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    if (resp.status === 429) throw new Error("Limite de la API de Gemini excedido. Intenta mas tarde.");
    if (resp.status === 400 && errText.includes("API_KEY")) {
      throw new Error("La clave de Gemini es invalida. Revisa GEMINI_API_KEY.");
    }
    throw new Error(`Gemini respondio ${resp.status}: ${errText.slice(0, 300)}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(
      blockReason
        ? `Gemini bloqueo la solicitud (${blockReason}).`
        : "Gemini devolvio una respuesta vacia."
    );
  }

  const clean = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("No se pudo interpretar la respuesta de Gemini como JSON.");
  }

  return normalize(parsed);
}

// Defensive normalization: guarantee the shape the frontend expects.
function normalize(p) {
  const fila = (f) => ({
    texto_letras: String(f?.texto_letras ?? ""),
    valor_letras: toInt(f?.valor_letras),
    valor_numeros: toInt(f?.valor_numeros),
  });
  return {
    dignidad: String(p?.dignidad ?? ""),
    total_sufragantes: fila(p?.total_sufragantes),
    votos_blancos: fila(p?.votos_blancos),
    votos_nulos: fila(p?.votos_nulos),
    candidatos: Array.isArray(p?.candidatos)
      ? p.candidatos.map((c) => ({ nombre: String(c?.nombre ?? ""), ...fila(c) }))
      : [],
    resumen: String(p?.resumen ?? ""),
  };
}

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

export { SYSTEM_PROMPT, buildUserPrompt, DEFAULT_MODEL };
