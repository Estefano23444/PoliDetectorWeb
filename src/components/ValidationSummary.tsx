import type { ValidationResult } from "../types";
import { CheckIcon, AlertIcon } from "./icons";

export default function ValidationSummary({ v }: { v: ValidationResult }) {
  const ok = !v.hayInconsistencias;

  return (
    <section
      className={`card overflow-hidden ${
        ok ? "ring-success/40" : "ring-danger/40"
      }`}
    >
      <div
        className={`flex items-center gap-3 p-4 ${
          ok ? "bg-successbg" : "bg-dangerbg"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            ok ? "bg-success text-white" : "bg-danger text-white"
          }`}
        >
          {ok ? <CheckIcon className="h-6 w-6" /> : <AlertIcon className="h-6 w-6" />}
        </div>
        <div>
          <p className={`text-base font-bold ${ok ? "text-success" : "text-danger"}`}>
            {ok ? "Sin inconsistencias" : "Inconsistencias detectadas"}
          </p>
          <p className="text-xs text-slate-600">
            {ok
              ? "El cuadre y los valores coinciden."
              : "Revisa el cuadre y/o las filas marcadas."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 text-center">
        <Stat label="Sufragantes" value={v.totalSufragantes} />
        <Stat label="Suma votos" value={v.sumaVotos} />
        <Stat
          label="Diferencia"
          value={v.diferencia > 0 ? `+${v.diferencia}` : v.diferencia}
          danger={!v.cuadra}
        />
      </div>

      <div className="space-y-2 p-4">
        <Line
          ok={v.cuadra}
          text={
            v.cuadra
              ? "El cuadre coincide: blancos + nulos + candidatos = sufragantes."
              : `Descuadre de ${Math.abs(v.diferencia)} voto(s): la suma ${
                  v.diferencia > 0 ? "supera" : "es menor que"
                } el total de sufragantes.`
          }
        />
        <Line
          ok={v.filasInconsistentes === 0}
          text={
            v.filasInconsistentes === 0
              ? "Todas las filas con datos coinciden en letras y números."
              : `${v.filasInconsistentes} fila(s) con diferencia entre letras y números.`
          }
        />

        {v.filasInconsistentes > 0 && (
          <ul className="mt-1 space-y-1 rounded-lg bg-dangerbg/60 p-3 text-xs text-danger">
            {v.rows
              .filter((r) => !r.consistente && !r.vacia)
              .map((r) => (
                <li key={r.key}>
                  <b>{r.label}:</b> letras {r.letras} ≠ números {r.numeros}
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, danger }: { label: string; value: number | string; danger?: boolean }) {
  return (
    <div className="px-2 py-3">
      <p className={`text-xl font-extrabold ${danger ? "text-danger" : "text-navy-dark"}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function Line({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={`mt-0.5 ${ok ? "text-success" : "text-danger"}`}>
        {ok ? <CheckIcon className="h-4 w-4" /> : <AlertIcon className="h-4 w-4" />}
      </span>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}
