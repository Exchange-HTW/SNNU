# SNNU (Systems Neuroscience & Neurotechnology Unit) - Master Context Document

> **Propósito de este documento:** Este archivo compila toda la arquitectura, código fuente, esquemas de datos, flujos de traducción por IA, componentes visuales, infraestructura en la nube y scripts auxiliares del proyecto SNNU. Está diseñado para ser suministrado directamente como contexto a un Modelo de Lenguaje (LLM) para generar la documentación técnica oficial, manuales de usuario, especificaciones de arquitectura (ADR) o documentación de API.

---

## 1. Resumen Ejecutivo y Misión del Proyecto

**SNNU** (*Systems Neuroscience & Neurotechnology Unit*) es el portal web interactivo oficial de la unidad de investigación interdisciplinaria afiliada a:
- **Facultad de Medicina de la Universität des Saarlandes (UdS)** (Homburg/Saar).
- **Facultad de Ingeniería de la Hochschule für Technik und Wirtschaft des Saarlandes (htw saar)** (Saarbrücken).

### Núcleo de Innovación del Portal
1. **Traducción Dinámica por IA Local (Zero-Data-Leakage / Privacidad Clínica):** A diferencia de portales que usan Google Translate, SNNU implementa un backend en FastAPI que conecta con instancias locales o de red privada de **Ollama** ejecutando modelos open-source (por defecto `translategemma:4b` o `qwen2.5:1.5b`). La traducción se realiza en tiempo real preservando estructuras HTML, citas académicas, nombres propios, enlaces y formatos bibliográficos sin enviar datos a APIs externas.
2. **Entornos Virtuales WebXR y Unity WebGL:** Muestra un recorrido virtual 360° interactivo de los laboratorios y del sistema acústico de 46 altavoces (*46-Speaker System*), integrando simulaciones en WebGL conectadas mediante un Worker en Cloudflare.
3. **Catálogo de Investigación y Publicaciones Automatizado:** Integra pipelines de auditoría académica que extraen publicaciones y metadatos de DOIs mediante Crossref y OpenAlex, descargando copias Open Access y permitiendo navegación por cuadrícula, línea de tiempo y análisis bibliométrico.

---

## 2. Arquitectura General del Sistema

El ecosistema SNNU se divide en cuatro capas claramente desacopladas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NAVEGADOR CLIENTE                             │
│                  React 19 + Vite 8 SPA (frontend/)                      │
│      - Selector de 15 idiomas           - Visor Unity WebGL (360°)      │
│      - Vistas dinámicas de Laboratorios  - Directorio del equipo (Modal) │
│      - Explorador de Publicaciones      - Muelle flotante (Dock Nav)    │
└───────────────────▲──────────────────────────────────▲──────────────────┘
                    │                                  │
    Peticiones API  │              Peticiones Estáticas│ y Media Pesada
    (GET /default-data,             (WASM, .data Unity, Videos 360)
     POST /generate)│                                  │
                    ▼                                  ▼
┌──────────────────────────────────────┐   ┌──────────────────────────────┐
│           BACKEND FASTAPI            │   │      CLOUDFLARE WORKER       │
│           (Python 3.10+)             │   │       (Edge Proxy)           │
│  - FastAPI REST API (main.py)        │   │  - worker.js / wrangler.jsonc│
│  - In-Memory LRU Cache               │   │  - Sirve assets frontend/dist│
│  - Parser/Reconstructor HTML Tag     │   │  - Streaming Proxy con CORS: │
│  - SQLite (snnu.db)                  │   │    * GitHub Releases Unity   │
│  - Pipeline de traducción con Ollama │   │    * GitHub Releases Videos  │
└───────────────────▲──────────────────┘   └──────────────────────────────┘
                    │ (HTTP JSON Schema)
                    ▼
┌──────────────────────────────────────┐
│         MOTOR IA (OLLAMA)            │
│  - Host: Localhost o Laptop remota   │
│  - Modelo: translategemma:4b         │
│  - Inferencia con Concurrencia       │
│    Controlada (Semáforos asyncio)    │
└──────────────────────────────────────┘
```

---

## 3. Estructura de Directorios del Repositorio

```text
SNNU/
├── backend/                        # API REST y motor de traducción
│   ├── base_data/                  # Estructuras de datos base del portal (Python dicts)
│   │   ├── __init__.py             # Agregador de INITIAL_PAGE_DATA
│   │   ├── hero.py                 # Datos de la sección Hero / video de cabecera
│   │   ├── home.py                 # Pilares, misión, métodos y timeline
│   │   ├── nav.py                  # Etiquetas de la barra de navegación
│   │   ├── news.py                 # Noticias y logros de investigación
│   │   ├── people.py               # Directorio de investigadores, fotos y biografías
│   │   ├── research_site.py        # Información detallada de los 6 laboratorios
│   │   ├── sections/               # Secciones académicas adicionales
│   │   │   ├── publication.py      # Catálogo completo de publicaciones generadas
│   │   │   ├── projects.py         # Proyectos de investigación
│   │   │   ├── teaching.py         # Cursos y docencia
│   │   │   ├── preprint.py         # Preprints
│   │   │   ├── about.py            # Información general
│   │   │   ├── join.py             # Vacantes y oportunidades de tesis
│   │   │   └── legal.py            # Impressum y privacidad
│   │   └── virtual_tour.py         # Textos del visor Unity 360
│   ├── chat_ollama.py              # CLI para interactuar interactivamente con Ollama
│   ├── database.py                 # Configuración de conexión SQLAlchemy a SQLite
│   ├── main.py                     # Punto de entrada de FastAPI y lógica de traducción
│   ├── models.py                   # Modelos de base de datos ORM
│   ├── schemas.py                  # Esquemas de validación Pydantic
│   ├── seed.py                     # Inicializador de datos en SQLite
│   ├── snnu.db                     # Archivo de base de datos SQLite
│   ├── requirements.txt            # Dependencias de Python
│   └── .env.example                # Plantilla de variables de entorno del backend
├── frontend/                       # Aplicación SPA cliente (React 19 + Vite 8)
│   ├── public/                     # Archivos estáticos servidos directamente
│   │   ├── Build/                  # Binarios de Unity WebGL (Loader, data, wasm)
│   │   ├── TemplateData/           # Estilos e iconos del player de Unity
│   │   ├── css/                    # Estilos complementarios y fuentes
│   │   ├── image/                  # Imágenes de laboratorios, logos y personal
│   │   │   ├── people/             # Fotos de investigadores (sincronizadas)
│   │   │   └── research-sites/     # Sliders y galerías de los laboratorios
│   │   ├── js/                     # Scripts de compatibilidad
│   │   ├── publication/            # PDFs de artículos Open Access locales
│   │   ├── video/                  # Videos locales demostrativos
│   │   ├── webxr/                  # Entorno WebXR para visores VR
│   │   ├── favicon.svg             # Favicon institucional
│   │   └── icons.svg               # Sprites SVG
│   ├── src/                        # Código fuente React
│   │   ├── assets/                 # SVGs y banners de React
│   │   ├── components/             # Componentes modulares
│   │   │   ├── HomePage.jsx        # Página de inicio (misión, laboratorios, timeline)
│   │   │   ├── HomePage.css        # Estilos específicos de HomePage
│   │   │   ├── ProfileModal.jsx    # Modal de biografía y publicaciones de autor
│   │   │   ├── ProfileModal.css    # Estilos del modal de perfil
│   │   │   ├── ResearchLabDetail.jsx # Detalle, slider y ubicación del laboratorio
│   │   │   └── ResearchLabDetail.css # Estilos de vista de laboratorio
│   │   ├── App.jsx                 # Componente raíz, orquestador de estado e i18n
│   │   ├── App.css                 # Estilos principales de la aplicación y dock
│   │   ├── index.css               # Reset y configuración tipográfica (Inter)
│   │   └── main.jsx                # Punto de entrada del bundle React
│   ├── index.html                  # HTML base con enlaces a CDNs y montaje de React
│   ├── package.json                # Dependencias NPM y scripts de Vite
│   └── vite.config.js              # Configuración del bundler Vite
├── tools/                          # Scripts de automatización y ETL de datos
│   ├── audit_publications.py       # Scraper/API Crossref + OpenAlex -> manifest.csv
│   └── sync_people_photos.py       # Scraper de retratos desde el portal de Uni-Saarland
├── manifest.csv                    # Catálogo maestro procesado de publicaciones con estado PDF
├── papers.csv                      # Lista cruda de títulos y DOIs a auditar
├── restore_publications.py         # Script utilitario para reconstruir publication.py desde CSV
├── start_demo.sh                   # Script Bash ejecutable para levantar backend y frontend
├── worker.js                       # Cloudflare Worker para enrutamiento y proxy de assets
├── wrangler.jsonc                  # Configuración de despliegue en Cloudflare Workers
├── README.md                       # Documentación rápida original
└── .gitignore                      # Reglas de exclusión de Git
```

---

## 4. Frontend: Especificación y Componentes (React 19)

### 4.1 Tecnologías y Librerías
- **React:** `^19.2.7`
- **React DOM:** `^19.2.7`
- **Vite:** `^8.1.1` (con `@vitejs/plugin-react: ^6.0.3`)
- **Linter:** `oxlint: ^1.71.0`
- **Fuentes & Iconografía:** Tipografía *Inter* (Google Fonts), FontAwesome 6.4.0 (CDN).

### 4.2 Arquitectura del Estado (`App.jsx`)
El componente `App.jsx` actúa como único orquestador de estado:
1. **`page` (Object):** Contiene el árbol de datos completo de la página recibido desde el backend (`/default-data` o `/generate`).
2. **`selections` (Object):**
   - `language`: Código ISO del idioma actual (por defecto `'en'`).
   - `school`: Identificador institucional (por defecto `'HTW Saar'`).
   - `audience`: Audiencia de la traducción (por defecto `'Student'`).
3. **`activeSectionId` (String):** Gestiona la sección visible (`section-home`, `section-research-site`, `section-virtual-tour`, `section-people`, `section-publication`, etc.).
4. **`showGhostTitle` (Boolean):** Barra de navegación dinámica (*Ghost Title*) que aparece fijada en la parte superior cuando el título de la sección activa sale del viewport por scroll.
5. **Normalización de Autores (`canonicalAuthorName`):** Diccionario canónico que unifica variantes ortográficas de autores (ej. `"d strauss"`, `"d j strauss"` -> `"Daniel J. Strauss"`).

### 4.3 Idiomas Soportados (15 Idiomas)
La constante `LANGUAGES` provee soporte directo para:
- Inglés (`en`), Alemán (`de`), Español (`es`), Francés (`fr`), Italiano (`it`), Portugués (`pt`), Chino (`zh`), Japonés (`ja`), Coreano (`ko`), Ruso (`ru`), Árabe (`ar`), Turco (`tr`), Polaco (`pl`), Holandés (`nl`), Sueco (`sv`).

### 4.4 Componentes Principales
- **`HomePage.jsx`:**
  - Renderiza la introducción, los 3 pilares de investigación (*Multiscale systems neuroscience*, *Quantitative neuromodeling*, *Neuroimaging*), la misión institucional, los métodos cuantitativos y una cuadrícula interactiva con los directores de laboratorio.
  - Incluye un *Timeline* histórico (2005: University Hospital, 2012: Technikum, 2013: Haptics Lab).
- **`ResearchLabDetail.jsx`:**
  - Recibe un `selectedLabId` y renderiza el nombre del laboratorio, responsable, descripción, slider fotográfico con controles interactivos y mapa/dirección del campus.
  - Laboratorios soportados:
    1. *Translational Lab* (Dirigido por Dr. Corinna Martin)
    2. *Mindscan Lab* (Dirigido por Dr. Farah I. Corona-Strauss)
    3. *Multiscale Lab* (Dirigido por Dr. Lars Haab)
    4. *Digital Realities Lab / Test Field* (Dirigido por Tobias Grün, M.Sc.)
    5. *Neurocognitive Haptics Lab*
- **`ProfileModal.jsx`:**
  - Modal accesible que muestra la foto oficial, cargo, institución, dirección física, email, teléfono, biografía y lista de publicaciones asociadas al investigador seleccionado.
- **Sección Virtual Tour (Unity WebGL + WebXR):**
  - Monta un elemento `<canvas id="unity-canvas" width="960" height="600">`.
  - Carga el loader de Unity WebGL (`/Build/UnityLoader.js`) conectándose con los endpoints proxy del worker.
  - Provee enlaces a la demo WebXR para Oculus/visores VR (`/webxr/index.html`).

---

## 5. Backend: API y Motor de Traducción (FastAPI)

### 5.1 Endpoints de la API

| Método | Endpoint | Descripción | Payload de Entrada | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/default-data` | Devuelve el contenido original en inglés (`INITIAL_PAGE_DATA`) | Ninguno | JSON completo del portal (`PageSchema`) |
| **POST** | `/generate` | Genera o recupera de caché la versión traducida de la página | `{"language": "es", "school": "HTW Saar", "audience": "Student"}` | JSON completo traducido |
| **GET** | `/health` | Healthcheck del backend y del estado de conexión con Ollama | Ninguno | `{"status": "ok", "ollama_host": "...", "model": "..."}` |

### 5.2 Variables de Entorno (`backend/.env`)

```ini
OLLAMA_HOST="http://localhost:11434"      # Dirección IP de la instancia de Ollama
OLLAMA_MODEL="translategemma:4b"          # Modelo de LLM para traducción
OLLAMA_BATCH_SIZE=30                     # Cantidad de cadenas de texto por solicitud
OLLAMA_MAX_CONCURRENCY=2                  # Solicitudes simultáneas hacia Ollama
TRANSLATION_CACHE_SIZE=8                  # Idiomas completos mantenidos en LRU Cache
CORS_ORIGINS="http://localhost:5173,http://localhost:5174" # Orígenes permitidos
```

### 5.3 Algoritmo de Traducción Determinista y Aislamiento de HTML

Uno de los aspectos más avanzados del backend es el flujo diseñado en `backend/main.py`:

```
 Árbol JSON Original
        │
        ▼
 collect_translatable_values() ──► Ignora claves prohibidas (id, urls, email, autores)
        │                          y nombres propios de investigadores
        ▼
 split_html_text()             ──► Separa el texto prosa de etiquetas HTML (<a href...>)
        │                          Genera un template de reconstrucción con índices
        ▼
 request_translations()        ──► Envía lote a Ollama con JSON Schema estricto:
        │                          {"translations": ["...", "..."]}
        ▼
 [Validación de Fallos]        ──► Si falla el JSON o la longitud difiere:
        │                          Bisección recursiva (divide el lote en 2 y reintenta)
        ▼
 rebuild_html_text()           ──► Vuelve a inyectar el texto traducido dentro de los
        │                          tags HTML originales sin alterar clases ni enlaces
        ▼
 Cache LRU + Respuesta JSON
```

1. **Aislamiento de Metadatos (`NON_TRANSLATABLE_KEYS`):**
   Claves como `id`, `icon`, `videoSrc`, `src`, `url`, `href`, `email`, `photo`, `links`, `phone`, `year`, `authors` nunca se envían al modelo.
2. **Protección de Nombres Propios:**
   Si un nodo contiene `role` y `name`, el valor de `name` se preserva intacto.
3. **Preservación de HTML:**
   La función `split_html_text` utiliza la expresión regular `(<[^>]+>)`. Si un texto contiene `<a href="...">Download PDF</a>`, el modelo únicamente recibe la palabra `"Download PDF"`, garantizando que el LLM jamás destruya o altere la sintaxis de los enlaces o atributos.
4. **Resiliencia por Bisección (Divide & Conquer):**
   Si Ollama genera un JSON malformado o un número incorrecto de traducciones para un lote de tamaño $N$, la función `request_translations` divide el lote en dos mitades (`left`, `right`) de forma recursiva hasta aislar la cadena conflictiva.

### 5.4 Base de Datos SQLite y Modelos ORM (`snnu.db`)
Configurada vía SQLAlchemy en `backend/database.py` y `backend/models.py`:
- **`School`:** Almacena instituciones (`HTW Saar`, `MIT`, `Stanford`, `Universidad de Yucatán`) con información contextual para personalizar la perspectiva de las respuestas.
- **`Language`:** Registro de idiomas admitidos (`en`, `es`, `de`).
- **`Audience`:** Perfiles de audiencia (`Student`, `Researcher`, `Company`, `Investor`) para orientar el tono del contenido.
- Al inicio de la aplicación, `seed.seed_data()` puebla automáticamente estas tablas si están vacías.

---

## 6. Infraestructura y Despliegue: Cloudflare Worker

### 6.1 Configuración de Wrangler (`wrangler.jsonc`)
```jsonc
{
  "name": "snnu",
  "main": "worker.js",
  "compatibility_date": "2026-06-19",
  "assets": {
    "directory": "frontend/dist"
  }
}
```

### 6.2 Lógica del Proxy Edge (`worker.js`)
Dado que los archivos binarios de Unity WebGL (`.data` y `.wasm`) y los videos 360 en resolución alta superan los límites de almacenamiento estándar de repositorios web y suelen sufrir bloqueos por políticas CORS:
- **Ruta `/unity/data`:** Descarga en streaming `VirtualTourVRweb.data` desde GitHub Releases (`Exchange-HTW/htwvideos`) inyectando encabezados `Access-Control-Allow-Origin: *` y `Content-Type: application/octet-stream`.
- **Ruta `/unity/wasm`:** Descarga `VirtualTourVRweb.wasm` con cabecera `Content-Type: application/wasm`.
- **Rutas `/unity/video360`, `/unity/crimson`, `/unity/cereal`:**
  - Redirigen y proxifican las descargas de los videos MP4 alojados en los releases de `Exchange-HTW/SNNU`.
  - Gestionan solicitudes HTTP `OPTIONS` (Preflight) y propagan cabeceras `Range`, `Content-Length` y `Content-Range` para permitir reproducción fluida con streaming y rebobinado (seeking).

---

## 7. Pipelines de Datos y Herramientas Auxiliares (`tools/`)

### 7.1 Auditoría de Publicaciones (`tools/audit_publications.py`)
- **Entrada:** `papers.csv` (lista de títulos y DOIs).
- **Funcionalidad:**
  - Consulta las APIs de **OpenAlex** y **Crossref** para verificar títulos, coautores completos, año de publicación y tipo de licencia.
  - Identifica URLs de descarga de PDF con licencias compatibles (Creative Commons / Open Access).
  - Descarga los archivos PDF a `frontend/public/publication/` con nombres normalizados basados en hash SHA-1 (`{year}_{firstAuthor}_{slugTitle}_{hash}.pdf`).
- **Salida:**
  - `manifest.csv`: Archivo con el resumen de DOIs auditados, licencia y nombre del archivo local.
  - `backend/base_data/sections/publication.py`: Módulo Python que exporta la estructura `PUBLICATION_SECTION` con todas las tarjetas formateadas en HTML listo para renderizado.

### 7.2 Sincronización de Retratos (`tools/sync_people_photos.py`)
- Realiza scraping del sitio oficial de la universidad (`https://www.snnu.uni-saarland.de/?page_id=29`).
- Extrae imágenes oficiales de los miembros del equipo, las normaliza en formato `.jpg` o `.png` y las guarda en `frontend/public/image/people/`.
- Genera el reporte `people_photos.csv`.

### 7.3 Script de Reconstrucción de Publicaciones (`restore_publications.py`)
- Script independiente creado para regenerar `backend/base_data/sections/publication.py` a partir de `manifest.csv` sin necesidad de volver a consultar las APIs externas de OpenAlex o Crossref.

---

## 8. Guía de Ejecución y Operación

### 8.1 Ejecución Rápida en Entorno Local (Linux / macOS)
Se proporciona el script `start_demo.sh` listo para ejecutar:
```bash
./start_demo.sh
```
*Este script detecta automáticamente el directorio del proyecto, activa el entorno virtual de Python, configura las variables de entorno de Ollama y CORS, levanta FastAPI en el puerto 8000, inicia Vite en el puerto 5174/5173 y maneja el cierre limpio de ambos procesos al pulsar `Ctrl + C`.*

### 8.2 Ejecución Manual por Terminales Separadas

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export OLLAMA_HOST="http://localhost:11434"
export OLLAMA_MODEL="translategemma:4b"
export CORS_ORIGINS="http://localhost:5173,http://localhost:5174"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend (React):**
```bash
cd frontend
npm install
npm run dev
```

### 8.3 Despliegue en Cloudflare Workers
```bash
cd frontend
npm run build
cd ..
npx wrangler deploy
```

---

## 9. Estado de Control de Versiones (Git)

- **Repositorio Remoto:** `https://github.com/Exchange-HTW/SNNU.git`
- **Ramas Principales:**
  - `main`: Rama de producción principal que integra toda la arquitectura moderna con React 19 y FastAPI, fusionada mediante commit de integración limpia con el historial original.
  - `version-react`: Rama de desarrollo y respaldo que contiene la arquitectura inicial migrada.
  - `update_worker_name_to_snnu`: Rama generada por el bot de Cloudflare para sincronizar el identificador del worker a `"snnu"`.
- **Commits Clave:**
  - `5d81018`: Último commit del proyecto original basado en Unity WebXR.
  - `5920335`: Commit inicial del respaldo de la nueva arquitectura React + FastAPI.
  - `7ee0625`: Integración de `start_demo.sh` y configuración de `wrangler.jsonc`.
  - `41777f8`: Commit de merge en `main` que conecta el historial previo con la versión moderna.

---

## 10. Consideraciones Clave para el Modelo que Redactará la Documentación

1. **Enfoque en Privacidad Médica:** Resaltar que el diseño del portal utiliza Ollama para cumplir con normativas de protección de datos en neurotecnología clínica (evitando el envío de datos de pacientes o investigación a APIs comerciales en la nube).
2. **Desacoplamiento Estático / Dinámico:** El frontend puede desplegarse en cualquier CDN estático (Cloudflare Pages/Workers, Netlify, Vercel) y operar de forma independiente al backend; si el backend FastAPI o el servidor Ollama están apagados, el frontend se degrada elegantemente mostrando el contenido en inglés por defecto (`INITIAL_PAGE_DATA`).
3. **Escalabilidad del Proxy:** Los archivos grandes de Unity y video 360 no saturan el servidor de la universidad ni el repositorio de código, sino que se transmiten mediante streaming transparente en el edge utilizando releases de GitHub como almacenamiento de objetos sin costo.

