import type { Fila } from "../types";
import { CheckIcon, AlertIcon, TrashIcon } from "./icons";

interface Props {
  label?: string;
  editableName?: boolean;
  name?: string;
  onNameChange?: (v: string) => void;
  fila: Fila;
  onChange: (f: Fila) => void;
  onRemove?: () => void;
}

const num = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function RowInput({
  label,
  editableName,
  name,
  onNameChange,
  fila,
  onChange,
  onRemove,
}: Props) {
  const isEmpty =
    fila.valor_letras === 0 && fila.valor_numeros === 0 && fila.texto_letras.trim() === "";
  const match = fila.valor_letras === fila.valor_numeros;

  return (
    <div
      className={`rounded-xl border p-3 ${
        isEmpty
          ? "border-slate-200 bg-white"
          : match
          ? "border-success/30 bg-successbg/40"
          : "border-danger/40 bg-dangerbg"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {editableName ? (
          <input
            className="input flex-1 font-semibold"
            placeholder="Nombre del candidato / lista"
            value={name ?? ""}
            onChange={(e) => onNameChange?.(e.target.value)}
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
        )}

        {!isEmpty &&
          (match ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
              <CheckIcon className="h-3.5 w-3.5" /> coincide
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
              <AlertIcon className="h-3.5 w-3.5" /> difiere
            </span>
          ))}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-danger"
            aria-label="Eliminar fila"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">En letras (valor)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="input text-center text-base font-semibold"
            value={fila.valor_letras || ""}
            onChange={(e) => onChange({ ...fila, valor_letras: num(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">En números (casillas)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="input text-center text-base font-semibold"
            value={fila.valor_numeros || ""}
            onChange={(e) => onChange({ ...fila, valor_numeros: num(e.target.value) })}
          />
        </div>
      </div>

      <input
        className="input mt-2 text-xs"
        placeholder="Texto escrito a mano (opcional)"
        value={fila.texto_letras}
        onChange={(e) => onChange({ ...fila, texto_letras: e.target.value })}
      />
    </div>
  );
}
