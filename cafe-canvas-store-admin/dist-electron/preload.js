"use strict";
const electron = require("electron");
const electronAPI = {
  // ── Window Controls ─────────────────────────────────────────────────────────
  minimize: () => electron.ipcRenderer.send("window:minimize"),
  maximize: () => electron.ipcRenderer.send("window:maximize"),
  close: () => electron.ipcRenderer.send("window:close"),
  isMaximized: () => electron.ipcRenderer.invoke("window:isMaximized"),
  // ── Portal & Environment ────────────────────────────────────────────────────
  navigateToPortal: (portal) => electron.ipcRenderer.send("portal:navigate", portal),
  switchEnv: (env) => electron.ipcRenderer.send("portal:env", env),
  openKDS: () => electron.ipcRenderer.send("portal:kds"),
  toggleKiosk: () => electron.ipcRenderer.send("portal:kiosk"),
  // ── App State ────────────────────────────────────────────────────────────────
  getState: () => electron.ipcRenderer.invoke("app:state"),
  // ── External URL ─────────────────────────────────────────────────────────────
  openExternal: (url) => electron.ipcRenderer.invoke("open:external", url),
  // ── Secure Storage ───────────────────────────────────────────────────────────
  secureGet: (key) => electron.ipcRenderer.invoke("secure:get", key),
  secureSet: (key, val) => electron.ipcRenderer.invoke("secure:set", key, val),
  secureRemove: (key) => electron.ipcRenderer.invoke("secure:remove", key),
  // ── Gemini AI Streaming ──────────────────────────────────────────────────────
  geminiStream: (messages, systemPrompt) => electron.ipcRenderer.invoke("ai:gemini-stream", messages, systemPrompt),
  // ── Event Subscriptions (return cleanup fn to prevent memory leaks) ──────────
  onAIChunk: (cb) => {
    const handler = (_e, text) => cb(text);
    electron.ipcRenderer.on("ai:chunk", handler);
    return () => {
      electron.ipcRenderer.off("ai:chunk", handler);
    };
  },
  onAIDone: (cb) => {
    const handler = () => cb();
    electron.ipcRenderer.on("ai:done", handler);
    return () => {
      electron.ipcRenderer.off("ai:done", handler);
    };
  },
  onAIError: (cb) => {
    const handler = (_e, err) => cb(err);
    electron.ipcRenderer.on("ai:error", handler);
    return () => {
      electron.ipcRenderer.off("ai:error", handler);
    };
  },
  onUpdateAvailable: (cb) => {
    const handler = () => cb();
    electron.ipcRenderer.on("update:available", handler);
    return () => {
      electron.ipcRenderer.off("update:available", handler);
    };
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
