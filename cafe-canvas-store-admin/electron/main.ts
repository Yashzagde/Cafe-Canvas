/**
 * CafeCanvas Restaurant OS — Electron Main Process
 * ─────────────────────────────────────────────────
 * AntiGravity v1.0 | No TODOs | No pseudo-code | Fully typed | Full error handling
 * Best-of: V1 (portal nav + env switch + CSP + menu) + V2 (TS + IPC + safeStorage + updater)
 * New: Gemini 3.5Flash proxy | KDS dual-display | Kiosk mode | System tray | Structured logger
 */

import {
  app, BrowserWindow, Menu, Tray, nativeImage,
  ipcMain, nativeTheme, shell, session, screen, dialog
} from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import { safeStorage } from 'electron'

// ─── Force Light Mode ──────────────────────────────────────────────────────────
nativeTheme.themeSource = 'light'

// ─── Type Definitions ──────────────────────────────────────────────────────────
type Portal      = 'admin' | 'pos' | 'kds' | 'storefront' | 'superadmin'
type Environment = 'production' | 'local'

interface GeminiMessage {
  role:    'user' | 'assistant'
  content: string
}

interface AppState {
  currentEnv:    Environment
  currentPortal: Portal
  isKioskMode:   boolean
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const APP_VERSION = app.getVersion()

const ENV_SERVERS: Record<Environment, string> = {
  production: 'https://cafecanvas.bar',
  local:      'http://localhost:5173'
}

const PORTAL_ROUTES: Record<Portal, string> = {
  admin:      '/admin',
  pos:        '/staff',
  kds:        '/kos',
  storefront: '/demo',
  superadmin: '/superadmin'
}

const PORTAL_LABELS: Record<Portal, string> = {
  admin:      '🏠  Admin Dashboard',
  pos:        '📋  Waiter POS',
  kds:        '🍳  Kitchen KDS',
  storefront: '🛒  Diner Storefront',
  superadmin: '⚙️  Super Admin'
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

// ─── Runtime State ─────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null
let kdsWindow:  BrowserWindow | null = null
let tray:       Tray | null          = null

const state: AppState = {
  currentEnv:    'production',
  currentPortal: 'admin',
  isKioskMode:   false
}

// ─── Structured Logger ─────────────────────────────────────────────────────────
const log = {
  info:  (msg: string, meta?: unknown): void =>
    console.log(`[CC-OS] INFO  ${new Date().toISOString()} | ${msg}`, meta ?? ''),
  warn:  (msg: string, meta?: unknown): void =>
    console.warn(`[CC-OS] WARN  ${new Date().toISOString()} | ${msg}`, meta ?? ''),
  error: (msg: string, meta?: unknown): void =>
    console.error(`[CC-OS] ERROR ${new Date().toISOString()} | ${msg}`, meta ?? '')
}

// ─── .env Loader (no external deps) ───────────────────────────────────────────
function loadEnv(): void {
  const candidates: string[] = [
    path.join(app.getAppPath(), '.env.local'),
    path.join(app.getAppPath(), '.env'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ]

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
        if (key && !process.env[key]) process.env[key] = val
      }
      log.info(`Env loaded: ${envPath}`)
      return
    } catch (err) {
      log.error(`Env read failed: ${envPath}`, err)
    }
  }
  log.warn('No .env file found — using OS environment variables only')
}

// ─── URL Builder ───────────────────────────────────────────────────────────────
function buildUrl(portal: Portal, env: Environment): string {
  return `${ENV_SERVERS[env]}${PORTAL_ROUTES[portal]}`
}

// ─── CSP Middleware (from V1 — preserves auth cookies + websockets) ────────────
function applyCSP(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https: wss: 'unsafe-inline' 'unsafe-eval' data: blob:;"
        ]
      }
    })
  })
  log.info('CSP middleware applied')
}

// ─── Main Window ───────────────────────────────────────────────────────────────
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width:           1280,
    height:          800,
    minWidth:        1024,
    minHeight:       640,
    frame:           false,           // Custom title bar (from V2)
    backgroundColor: '#FFF8F0',       // CafeCanvas cream
    show:            false,           // Prevent flash before ready
    icon:            path.join(__dirname, '../resources/icon.ico'),
    titleBarStyle:   'hidden',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          true
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    log.info('Main window shown')
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
    log.info('Dev: loaded http://localhost:5173')
  } else {
    const url = buildUrl(state.currentPortal, state.currentEnv)
    mainWindow.loadURL(url)
    log.info(`Production: loaded ${url}`)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    log.info('Main window closed')
  })

  buildAppMenu()
}

// ─── KDS Secondary Display Window ──────────────────────────────────────────────
function createKDSWindow(): void {
  if (kdsWindow && !kdsWindow.isDestroyed()) {
    kdsWindow.focus()
    return
  }

  const allDisplays   = screen.getAllDisplays()
  const primaryId     = screen.getPrimaryDisplay().id
  const secondDisplay = allDisplays.find(d => d.id !== primaryId)
  const bounds        = secondDisplay?.bounds ?? { x: 100, y: 100, width: 1024, height: 768 }

  kdsWindow = new BrowserWindow({
    x:               bounds.x,
    y:               bounds.y,
    width:           bounds.width,
    height:          bounds.height,
    frame:           false,
    backgroundColor: '#111827',     // Dark KDS background
    fullscreen:      !!secondDisplay,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          true
    }
  })

  const kdsUrl = buildUrl('kds', state.currentEnv)
  kdsWindow.loadURL(kdsUrl)
  log.info(`KDS window: ${kdsUrl} on display ${secondDisplay?.id ?? 'primary (fallback)'}`)

  kdsWindow.on('closed', () => {
    kdsWindow = null
    log.info('KDS window closed')
  })
}

// ─── Navigation Helpers ────────────────────────────────────────────────────────
function navigateToPortal(portal: Portal): void {
  state.currentPortal = portal
  const url = buildUrl(portal, state.currentEnv)
  mainWindow?.loadURL(url)
  buildAppMenu()
  buildTrayMenu()
  log.info(`Portal → ${portal}: ${url}`)
}

function switchEnvironment(env: Environment): void {
  if (state.currentEnv === env) return
  state.currentEnv = env
  const url = buildUrl(state.currentPortal, env)
  mainWindow?.loadURL(url)
  buildAppMenu()
  log.info(`Environment → ${env}`)
}

function toggleKioskMode(): void {
  state.isKioskMode = !state.isKioskMode
  mainWindow?.setKiosk(state.isKioskMode)
  buildAppMenu()
  log.info(`Kiosk mode → ${state.isKioskMode}`)
}

// ─── System Tray ───────────────────────────────────────────────────────────────
function createTray(): void {
  const iconPath = path.join(__dirname, '../resources/tray-icon.png')

  // Gracefully fall back to empty icon if file is missing in dev
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty()

  tray = new Tray(icon)
  tray.setToolTip(`CafeCanvas Restaurant OS v${APP_VERSION}`)
  buildTrayMenu()

  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
  log.info('System tray created')
}

// ─── Tray Menu ─────────────────────────────────────────────────────────────────
function buildTrayMenu(): void {
  if (!tray) return

  const portalItems = (Object.keys(PORTAL_LABELS) as Portal[]).map(portal => ({
    label:   PORTAL_LABELS[portal],
    type:    'radio' as const,
    checked: state.currentPortal === portal,
    click:   (): void => {
      navigateToPortal(portal)
      mainWindow?.show()
      mainWindow?.focus()
    }
  }))

  const menu = Menu.buildFromTemplate([
    { label: `CafeCanvas v${APP_VERSION}`, enabled: false },
    { type: 'separator' },
    ...portalItems,
    { type: 'separator' },
    { label: 'Open KDS on Second Display', click: () => createKDSWindow() },
    { type: 'separator' },
    { label: 'Show Window', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { label: 'Quit',        click: () => app.quit() }
  ])

  tray.setContextMenu(menu)
}

// ─── Application Menu (from V1, adapted to TypeScript + V2 features) ───────────
function buildAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'CafeCanvas',
      submenu: [
        { label: `About CafeCanvas v${APP_VERSION}`, role: 'about' },
        { type: 'separator' },
        { label: 'Check for Updates…', click: () => autoUpdater.checkForUpdates() },
        { type: 'separator' },
        { label: 'Hide',        role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { label: 'Show All',    role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit CafeCanvas', role: 'quit' }
      ]
    },
    {
      label: 'Portal',
      submenu: [
        {
          label:       '🏠  Admin Dashboard',
          accelerator: 'CmdOrCtrl+1',
          type:        'checkbox',
          checked:     state.currentPortal === 'admin',
          click:       () => navigateToPortal('admin')
        },
        {
          label:       '📋  Waiter POS',
          accelerator: 'CmdOrCtrl+2',
          type:        'checkbox',
          checked:     state.currentPortal === 'pos',
          click:       () => navigateToPortal('pos')
        },
        {
          label:       '🍳  Kitchen KDS',
          accelerator: 'CmdOrCtrl+3',
          type:        'checkbox',
          checked:     state.currentPortal === 'kds',
          click:       () => navigateToPortal('kds')
        },
        {
          label:       '🛒  Diner Storefront',
          accelerator: 'CmdOrCtrl+4',
          type:        'checkbox',
          checked:     state.currentPortal === 'storefront',
          click:       () => navigateToPortal('storefront')
        },
        {
          label:       '⚙️  Super Admin',
          accelerator: 'CmdOrCtrl+5',
          type:        'checkbox',
          checked:     state.currentPortal === 'superadmin',
          click:       () => navigateToPortal('superadmin')
        },
        { type: 'separator' },
        {
          label:       '🖥️  Open KDS on Second Display',
          accelerator: 'CmdOrCtrl+K',
          click:       () => createKDSWindow()
        }
      ]
    },
    {
      label: 'Environment',
      submenu: [
        {
          label:   '🌐  Production (cafecanvas.bar)',
          type:    'checkbox',
          checked: state.currentEnv === 'production',
          click:   () => switchEnvironment('production')
        },
        {
          label:   '💻  Local Dev (localhost:5173)',
          type:    'checkbox',
          checked: state.currentEnv === 'local',
          click:   () => switchEnvironment('local')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label:       'Reload',
          accelerator: 'CmdOrCtrl+R',
          click:       () => mainWindow?.webContents.reload()
        },
        {
          label:       'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click:       () => mainWindow?.webContents.reloadIgnoringCache()
        },
        {
          label:       'Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click:       () => mainWindow?.webContents.toggleDevTools()
        },
        { type: 'separator' },
        {
          label:       'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click:       () => mainWindow?.webContents.setZoomLevel(0)
        },
        {
          label:       'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click:       () => {
            const lvl = mainWindow?.webContents.getZoomLevel() ?? 0
            mainWindow?.webContents.setZoomLevel(lvl + 0.5)
          }
        },
        {
          label:       'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click:       () => {
            const lvl = mainWindow?.webContents.getZoomLevel() ?? 0
            mainWindow?.webContents.setZoomLevel(lvl - 0.5)
          }
        },
        { type: 'separator' },
        {
          label:       state.isKioskMode ? '🔓 Exit Kiosk Mode' : '🔒 Enter Kiosk Mode (POS)',
          accelerator: 'CmdOrCtrl+Shift+K',
          click:       () => toggleKioskMode()
        },
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
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ─── IPC: Window Controls (from V2) ───────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', (): boolean => mainWindow?.isMaximized() ?? false)

// ─── IPC: Portal & Environment (from V1 logic, IPC-wrapped) ───────────────────
ipcMain.on('portal:navigate', (_e, portal: Portal)   => navigateToPortal(portal))
ipcMain.on('portal:env',      (_e, env: Environment) => switchEnvironment(env))
ipcMain.on('portal:kds',      ()                     => createKDSWindow())
ipcMain.on('portal:kiosk',    ()                     => toggleKioskMode())

// ─── IPC: App State ────────────────────────────────────────────────────────────
ipcMain.handle('app:state', (): AppState & { version: string } => ({
  ...state,
  version: APP_VERSION
}))

// ─── IPC: External URL ─────────────────────────────────────────────────────────
ipcMain.handle('open:external', (_e, url: string): void => {
  shell.openExternal(url)
  log.info(`External URL: ${url}`)
})

// ─── IPC: Secure Storage (from V2 — OS keychain via safeStorage) ──────────────
ipcMain.handle('secure:get', (_e, key: string): string | null => {
  try {
    const filePath = path.join(app.getPath('userData'), `${key}.enc`)
    if (!fs.existsSync(filePath)) return null
    const buf = fs.readFileSync(filePath)
    return safeStorage.decryptString(buf)
  } catch (err) {
    log.error(`secure:get key=${key}`, err)
    return null
  }
})

ipcMain.handle('secure:set', (_e, key: string, value: string): boolean => {
  try {
    const encrypted = safeStorage.encryptString(value)
    fs.writeFileSync(path.join(app.getPath('userData'), `${key}.enc`), encrypted)
    log.info(`secure:set key=${key}`)
    return true
  } catch (err) {
    log.error(`secure:set key=${key}`, err)
    return false
  }
})

ipcMain.handle('secure:remove', (_e, key: string): boolean => {
  try {
    const filePath = path.join(app.getPath('userData'), `${key}.enc`)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    log.info(`secure:remove key=${key}`)
    return true
  } catch (err) {
    log.error(`secure:remove key=${key}`, err)
    return false
  }
})

// ─── IPC: Gemini 2.0 Flash AI Proxy (replaces V2's Anthropic handler) ─────────
ipcMain.handle(
  'ai:gemini-stream',
  async (_e, messages: GeminiMessage[], systemPrompt: string): Promise<void> => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      mainWindow?.webContents.send('ai:error', 'GEMINI_API_KEY not set in .env.local')
      return
    }

    // Gemini role format: 'user' | 'model' (not 'assistant')
    const contents = messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const requestBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1024,
        topP:            0.95
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errText = await response.text()
        mainWindow?.webContents.send('ai:error', `Gemini ${response.status}: ${errText}`)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        mainWindow?.webContents.send('ai:error', 'Gemini returned empty body')
        return
      }

      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const clean = line.trim()
          if (!clean.startsWith('data:')) continue
          const jsonStr = clean.slice(5).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue
          try {
            const data = JSON.parse(jsonStr)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
            if (text) mainWindow?.webContents.send('ai:chunk', text)
          } catch {
            // Incomplete SSE chunk — continue buffering
          }
        }
      }

      mainWindow?.webContents.send('ai:done')
      log.info(`Gemini stream complete (model=${GEMINI_MODEL})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown Gemini error'
      mainWindow?.webContents.send('ai:error', msg)
      log.error('Gemini stream error', err)
    }
  }
)

// ─── Auto Updater (from V2, enhanced with dialog) ──────────────────────────────
function setupAutoUpdater(): void {
  autoUpdater.on('update-available', () => {
    log.info('Update available — downloading…')
    mainWindow?.webContents.send('update:available')
  })

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded — prompting restart')
    dialog.showMessageBox({
      type:    'info',
      title:   'CafeCanvas Update Ready',
      message: 'A new version of CafeCanvas Restaurant OS is ready.\nRestart now to apply the update.',
      buttons: ['Restart Now', 'Later']
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', (err: Error) => {
    log.error('Auto-updater error', err.message)
  })

  autoUpdater.checkForUpdatesAndNotify().catch((err: unknown) => {
    log.warn('Auto-update check failed (non-critical)', err)
  })
}

// ─── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then((): void => {
  loadEnv()
  applyCSP()
  createMainWindow()
  createTray()
  setupAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  log.info(`CafeCanvas Restaurant OS v${APP_VERSION} started | env=${state.currentEnv}`)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  log.info('CafeCanvas Restaurant OS shutting down')
})
