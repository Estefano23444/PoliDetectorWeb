import type { ActaData, Candidato, Fila } from "../types";
import { newCandidato } from "../lib/acta";
import RowInput from "./RowInput";
import { PlusIcon } from "./icons";

interface Props {
  data: ActaData;
  onChange: (next: ActaData) => void;
}

const DIGNIDADES = [
  "PRESIDENTE Y VICEPRESIDENTE",
  "ASAMBLEÍSTAS NACIONALES",
  "ASAMBLEÍSTAS PROVINCIALES",
  "PARLAMENTO ANDINO",
  "PREFECTO Y VICEPREFECTO",
  "ALCALDE",
  "CONCEJALES URBANOS",
  "CONCEJALES RURALES",
  "VOCALES JUNTA PARROQUIAL",
  "CONSULTA POPULAR / REFERÉNDUM",
];

export default function ActaForm({ data, onChange }: Props) {
  const setMeta = (patch: Partial<ActaData["meta"]>) =>
    onChange({ ...data, meta: { ...data.meta, ...patch } });

  const setFila = (key: "total_sufragantes" | "votos_blancos" | "votos_nulos", f: Fila) =>
    onChange({ ...data, [key]: f });

  const setCandidato = (id: string, patch: Partial<Candidato>) =>
    onChange({
      ...data,
      candidatos: data.candidatos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const addCandidato = () =>
    onChange({ ...data, candidatos: [...data.candidatos, newCandidato()] });

  const removeCandidato = (id: string) =>
    onChange({ ...data, candidatos: data.candidatos.filter((c) => c.id !== id) });

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-dark">
          Identificación del acta
        </h2>
        <div className="mb-3">
          <label className="label">Dignidad</label>
          <input
            className="input"
            list="dignidades"
            placeholder="Ej: PRESIDENTE Y VICEPRESIDENTE"
            value={data.meta.dignidad}
            onChange={(e) => setMeta({ dignidad: e.target.value })}
          />
          <datalist id="dignidades">
            {DIGNIDADES.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Provincia" value={data.meta.provincia} onChange={(v) => setMeta({ provincia: v })} />
          <Field label="Cantón" value={data.meta.canton} onChange={(v) => setMeta({ canton: v })} />
          <Field label="Parroquia" value={data.meta.parroquia} onChange={(v) => setMeta({ parroquia: v })} />
          <Field label="Junta (JRV) N°" value={data.meta.junta} onChange={(v) => setMeta({ junta: v })} />
          <div className="col-span-2">
            <Field label="Recinto electoral" value={data.meta.recinto} onChange={(v) => setMeta({ recinto: v })} />
          </div>
        </div>
      </section>

      {/* Totals */}
      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-dark">Totales</h2>
        <div className="space-y-3">
          <RowInput
            label="Total de sufragantes"
            fila={data.total_sufragantes}
            onChange={(f) => setFila("total_sufragantes", f)}
          />
          <RowInput
            label="Votos en blanco"
            fila={data.votos_blancos}
            onChange={(f) => setFila("votos_blancos", f)}
          />
          <RowInput
            label="Votos nulos"
            fila={data.votos_nulos}
            onChange={(f) => setFila("votos_nulos", f)}
          />
        </div>
      </section>

      {/* Candidates */}
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy-dark">
            Candidatos / Listas
          </h2>
          <span className="text-xs text-slate-400">{data.candidatos.length}</span>
        </div>
        <div className="space-y-3">
          {data.candidatos.map((c) => (
            <RowInput
              key={c.id}
              editableName
              name={c.nombre}
              onNameChange={(v) => setCandidato(c.id, { nombre: v })}
              fila={c}
              onChange={(f) => setCandidato(c.id, f)}
              onRemove={() => removeCandidato(c.id)}
            />
          ))}
          {data.candidatos.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
              Aún no hay candidatos. Agrégalos o usa la lectura con IA.
            </p>
          )}
        </div>
        <button type="button" className="btn-ghost mt-3 w-full" onClick={addCandidato}>
          <PlusIcon className="h-4 w-4" /> Agregar candidato / lista
        </button>
      </section>

      {/* Observations */}
      <section className="card p-4">
        <label className="label">Observaciones</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Notas del veedor, tachones, campos ilegibles, etc."
          value={data.observaciones}
          onChange={(e) => onChange({ ...data, observaciones: e.target.value })}
        />
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
