import { useState } from "react";
import type { SavedRecord } from "../types";
import { validateActa } from "../lib/validation";
import { exportRecordsCsv, exportRecordsJson, buildShareText } from "../lib/export";
import { CheckIcon, AlertIcon, TrashIcon, ShareIcon } from "./icons";

interface Props {
  records: SavedRecord[];
  onDelete: (id: string) => void;
}

export default function RecordsList({ records, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-400">
        <p className="text-sm">Todavía no has guardado actas.</p>
        <p className="mt-1 text-xs">Las que guardes quedarán en este dispositivo.</p>
      </div>
    );
  }

  const share = async (r: SavedRecord) => {
    const text = buildShareText(r);
    try {
      if (navigator.share) await navigator.share({ title: "Acta PoliDetector", text });
      else {
        await navigator.clipboard.writeText(text);
        alert("Resumen copiado al portapapeles.");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="btn-ghost flex-1" onClick={() => exportRecordsCsv(records)} type="button">
          Exportar CSV
        </button>
        <button className="btn-ghost flex-1" onClick={() => exportRecordsJson(records)} type="button">
          Exportar JSON
        </button>
      </div>

      {records.map((r) => {
        const v = validateActa(r.data);
        const ok = !v.hayInconsistencias;
        const open = openId === r.id;
        return (
          <div key={r.id} className="card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center gap-3 p-3 text-left"
              onClick={() => setOpenId(open ? null : r.id)}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
                  ok ? "bg-success" : "bg-danger"
                }`}
              >
                {ok ? <CheckIcon className="h-5 w-5" /> : <AlertIcon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {r.data.meta.dignidad || "Acta sin dignidad"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {[r.data.meta.recinto, r.data.meta.junta && `JRV ${r.data.meta.junta}`]
                    .filter(Boolean)
                    .join(" · ") || "Sin recinto"}
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("es-EC")}
              </span>
            </button>

            {open && (
              <div className="border-t border-slate-100 p-3">
                {r.imageDataUrl && (
                  <img
                    src={r.imageDataUrl}
                    alt="Acta"
                    className="mb-3 max-h-56 w-full rounded-lg object-contain ring-1 ring-slate-200"
                  />
                )}
                <dl className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Cell label="Sufragantes" value={v.totalSufragantes} />
                  <Cell label="Suma votos" value={v.sumaVotos} />
                  <Cell label="Diferencia" value={v.diferencia} danger={!v.cuadra} />
                </dl>
                {!ok && (
                  <p className="mb-3 rounded-lg bg-dangerbg p-2 text-xs text-danger">
                    {!v.cuadra && `Descuadre de ${Math.abs(v.diferencia)} voto(s). `}
                    {v.filasInconsistentes > 0 &&
                      `${v.filasInconsistentes} fila(s) con letras ≠ números.`}
                  </p>
                )}
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1" onClick={() => share(r)} type="button">
                    <ShareIcon className="h-4 w-4" /> Compartir
                  </button>
                  <button className="btn-danger" onClick={() => onDelete(r.id)} type="button">
                    <TrashIcon className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Cell({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className={`text-base font-bold ${danger ? "text-danger" : "text-navy-dark"}`}>{value}</p>
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
    </div>
  );
}
