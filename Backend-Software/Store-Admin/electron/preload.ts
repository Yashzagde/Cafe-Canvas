import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (html: string) => ipcRenderer.invoke('print-receipt', html),
  sendNotification: (title: string, body: string) => ipcRenderer.send('send-notification', { title, body }),
});
