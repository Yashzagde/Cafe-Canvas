import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import { safeStorage } from 'electron'

// Force light mode — no dark theme
nativeTheme.themeSource = 'light'

let mainWindow: BrowserWindow | null = null

// Custom robust env loading without external dependency
function loadEnv() {
  const envPaths = [
    path.join(app.getAppPath(), '.env.local'),
    path.join(app.getAppPath(), '.env'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ]
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      content.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=')
          if (firstEqual > 0) {
            const key = trimmed.slice(0, firstEqual).trim()
            const val = trimmed.slice(firstEqual + 1).trim().replace(/^['"]|['"]$/g, '')
            if (key && !process.env[key]) {
              process.env[key] = val
            }
          }
        }
      })
    }
  }
}

function createWindow() {
  loadEnv()

  mainWindow = new BrowserWindow({
    width:          1280,
    height:         800,
    minWidth:       1024,
    minHeight:      640,
    frame:          false,        // Custom title bar
    backgroundColor: '#FFF8F0',  // Cafe Canvas cream
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          true,
    },
    icon: path.join(__dirname, '../resources/icon.ico'),
    titleBarStyle: 'hidden',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify().catch((err: any) => {
    console.log('Auto updater check failed:', err)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())

// IPC: External browser opening
ipcMain.handle('open:external', (_e: any, url: string) => {
  shell.openExternal(url)
})

// IPC: Secure storage (using safeStorage)
ipcMain.handle('secure:get', (_e: any, key: string) => {
  try {
    const filePath = path.join(app.getPath('userData'), `${key}.enc`)
    if (fs.existsSync(filePath)) {
      const encrypted = fs.readFileSync(filePath)
      return safeStorage.decryptString(encrypted)
    }
    return null
  } catch (err) {
    console.error('Failed to get secure item:', err)
    return null
  }
})

ipcMain.handle('secure:set', (_e: any, key: string, value: string) => {
  try {
    const encrypted = safeStorage.encryptString(value)
    const filePath = path.join(app.getPath('userData'), `${key}.enc`)
    fs.writeFileSync(filePath, encrypted)
    return true
  } catch (err) {
    console.error('Failed to set secure item:', err)
    return false
  }
})

ipcMain.handle('secure:remove', (_e: any, key: string) => {
  try {
    const filePath = path.join(app.getPath('userData'), `${key}.enc`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  } catch (err) {
    console.error('Failed to remove secure item:', err)
    return false
  }
})

// IPC: Anthropic Chat API Proxy (secure streaming)
ipcMain.handle('ai:chat-stream', async (_e: any, messages: { role: string; content: string }[], systemPrompt: string) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    mainWindow?.webContents.send('ai:chat-error', 'Anthropic API key is not configured in .env.local')
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      mainWindow?.webContents.send('ai:chat-error', `Anthropic API error: ${response.statusText} - ${errText}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      mainWindow?.webContents.send('ai:chat-error', 'Response body is empty')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const cleaned = line.trim()
        if (cleaned.startsWith('data:')) {
          const jsonStr = cleaned.slice(5).trim()
          if (jsonStr === '[DONE]') continue
          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'content_block_delta' && data.delta?.text) {
              mainWindow?.webContents.send('ai:chat-chunk', data.delta.text)
            }
          } catch (e) {
            // Ignore incomplete chunks
          }
        }
      }
    }
    mainWindow?.webContents.send('ai:chat-done')
  } catch (error: any) {
    mainWindow?.webContents.send('ai:chat-error', error.message || 'Error occurred during streaming')
  }
})
