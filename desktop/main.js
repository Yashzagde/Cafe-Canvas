const { app, BrowserWindow, Menu, globalShortcut, session, ipcMain } = require('electron');
const path = require('path');

/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {'production' | 'local'} */
let currentEnv = 'production'; // 'production' or 'local'

/** @type {string} */
let currentRoute = '/admin';   // active page path

// Base targets
/** @type {Record<'production' | 'local', string>} */
const ENV_SERVERS = {
  production: 'https://cafecanvas.bar',
  local: 'http://localhost:3000'
};

/**
 * @returns {string}
 */
function getFullUrl() {
  return `${ENV_SERVERS[currentEnv]}${currentRoute}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'CafeCanvas Store Admin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.webContents.openDevTools();

  // Enable cookies and session storage persistence
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http: https: ws: wss: 'unsafe-inline' 'unsafe-eval' data: blob:;"
        ]
      }
    });
  });

  // Handle failed URL loading (like offline mode or unreachable server)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log(`[Electron] Page failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`);
    
    // Ignore internal page redirects or chrome extension URLs
    if (validatedURL.startsWith('chrome-error://') || validatedURL.startsWith('devtools://')) {
      return;
    }
    
    // Avoid infinite redirect loop if offline.html itself fails to load
    const offlinePagePath = path.join(__dirname, 'offline.html');
    if (validatedURL === offlinePagePath || validatedURL.includes('offline.html')) {
      return;
    }

    // Load offline fallback page and pass target URL
    console.log(`[Electron] Redirecting to offline fallback: offline.html`);
    const offlineUrl = `file://${offlinePagePath}?target=${encodeURIComponent(validatedURL)}`;
    mainWindow?.loadURL(offlineUrl);
  });

  loadCurrentUrl();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup main app menu
  buildAppMenu();
}

function loadCurrentUrl() {
  if (!mainWindow) return;
  const target = getFullUrl();
  console.log(`Loading URL in native shell: ${target}`);
  mainWindow.loadURL(target);
}

/**
 * @param {'production' | 'local'} env
 */
function switchEnvironment(env) {
  if (currentEnv === env) return;
  currentEnv = env;
  loadCurrentUrl();
  buildAppMenu(); // rebuild menu to show checkmarks
}

/**
 * @param {string} route
 */
function navigateToRoute(route) {
  currentRoute = route;
  loadCurrentUrl();
}

function buildAppMenu() {
  /** @type {Array<Electron.MenuItemConstructorOptions | Electron.MenuItem>} */
  const menuTemplate = [
    {
      label: 'CafeCanvas',
      submenu: [
        { label: 'About CafeCanvas', role: 'about' },
        { type: 'separator' },
        { label: 'Hide Software', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit CafeCanvas', role: 'quit' }
      ]
    },
    {
      label: 'Portal Selection',
      submenu: [
        {
          label: 'Tenant Admin Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => navigateToRoute('/admin')
        },
        {
          label: 'Waiter POS App',
          accelerator: 'CmdOrCtrl+2',
          click: () => navigateToRoute('/staff')
        },
        {
          label: 'Kitchen KDS Monitor',
          accelerator: 'CmdOrCtrl+3',
          click: () => navigateToRoute('/kos')
        },
        {
          label: 'Diner Storefront Menu',
          accelerator: 'CmdOrCtrl+4',
          click: () => navigateToRoute('/demo')
        },
        {
          label: 'Super Admin Portal',
          accelerator: 'CmdOrCtrl+S',
          click: () => navigateToRoute('/superadmin')
        }
      ]
    },
    {
      label: 'Environment',
      submenu: [
        {
          label: 'Production Server (Live)',
          type: 'checkbox',
          checked: currentEnv === 'production',
          click: () => switchEnvironment('production')
        },
        {
          label: 'Local Dev Server (Localhost:3000)',
          type: 'checkbox',
          checked: currentEnv === 'local',
          click: () => switchEnvironment('local')
        }
      ]
    },
    {
      label: 'Controls',
      submenu: [
        { label: 'Reload Page', accelerator: 'CmdOrCtrl+R', click: () => { if (mainWindow) mainWindow.webContents.reload(); } },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => { if (mainWindow) mainWindow.webContents.reloadIgnoringCache(); } },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => { if (mainWindow) mainWindow.webContents.toggleDevTools(); }
        },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', click: () => { if (mainWindow) mainWindow.webContents.setZoomLevel(0); } },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => { if (mainWindow) mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5); } },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => { if (mainWindow) mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5); } },
        { type: 'separator' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// App lifecycle hooks
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Silent thermal printing listener
ipcMain.on('print-receipt-silent', (event, htmlContent) => {
  console.log('[Electron] Received silent print request.');
  let workerWindow = new BrowserWindow({ show: false });
  workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  workerWindow.webContents.on('did-finish-load', () => {
    workerWindow.webContents.print({
      silent: true,
      printBackground: true,
      margins: { marginType: 'none' }
    }, (success, errorType) => {
      if (!success) {
        console.error('[Electron] Silent print failed:', errorType);
      } else {
        console.log('[Electron] Silent print completed successfully.');
      }
      workerWindow.close();
    });
  });
});

// Native window controls listeners
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-fullscreen', () => {
  if (mainWindow) {
    const isFS = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFS);
  }
});
ipcMain.on('window-close', () => {
  mainWindow?.close();
});
