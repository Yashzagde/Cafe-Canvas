import { BrowserWindow } from 'electron';
import * as path from 'path';

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'Cafe Canvas — Store Admin Desktop',
    backgroundColor: '#0a0a0c', // Dark charcoal matching premium dashboard theme
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Prevent flicker
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
}
