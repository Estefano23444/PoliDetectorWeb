# PoliDetector Web

Aplicación web para **veedores políticos / electorales en Ecuador**. Permite tomar (o subir) la foto del **acta de escrutinio** que se publica en la Junta Receptora del Voto (JRV), leer sus valores con IA, y **detectar inconsistencias numéricas** del conteo al instante. Funciona desde cualquier dispositivo (celular, tablet o computadora) y es instalable como app (PWA).

> Es la versión web del prototipo original hecho en Android. La lógica de verificación es la misma; aquí es accesible para cualquiera, sin instalar nada.

## ¿Qué verifica?

Sigue las dos reglas del escrutinio ecuatoriano:

1. **Doble registro (letras vs. números):** cada fila del acta se escribe en letras y en números; ambos deben coincidir.
2. **Cuadre aritmético:** `votos en blanco + votos nulos + Σ candidatos = total de sufragantes`.
   El total de sufragantes es el valor de referencia y **no** se suma.

El cálculo del cuadre se hace **en el cliente** y se recalcula en vivo mientras corriges los datos (no se confía la aritmética al modelo de IA).

## Funcionalidades

- 📷 Captura por cámara o galería (imagen comprimida en el navegador).
- 🤖 Lectura automática del acta con **Gemini 2.0 Flash** (la clave vive solo en el backend).
- ✍️ Formulario editable y **flexible**: eliges la dignidad (Presidente, Asamblea, etc.) y agregas los candidatos/listas que aparezcan.
- ✅ Verificación en vivo con alertas claras de inconsistencias.
- 💾 Registros guardados en el dispositivo (`localStorage`).
- 📤 Exportar a **CSV/JSON** y **compartir** un resumen (WhatsApp, etc.).
- 📱 PWA instalable, diseño mobile-first.

## Arquitectura

```
src/            App React + Vite + TypeScript + Tailwind (frontend estático)
api/analyze.js  Función serverless (Vercel): recibe la imagen y llama a Gemini
api/_gemini.js  Lógica compartida de Gemini (prompt + parseo)
server/dev.js   Servidor Express SOLO para desarrollo local (replica /api/analyze)
```

La clave de Gemini **nunca** llega al navegador: el frontend llama a `/api/analyze`, y esa función (en el servidor) es la que habla con Google usando la variable de entorno `GEMINI_API_KEY`.

## Requisitos

- Node.js ≥ 18
- Una clave de **Google Gemini** (gratis): https://aistudio.google.com/app/apikey

## Desarrollo local

```bash
npm install
cp .env.example .env        # y pon tu GEMINI_API_KEY dentro
npm run dev                 # web en http://localhost:5173, API en :3001
```

`npm run dev` levanta Vite (frontend) y el servidor Express de desarrollo a la vez; Vite redirige `/api` al backend.

## Despliegue en Vercel

1. Sube este repositorio a GitHub (ya está hecho si lo creaste con el asistente).
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo `PoliDetectorWeb`.
3. Vercel detecta Vite automáticamente. Deja `Build Command = npm run build` y `Output = dist`.
4. En **Settings → Environment Variables** agrega:
   - `GEMINI_API_KEY` = tu clave de Gemini
   - *(opcional)* `GEMINI_MODEL` = `gemini-2.0-flash`
5. **Deploy**. La carpeta `api/` se publica como funciones serverless automáticamente.

> Tras cambiar variables de entorno, vuelve a desplegar (Redeploy) para que tomen efecto.

## Seguridad

- La clave de la API **no** está en el código ni en el repositorio; se lee de variables de entorno.
- `.env` está en `.gitignore`.
- Las fotos y registros se guardan **localmente en el dispositivo** del veedor; no se suben a ningún servidor (salvo la imagen que se envía puntualmente a Gemini para su lectura).

## Aviso

Herramienta de apoyo a la veeduría ciudadana. Los resultados deben contrastarse con las actas oficiales del CNE. No sustituye los procesos oficiales de escrutinio.
