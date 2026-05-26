import type { SavedRecord } from "../types";
import { validateActa } from "./validation";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportRecordsJson(records: SavedRecord[]) {
  download(
    `polidetector_registros_${stamp()}.json`,
    JSON.stringify(records, null, 2),
    "application/json"
  );
}

export function exportRecordsCsv(records: SavedRecord[]) {
  const header = [
    "fecha", "provincia", "canton", "parroquia", "recinto", "junta", "dignidad",
    "total_sufragantes", "suma_votos", "diferencia", "cuadra", "filas_inconsistentes", "observaciones",
  ];
  const lines = [header.join(",")];
  for (const r of records) {
    const v = validateActa(r.data);
    const m = r.data.meta;
    lines.push(
      [
        new Date(r.createdAt).toISOString(),
        m.provincia, m.canton, m.parroquia, m.recinto, m.junta, m.dignidad,
        v.totalSufragantes, v.sumaVotos, v.diferencia,
        v.cuadra ? "si" : "no", v.filasInconsistentes, r.data.observaciones,
      ]
        .map(csvCell)
        .join(",")
    );
  }
  download(`polidetector_registros_${stamp()}.csv`, lines.join("\n"), "text/csv");
}

/** Builds a human-readable text summary suitable for sharing (WhatsApp, etc.). */
export function buildShareText(record: SavedRecord): string {
  const v = validateActa(record.data);
  const m = record.data.meta;
  const L: string[] = [];
  L.push("ACTA DE ESCRUTINIO — Verificacion PoliDetector");
  L.push(`Dignidad: ${m.dignidad || "(no indicada)"}`);
  L.push(`Recinto: ${m.recinto || "-"} | Junta: ${m.junta || "-"}`);
  L.push(`${m.provincia || "-"} / ${m.canton || "-"} / ${m.parroquia || "-"}`);
  L.push("");
  L.push(`Total sufragantes: ${v.totalSufragantes}`);
  L.push(`Suma de votos: ${v.sumaVotos}`);
  L.push(v.cuadra ? "CUADRE: OK (coincide)" : `CUADRE: DESCUADRE de ${v.diferencia} voto(s)`);
  if (v.filasInconsistentes > 0) {
    L.push("");
    L.push("Filas con diferencia letras vs numeros:");
    for (const r of v.rows.filter((x) => !x.consistente && !x.vacia)) {
      L.push(`  - ${r.label}: letras=${r.letras}, numeros=${r.numeros}`);
    }
  }
  L.push("");
  L.push(`Registrado: ${new Date(record.createdAt).toLocaleString("es-EC")}`);
  return L.join("\n");
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function stamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}
