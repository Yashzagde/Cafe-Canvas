// @ts-nocheck
// Secure context bridge for Electron native window integration
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => process.platform,
  getAppVersion: () => '1.0.0',
  printReceipt: (htmlContent) => ipcRenderer.send('print-receipt-silent', htmlContent),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  toggleFullScreen: () => ipcRenderer.send('window-fullscreen'),
  closeWindow: () => ipcRenderer.send('window-close')
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('CafeCanvas Native Desktop environment initialized.');
});
