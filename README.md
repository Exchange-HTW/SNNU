# SNNU AI Web Portal

Portal universitario en React y FastAPI que traduce el contenido completo de la página mediante un modelo Ollama ejecutado localmente o en otra laptop de la red.

## Arquitectura

- `frontend/`: React + Vite.
- `backend/`: FastAPI + SQLite + cliente asíncrono de Ollama.
- Ollama puede ejecutarse en otra laptop mediante `OLLAMA_HOST`.
- La traducción se envía en lotes JSON con concurrencia limitada. HTML, URLs, correos, IDs, fechas y rutas de archivos no se modifican.
- Las respuestas se guardan en una caché LRU en memoria únicamente por idioma. HTW Saar y Student permanecen como contexto interno fijo y no se muestran en la interfaz.

## Arranque rápido

Abre **dos consolas de PowerShell** y ejecuta lo siguiente desde la carpeta del proyecto.

### Consola 1 — Backend FastAPI

```powershell
cd "C:\Users\Hairex\Documents\Antigravity\SNNU\backend"
.\venv\Scripts\Activate.ps1
$env:OLLAMA_HOST="http://192.168.1.8:11434"
$env:OLLAMA_MODEL="translategemma:4b"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Cambia `192.168.1.8` por la dirección IP de la laptop donde está ejecutándose Ollama. El backend estará disponible en `http://127.0.0.1:8000`.

### Consola 2 — Frontend React

```powershell
cd "C:\Users\Hairex\Documents\Antigravity\SNNU\frontend"
npm run dev
```

Abre en el navegador la dirección mostrada por Vite, normalmente `http://localhost:5173`.

### Solo la primera vez

Si todavía no instalaste las dependencias, ejecuta primero:

```powershell
cd "C:\Users\Hairex\Documents\Antigravity\SNNU\backend"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd "C:\Users\Hairex\Documents\Antigravity\SNNU\frontend"
npm install
```

## Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

FastAPI no carga `.env` automáticamente. Define las variables en la terminal antes de iniciar:

```powershell
$env:OLLAMA_HOST="http://192.168.1.8:11434"
$env:OLLAMA_MODEL="translategemma:4b"
$env:OLLAMA_BATCH_SIZE="30"
$env:OLLAMA_MAX_CONCURRENCY="2"
$env:CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

En la laptop con Ollama, el servicio debe escuchar en la red local. Configura su firewall para permitir únicamente la IP de la laptop que ejecuta FastAPI; no expongas el puerto 11434 a Internet.

Comprueba el backend en `http://127.0.0.1:8000/health`.

## Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Para un backend remoto, modifica `frontend/.env.local`:

```text
VITE_API_BASE_URL=https://api.example.org
```

Vite incorpora esta variable durante el build; vuelve a ejecutar `npm run build` después de cambiarla.

## Despliegue con Cloudflare Wrangler

```powershell
cd frontend
npm run build
cd ..
npx wrangler deploy
```

`wrangler.jsonc` publica `frontend/dist`. El backend FastAPI debe desplegarse aparte y su URL debe indicarse mediante `VITE_API_BASE_URL` antes de compilar.

## Ajuste de rendimiento de Ollama

- `OLLAMA_BATCH_SIZE`: textos por solicitud; valor inicial recomendado: `30`.
- `OLLAMA_MAX_CONCURRENCY`: solicitudes simultáneas hacia la otra laptop; empieza con `2`.
- `TRANSLATION_CACHE_SIZE`: combinaciones completas conservadas en memoria; valor inicial: `8`.

Si el modelo devuelve una respuesta inválida o la laptop remota no está disponible, FastAPI responde con HTTP 502 y el frontend muestra el error sin reemplazar la página existente.
