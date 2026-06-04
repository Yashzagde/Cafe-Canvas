export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  getSecureItem: (key: string) => Promise<string | null>;
  setSecureItem: (key: string, val: string) => Promise<boolean>;
  removeSecureItem: (key: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;
  sendChatMessage: (messages: { role: string; content: string }[], systemPrompt: string) => Promise<void>;
  onAiChunk: (callback: (chunk: string) => void) => () => void;
  onAiDone: (callback: () => void) => () => void;
  onAiError: (callback: (err: string) => void) => () => void;
  platform: string;
  appVersion: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
