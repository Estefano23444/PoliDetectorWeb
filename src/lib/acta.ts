import type { ActaData, ApiResult, Candidato, Fila } from "../types";
import { newId } from "./storage";

export const emptyFila = (): Fila => ({ texto_letras: "", valor_letras: 0, valor_numeros: 0 });

export const emptyActa = (): ActaData => ({
  meta: { provincia: "", canton: "", parroquia: "", recinto: "", junta: "", dignidad: "" },
  total_sufragantes: emptyFila(),
  votos_blancos: emptyFila(),
  votos_nulos: emptyFila(),
  candidatos: [],
  observaciones: "",
});

export const newCandidato = (nombre = ""): Candidato => ({
  id: newId(),
  nombre,
  ...emptyFila(),
});

/** Merges an AI extraction into the current acta, preserving manually-typed metadata. */
export function applyApiResult(current: ActaData, api: ApiResult): ActaData {
  return {
    ...current,
    meta: {
      ...current.meta,
      dignidad: current.meta.dignidad || api.dignidad || "",
    },
    total_sufragantes: { ...api.total_sufragantes },
    votos_blancos: { ...api.votos_blancos },
    votos_nulos: { ...api.votos_nulos },
    candidatos: api.candidatos.map((c) => ({
      id: newId(),
      nombre: c.nombre,
      texto_letras: c.texto_letras,
      valor_letras: c.valor_letras,
      valor_numeros: c.valor_numeros,
    })),
    observaciones: api.resumen || current.observaciones,
  };
}
