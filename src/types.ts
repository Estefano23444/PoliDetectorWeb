// ─── Domain model for an Acta de Escrutinio (Ecuador) ───

/** A single row: value written in words vs. value written in digit boxes. */
export interface Fila {
  texto_letras: string;
  valor_letras: number;
  valor_numeros: number;
}

export interface Candidato extends Fila {
  id: string;
  nombre: string;
}

/** Identifying metadata so each record points to a specific acta / JRV. */
export interface ActaMeta {
  provincia: string;
  canton: string;
  parroquia: string;
  recinto: string;
  junta: string; // numero de Junta Receptora del Voto (JRV)
  dignidad: string; // PRESIDENTE, ASAMBLEA NACIONAL, etc.
}

export interface ActaData {
  meta: ActaMeta;
  total_sufragantes: Fila;
  votos_blancos: Fila;
  votos_nulos: Fila;
  candidatos: Candidato[];
  observaciones: string;
}

export interface SavedRecord {
  id: string;
  createdAt: number;
  data: ActaData;
  imageDataUrl?: string;
}

// ─── Validation ───

export interface RowCheck {
  key: string;
  label: string;
  letras: number;
  numeros: number;
  /** letras === numeros (the double-entry check) */
  consistente: boolean;
  /** whether this row had any value entered at all */
  vacia: boolean;
}

export interface ValidationResult {
  rows: RowCheck[];
  sumaVotos: number; // blancos + nulos + suma(candidatos), por numeros
  totalSufragantes: number;
  cuadra: boolean; // sumaVotos === totalSufragantes
  diferencia: number; // sumaVotos - totalSufragantes
  filasInconsistentes: number;
  hayInconsistencias: boolean;
}

// ─── Shape returned by the /api/analyze backend ───

export interface ApiFila {
  texto_letras: string;
  valor_letras: number;
  valor_numeros: number;
}
export interface ApiResult {
  dignidad: string;
  total_sufragantes: ApiFila;
  votos_blancos: ApiFila;
  votos_nulos: ApiFila;
  candidatos: Array<ApiFila & { nombre: string }>;
  resumen: string;
}
