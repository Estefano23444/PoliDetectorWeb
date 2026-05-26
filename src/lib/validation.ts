import type { ActaData, Fila, RowCheck, ValidationResult } from "../types";

const isEmptyFila = (f: Fila) =>
  f.valor_letras === 0 && f.valor_numeros === 0 && f.texto_letras.trim() === "";

function rowCheck(key: string, label: string, f: Fila): RowCheck {
  return {
    key,
    label,
    letras: f.valor_letras,
    numeros: f.valor_numeros,
    consistente: f.valor_letras === f.valor_numeros,
    vacia: isEmptyFila(f),
  };
}

/**
 * Core verification, recomputed reactively as the veedor edits.
 *
 * Two independent checks (mirroring the official escrutinio rules):
 *  1) Per row: the value in words must equal the value in the digit boxes.
 *  2) Arithmetic: blancos + nulos + sum(candidatos) must equal total sufragantes.
 *     (Total sufragantes is the reference value and is NOT part of the sum.)
 *
 * The sum uses the digit-box values (valor_numeros), which are the official tally.
 */
export function validateActa(data: ActaData): ValidationResult {
  const rows: RowCheck[] = [
    rowCheck("sufragantes", "Total de sufragantes", data.total_sufragantes),
    rowCheck("blancos", "Votos en blanco", data.votos_blancos),
    rowCheck("nulos", "Votos nulos", data.votos_nulos),
    ...data.candidatos.map((c) =>
      rowCheck(c.id, c.nombre.trim() || "Candidato sin nombre", c)
    ),
  ];

  const sumaVotos =
    data.votos_blancos.valor_numeros +
    data.votos_nulos.valor_numeros +
    data.candidatos.reduce((acc, c) => acc + c.valor_numeros, 0);

  const totalSufragantes = data.total_sufragantes.valor_numeros;
  const diferencia = sumaVotos - totalSufragantes;
  const cuadra = diferencia === 0;

  // Only count non-empty rows as inconsistent (an all-zero row isn't a mismatch).
  const filasInconsistentes = rows.filter((r) => !r.consistente && !r.vacia).length;

  return {
    rows,
    sumaVotos,
    totalSufragantes,
    cuadra,
    diferencia,
    filasInconsistentes,
    hayInconsistencias: !cuadra || filasInconsistentes > 0,
  };
}
