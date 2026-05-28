import { ipcMain, BrowserWindow, Notification } from 'electron';

export function registerIpcHandlers(mainWindow: BrowserWindow | null) {
  // Handle silent thermal receipt printing
  ipcMain.handle('print-receipt', async (event, htmlContent: string) => {
    if (!mainWindow) return { success: false, error: 'Main window not initialized' };

    try {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      printWindow.webContents.print({
        silent: true,
        printBackground: true,
        margins: { marginType: 'none' },
      }, (success, errorType) => {
        printWindow.destroy();
      });

      return { success: true };
    } catch (err: any) {
      console.error('Local printing failed:', err);
      return { success: false, error: err.message };
    }
  });

  // Handle local push notifications
  ipcMain.on('send-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });
}
