/**
 * CafeCanvas Restaurant OS — Electron Preload (Context Bridge)
 * ────────────────────────────────────────────────────────────
 * AntiGravity v1.0 | Fully typed | Named exports to renderer via window.electronAPI
 * All handlers return cleanup functions to prevent memory leaks.
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// ─── Shared Types (mirrors main.ts) ───────────────────────────────────────────
type Portal      = 'admin' | 'pos' | 'kds' | 'storefront' | 'superadmin'
type Environment = 'production' | 'local'

interface GeminiMessage {
  role:    'user' | 'assistant'
  content: string
}

interface AppStatePayload {
  currentEnv:    Environment
  currentPortal: Portal
  isKioskMode:   boolean
  version:       string
}

// ─── Context Bridge API ───────────────────────────────────────────────────────
const electronAPI = {

  // ── Window Controls ─────────────────────────────────────────────────────────
  minimize:    (): void    => ipcRenderer.send('window:minimize'),
  maximize:    (): void    => ipcRenderer.send('window:maximize'),
  close:       (): void    => ipcRenderer.send('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),

  // ── Portal & Environment ────────────────────────────────────────────────────
  navigateToPortal: (portal: Portal):      void => ipcRenderer.send('portal:navigate', portal),
  switchEnv:        (env: Environment):    void => ipcRenderer.send('portal:env', env),
  openKDS:          ():                    void => ipcRenderer.send('portal:kds'),
  toggleKiosk:      ():                    void => ipcRenderer.send('portal:kiosk'),

  // ── App State ────────────────────────────────────────────────────────────────
  getState: (): Promise<AppStatePayload> => ipcRenderer.invoke('app:state'),

  // ── External URL ─────────────────────────────────────────────────────────────
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open:external', url),

  // ── Secure Storage ───────────────────────────────────────────────────────────
  secureGet:    (key: string):              Promise<string | null> => ipcRenderer.invoke('secure:get', key),
  secureSet:    (key: string, val: string): Promise<boolean>       => ipcRenderer.invoke('secure:set', key, val),
  secureRemove: (key: string):              Promise<boolean>        => ipcRenderer.invoke('secure:remove', key),

  // ── Gemini AI Streaming ──────────────────────────────────────────────────────
  geminiStream: (messages: GeminiMessage[], systemPrompt: string): Promise<void> =>
    ipcRenderer.invoke('ai:gemini-stream', messages, systemPrompt),

  // ── Event Subscriptions (return cleanup fn to prevent memory leaks) ──────────
  onAIChunk: (cb: (text: string) => void): (() => void) => {
    const handler = (_e: IpcRendererEvent, text: string): void => cb(text)
    ipcRenderer.on('ai:chunk', handler)
    return (): void => { ipcRenderer.off('ai:chunk', handler) }
  },

  onAIDone: (cb: () => void): (() => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('ai:done', handler)
    return (): void => { ipcRenderer.off('ai:done', handler) }
  },

  onAIError: (cb: (err: string) => void): (() => void) => {
    const handler = (_e: IpcRendererEvent, err: string): void => cb(err)
    ipcRenderer.on('ai:error', handler)
    return (): void => { ipcRenderer.off('ai:error', handler) }
  },

  onUpdateAvailable: (cb: () => void): (() => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('update:available', handler)
    return (): void => { ipcRenderer.off('update:available', handler) }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// ─── Type Export for Renderer TypeScript ──────────────────────────────────────
export type ElectronAPI = typeof electronAPI
