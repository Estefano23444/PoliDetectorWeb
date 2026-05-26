import { useEffect, useMemo, useState } from "react";
import type { ActaData, SavedRecord } from "./types";
import { emptyActa, applyApiResult } from "./lib/acta";
import { validateActa } from "./lib/validation";
import { processImage } from "./lib/image";
import { analyzeActa } from "./lib/api";
import { loadRecords, saveRecords, newId } from "./lib/storage";
import CaptureCard from "./components/CaptureCard";
import ActaForm from "./components/ActaForm";
import ValidationSummary from "./components/ValidationSummary";
import RecordsList from "./components/RecordsList";
import { SaveIcon, PlusIcon } from "./components/icons";

type Tab = "nueva" | "registros";

export default function App() {
  const [tab, setTab] = useState<Tab>("nueva");
  const [data, setData] = useState<ActaData>(emptyActa);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [records, setRecords] = useState<SavedRecord[]>(() => loadRecords());

  const validation = useMemo(() => validateActa(data), [data]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handlePick = async (file: File) => {
    setError(null);
    try {
      const img = await processImage(file);
      setImageDataUrl(img.dataUrl);
      setImageBase64(img.base64);
      setImageMime(img.mimeType);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeActa({
        base64: imageBase64,
        mimeType: imageMime,
        contexto: data.meta.dignidad,
      });
      setData((prev) => applyApiResult(prev, result));
      setToast("Acta leída. Revisa y corrige los valores.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar el acta.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    const record: SavedRecord = {
      id: newId(),
      createdAt: Date.now(),
      data,
      imageDataUrl,
    };
    setRecords((prev) => [record, ...prev]);
    setToast("Registro guardado en este dispositivo.");
    handleNew();
    setTab("registros");
  };

  const handleNew = () => {
    setData(emptyActa());
    setImageDataUrl(undefined);
    setImageBase64(undefined);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const inconsistentes = records.filter((r) => validateActa(r.data).hayInconsistencias).length;

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-navy-darkest to-navy-medium px-4 pb-3 pt-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PoliDetector" className="h-9 w-9 rounded-lg" />
          <div className="leading-tight">
            <h1 className="text-base font-extrabold tracking-tight">PoliDetector</h1>
            <p className="text-[11px] text-white/70">Verificación de actas · Veedores electorales</p>
          </div>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-white/10 p-1 text-sm font-semibold">
          <TabBtn active={tab === "nueva"} onClick={() => setTab("nueva")}>
            Nueva acta
          </TabBtn>
          <TabBtn active={tab === "registros"} onClick={() => setTab("registros")}>
            Registros{records.length > 0 ? ` (${records.length})` : ""}
          </TabBtn>
        </nav>
      </header>

      <main className="flex-1 space-y-4 px-4 py-4 pb-28">
        {tab === "nueva" ? (
          <>
            <CaptureCard
              imageDataUrl={imageDataUrl}
              analyzing={analyzing}
              onPick={handlePick}
              onAnalyze={handleAnalyze}
            />

            {error && (
              <div className="rounded-xl border border-danger/40 bg-dangerbg p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <ValidationSummary v={validation} />
            <ActaForm data={data} onChange={setData} />
          </>
        ) : (
          <>
            {inconsistentes > 0 && (
              <div className="rounded-xl border border-warn/40 bg-warnbg p-3 text-sm text-warn">
                {inconsistentes} de {records.length} actas tienen inconsistencias.
              </div>
            )}
            <RecordsList records={records} onDelete={handleDelete} />
          </>
        )}
      </main>

      {/* Sticky action bar (only on "nueva") */}
      {tab === "nueva" && (
        <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-xl gap-2">
            <button className="btn-ghost" onClick={handleNew} type="button">
              <PlusIcon className="h-4 w-4" /> Nueva
            </button>
            <button className="btn-primary flex-1" onClick={handleSave} type="button">
              <SaveIcon className="h-4 w-4" /> Guardar registro
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4">
          <div className="rounded-full bg-navy-darkest px-4 py-2 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg py-1.5 transition ${
        active ? "bg-white text-navy-dark shadow" : "text-white/80 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
