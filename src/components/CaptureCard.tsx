import { useRef } from "react";
import { CameraIcon, UploadIcon, SparkIcon } from "./icons";

interface Props {
  imageDataUrl?: string;
  analyzing: boolean;
  onPick: (file: File) => void;
  onAnalyze: () => void;
}

export default function CaptureCard({ imageDataUrl, analyzing, onPick, onAnalyze }: Props) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    e.target.value = ""; // allow re-picking the same file
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-100">
        {imageDataUrl ? (
          <img src={imageDataUrl} alt="Acta capturada" className="h-full w-full object-contain" />
        ) : (
          <div className="px-6 text-center text-slate-400">
            <CameraIcon className="mx-auto mb-2 h-10 w-10" />
            <p className="text-sm font-medium">Toma o sube la foto del acta publicada en la JRV</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={galleryInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <button className="btn-ghost" onClick={() => cameraInput.current?.click()} type="button">
          <CameraIcon className="h-4 w-4" /> Cámara
        </button>
        <button className="btn-ghost" onClick={() => galleryInput.current?.click()} type="button">
          <UploadIcon className="h-4 w-4" /> Galería
        </button>
      </div>

      {imageDataUrl && (
        <div className="px-3 pb-3">
          <button className="btn-accent w-full" onClick={onAnalyze} disabled={analyzing} type="button">
            {analyzing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-darkest/30 border-t-navy-darkest" />
                Analizando con IA…
              </>
            ) : (
              <>
                <SparkIcon className="h-4 w-4" /> Leer acta con IA
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">
            La IA rellena los campos; <b>revisa y corrige</b> antes de guardar.
          </p>
        </div>
      )}
    </section>
  );
}
