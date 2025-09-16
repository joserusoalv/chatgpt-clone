/**
 * Electron main with auto-update (optional), embedded server (optional), and security hardening.
 */
import { spawn } from "child_process";
import { app, BrowserWindow, session, shell } from "electron";
import path from "path";
import url, { fileURLToPath } from "url";

let updaterAvailable = false;
try {
  const { autoUpdater } = await import("electron-updater");
  globalThis.__autoUpdater = autoUpdater;
  updaterAvailable = true;
} catch {
  updaterAvailable = false;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const ANGULAR_URL = process.env.ANGULAR_URL || "http://localhost:4200";
const EMBEDDED_SERVER = process.env.EMBEDDED_SERVER === "1";
const ENABLE_AUTO_UPDATE = process.env.ENABLE_AUTO_UPDATE === "1";
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3000);
const ALLOWED_DEV_ORIGINS = new Set([
  ANGULAR_URL,
  `http://localhost:${BACKEND_PORT}`,
  `http://127.0.0.1:${BACKEND_PORT}`,
]);

let serverProc = null;
function startEmbeddedServer() {
  if (!EMBEDDED_SERVER) return;
  const serverPath = path.join(__dirname, "..", "server", "server.js");
  serverProc = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: String(BACKEND_PORT) },
    stdio: "inherit",
  });
  serverProc.on("exit", (code) =>
    console.log("[embedded-server] exited", code),
  );
}
function stopEmbeddedServer() {
  if (serverProc) {
    try {
      serverProc.kill();
    } catch {}
    serverProc = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    win.loadURL(ANGULAR_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = url.format({
      protocol: "file",
      slashes: true,
      pathname: path.join(
        process.resourcesPath,
        "dist",
        "browser",
        "index.html",
      ),
    });
    win.loadURL(indexPath);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      new URL(url);
    } catch {
      return { action: "deny" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, navUrl) => {
    if (isDev) {
      if (Array.from(ALLOWED_DEV_ORIGINS).some((o) => navUrl.startsWith(o)))
        return;
    } else {
      if (navUrl.startsWith("file://")) return;
    }
    e.preventDefault();
    shell.openExternal(navUrl);
  });

  return win;
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders || {};
    const connectSrc = isDev
      ? `'self' http://localhost:${BACKEND_PORT} http://127.0.0.1:${BACKEND_PORT}`
      : `'self'`;
    const csp = [
      `default-src 'self'`,
      `script-src 'self'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data:`,
      `font-src 'self' data:`,
      `connect-src ${connectSrc}`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ");
    headers["Content-Security-Policy"] = [csp];
    callback({ responseHeaders: headers });
  });

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const reqUrl = details.url;
    if (reqUrl.startsWith("file://")) return callback({ cancel: false });
    if (
      isDev &&
      Array.from(ALLOWED_DEV_ORIGINS).some((o) => reqUrl.startsWith(o))
    )
      return callback({ cancel: false });
    if (!isDev && /^https?:\/\//.test(reqUrl))
      return callback({ cancel: true });
    callback({ cancel: false });
  });

  startEmbeddedServer();
  const win = createWindow();

  if (!isDev && ENABLE_AUTO_UPDATE && updaterAvailable) {
    try {
      globalThis.__autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      console.warn("[auto-update] failed", e);
    }
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  stopEmbeddedServer();
});
