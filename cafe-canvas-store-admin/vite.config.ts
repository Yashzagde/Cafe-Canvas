import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Electron main process
        entry: 'electron/main.ts',
        onstart(options: any) {
          options.startup()
        },
      },
      {
        // Electron preload bridge
        entry: 'electron/preload.ts',
        onstart(options: any) {
          options.reload()
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
})
