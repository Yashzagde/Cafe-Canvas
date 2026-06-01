/**
 * Electron Main Process Entry Point
 * Store-Admin Desktop App - CafeCanvas
 *
 * Handles app lifecycle, single instance lock, IPC registration,
 * CSP headers, and dev/prod URL loading.
 */

import { app, session, BrowserWindow, protocol, net } from 'electron';
import { createMainWindow } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

// Determine environment
const isDev = !app.isPackaged;

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// ---------- Register Custom Protocol ----------
// This must be done before the app ready event
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true
    }
  }
]);

// ---------- Single Instance Lock ----------

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance — focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  // ---------- App Ready ----------

  app.whenReady().then(async () => {
    // Set Content Security Policy headers
    setupCSP();

    const appRoot = app.getAppPath();
    const outDir = path.join(appRoot, 'Backend-Software', 'Store-Admin', 'frontend', 'out');

    if (!isDev) {
      // Register custom protocol handler for production to serve static Next.js export files
      protocol.handle('app', (request) => {
        try {
          const url = new URL(request.url);
          // url.pathname starts with '/'
          let relativePath = decodeURIComponent(url.pathname);
          let filePath = path.join(outDir, relativePath);

          // If the path corresponds to a directory or doesn't have an extension,
          // check if we need to load index.html or append it (trailingSlash: true behavior)
          try {
            if (fs.existsSync(filePath)) {
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
              }
            } else {
              // If path doesn't exist, try appending .html or index.html
              const htmlPath = filePath + '.html';
              if (fs.existsSync(htmlPath)) {
                filePath = htmlPath;
              } else {
                const dirIndexPath = path.join(filePath, 'index.html');
                if (fs.existsSync(dirIndexPath)) {
                  filePath = dirIndexPath;
                }
              }
            }
          } catch (err) {
            console.error('[CafeCanvas Protocol] stat error:', err);
          }

          console.log(`[CafeCanvas Protocol] Serving: ${request.url} -> ${filePath}`);
          
          if (fs.existsSync(filePath)) {
            return net.fetch(pathToFileURL(filePath).toString());
          } else {
            console.error(`[CafeCanvas Protocol] File not found: ${filePath}`);
            // Return 404
            const fallback404 = path.join(outDir, '404.html');
            if (fs.existsSync(fallback404)) {
              return net.fetch(pathToFileURL(fallback404).toString());
            }
            return new Response('404 Not Found', { status: 404 });
          }
        } catch (error: any) {
          console.error('[CafeCanvas Protocol] Request error:', error);
          return new Response(`Error: ${error.message}`, { status: 500 });
        }
      });
    }

    // Create the main browser window
    mainWindow = createMainWindow();

    // Register all IPC handlers
    registerIpcHandlers(mainWindow);

    // Load the appropriate URL
    try {
      if (isDev) {
        // In development, load the Next.js dev server
        const devUrl = process.env.ELECTRON_DEV_URL || 'http://localhost:3005';
        await mainWindow.loadURL(devUrl);
      } else {
        console.log('[CafeCanvas] App root:', appRoot);
        console.log('[CafeCanvas] Out dir:', outDir);
        console.log('[CafeCanvas] Loading main url: app://local/');
        await mainWindow.loadURL('app://local/');
      }
    } catch (error: any) {
      console.error('Failed to load application URL:', error);
      mainWindow.loadURL(
        `data:text/html,<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0;"><div style="text-align:center;"><h1>Failed to Start</h1><p>The application could not connect to the server.</p><p style="color:#888;font-size:0.85em;">${error.message || 'Unknown error'}</p><p style="color:#888;font-size:0.85em;">Please restart the application.</p></div></body></html>`
      );
    }

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });

  // ---------- macOS Re-activation (included for completeness) ----------

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
}

// ---------- Window All Closed ----------

app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ---------- Graceful Shutdown ----------

app.on('before-quit', async () => {
  // Cleanup if needed
});

// Handle uncaught exceptions to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// ---------- CSP Setup ----------

function setupCSP(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const cspDirectives = [
      "default-src 'self' app:",
      // Allow connections to the Next.js dev server, prod server, backend API, and Supabase
      `connect-src 'self' app: http://localhost:* https://*.supabase.co https://*.supabase.in wss://*.supabase.co http://localhost:5000`,
      // Allow scripts from self; unsafe-inline needed for Next.js
      "script-src 'self' app: 'unsafe-inline' 'unsafe-eval'",
      // Allow styles from self and inline (Next.js injects styles)
      "style-src 'self' app: 'unsafe-inline' https://fonts.googleapis.com",
      // Allow images from self, data URIs, and blob
      "img-src 'self' app: data: blob: https://*.supabase.co",
      // Allow fonts from self and Google Fonts
      "font-src 'self' app: https://fonts.gstatic.com data:",
      // Allow media from self
      "media-src 'self' app: blob:",
      // Disallow iframes except self
      "frame-src 'self' app:",
      // Disallow object/embed
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self' app:",
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives],
      },
    });
  });
}
