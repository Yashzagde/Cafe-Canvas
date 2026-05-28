/**
 * Electron Main Process Entry Point
 * Store-Admin Desktop App - CafeCanvas
 *
 * Handles app lifecycle, single instance lock, IPC registration,
 * CSP headers, and dev/prod URL loading.
 */

import { app, session, BrowserWindow } from 'electron';
import { createMainWindow } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';
import { startNextServer, stopNextServer } from './next-server';

// Determine environment
const isDev = !app.isPackaged;

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

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

    // Create the main browser window
    mainWindow = createMainWindow();

    // Register all IPC handlers
    registerIpcHandlers(mainWindow);

    // Load the appropriate URL
    try {
      if (isDev) {
        // In development, load the Next.js dev server
        const devUrl = 'http://localhost:3000';
        await mainWindow.loadURL(devUrl);
      } else {
        // In production, start the bundled Next.js server
        const prodUrl = await startNextServer();
        await mainWindow.loadURL(prodUrl);
      }
    } catch (error) {
      console.error('Failed to load application URL:', error);
      // Show an error page or retry logic could go here
      mainWindow.loadURL(
        `data:text/html,<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0;"><div style="text-align:center;"><h1>Failed to Start</h1><p>The application could not connect to the server.</p><p style="color:#888;font-size:0.85em;">Please restart the application.</p></div></body></html>`
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
  // Stop the Next.js production server if running
  stopNextServer();
});

app.on('will-quit', () => {
  // Final cleanup
  stopNextServer();
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
      "default-src 'self'",
      // Allow connections to the Next.js dev server, prod server, backend API, and Supabase
      `connect-src 'self' http://localhost:* https://*.supabase.co https://*.supabase.in wss://*.supabase.co http://localhost:5000`,
      // Allow scripts from self; unsafe-inline needed for Next.js
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Allow styles from self and inline (Next.js injects styles)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Allow images from self, data URIs, and blob
      "img-src 'self' data: blob: https://*.supabase.co",
      // Allow fonts from self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Allow media from self
      "media-src 'self' blob:",
      // Disallow iframes except self
      "frame-src 'self'",
      // Disallow object/embed
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives],
      },
    });
  });
}
