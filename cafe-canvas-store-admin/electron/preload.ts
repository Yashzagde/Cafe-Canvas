import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow:   () => ipcRenderer.send('window:minimize'),
  maximizeWindow:   () => ipcRenderer.send('window:maximize'),
  closeWindow:      () => ipcRenderer.send('window:close'),

  // Secure storage
  getSecureItem:    (key: string)               => ipcRenderer.invoke('secure:get', key),
  setSecureItem:    (key: string, val: string)  => ipcRenderer.invoke('secure:set', key, val),
  removeSecureItem: (key: string)               => ipcRenderer.invoke('secure:remove', key),

  // External opening
  openExternal:     (url: string)               => ipcRenderer.invoke('open:external', url),

  // AI chat streams
  sendChatMessage:  (messages: { role: string; content: string }[], systemPrompt: string) => ipcRenderer.invoke('ai:chat-stream', messages, systemPrompt),
  onAiChunk:        (callback: (chunk: string) => void) => {
    const listener = (_event: any, chunk: string) => callback(chunk)
    ipcRenderer.on('ai:chat-chunk', listener)
    return () => ipcRenderer.off('ai:chat-chunk', listener)
  },
  onAiDone:         (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('ai:chat-done', listener)
    return () => ipcRenderer.off('ai:chat-done', listener)
  },
  onAiError:        (callback: (err: string) => void) => {
    const listener = (_event: any, err: string) => callback(err)
    ipcRenderer.on('ai:chat-error', listener)
    return () => ipcRenderer.off('ai:chat-error', listener)
  },

  // Platform info
  platform:         process.platform,
  appVersion:       '1.0.0',
})
