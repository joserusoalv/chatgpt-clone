# ChatGPT Clone — Angular 20 (standalone, OnPush, zoneless-friendly)

Plantilla base con:

- Standalone components y **OnPush**.
- Convención Angular 20: **sin sufijos** `.component` ni `Component/Service` en nombres/clases.
- **Signals** y `output()`.
- **Streaming** con flag: `SSE` (EventSource) | `Fetch` (ReadableStream) | `mock`.
- **Markdown** con `marked` + `highlight.js` + botón **Copiar** en cada bloque.
- **Electron** (dev/prod), **auto-update** opcional y **seguridad** reforzada.
- **CI** (GitHub Actions) para releases multi-OS.

> Este ZIP contiene el **esqueleto** (`src/`, `server/`, `electron/`, workflow, etc.). Úsalo sobre un proyecto Angular 20 creado con CLI.

## Inicio rápido

```bash
npm i
npm run dev     # levanta server, Angular y Electron
```

### Dependencias clave

```bash
npm i marked highlight.js
npm i -D electron concurrently wait-on cross-env electron-builder electron-updater
```

### Proxy a backend dev

`proxy.conf.json` (incluido) enruta `/api` → `http://localhost:3000`

### Streaming (flag)

`src/shared/stream/config.ts`:

```ts
export const STREAM_TRANSPORT: "sse" | "fetch" | "mock" = "sse";
export const SSE_ENDPOINT = "/api/sse"; // GET ?prompt=...
export const FETCH_ENDPOINT = "/api/stream"; // POST {prompt}
```

### Electron (dev)

- Carga `http://localhost:4200` (Angular dev server) en la ventana de escritorio.
- Producción: `file://.../dist/browser/index.html`.

### Build Desktop

```bash
npm run dist
```

Artefactos en `dist/electron/`.

### Auto-update

- Actívalo con `ENABLE_AUTO_UPDATE=1` en producción.
- Requiere `publish` configurado (p. ej. GitHub) + `GH_TOKEN` en CI/entorno.

### CI (GitHub Actions)

- Workflow `Release Desktop` que publica artefactos para Win/macOS/Linux al hacer push de tag `v*.*.*`.

---

## Estructura

- `app/layout/*` (layout con sidebar)
- `features/chat/*` (page, list, input, toolbar)
- `core/services/*` (`chat.ts` hace streaming/draft/commit)
- `core/stream/*` (SSE/Fetch/mock)
- `shared/markdown/md-view.ts` (Markdown + highlight + copiar)
- `server/server.js` (endpoints de ejemplo)
- `electron/*` (main/preload + assets)
- `.github/workflows/release.yml` (CI)
