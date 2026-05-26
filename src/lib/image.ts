export interface ProcessedImage {
  /** Full data URL (for preview + storage as evidence). */
  dataUrl: string;
  /** Base64 payload without the "data:...;base64," prefix (for the API). */
  base64: string;
  mimeType: string;
}

const MAX_DIMENSION = 1600; // keeps payload small + under serverless body limits
const JPEG_QUALITY = 0.82;

/**
 * Loads an image file, downscales it (longest side <= MAX_DIMENSION) and
 * re-encodes as JPEG. This keeps the upload well under Vercel's body limit
 * and reduces token cost, while staying legible for OCR.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const bitmap = await loadBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen en este navegador.");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";

  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  return { dataUrl, base64, mimeType: "image/jpeg" };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
