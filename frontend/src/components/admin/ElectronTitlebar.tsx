'use client';

import { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

export default function ElectronTitlebar() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Only detect Electron on the client side
    const isApp = typeof window !== 'undefined' && (window as any).electronAPI !== undefined;
    setIsElectron(isApp);

    if (isApp) {
      document.body.classList.add('electron-padding');
    }
  }, []);

  if (!isElectron) return null;

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        backgroundColor: '#0f172a', // Clean dark slate 900
        color: '#94a3b8', // Slate 400 for neutral text
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '12px',
        WebkitAppRegion: 'drag',
        zIndex: 99999,
        userSelect: 'none',
      } as any}
    >
      {/* Title & Branding */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black tracking-wider uppercase text-slate-300">
          Cafe<span className="text-[#d97706]">Canvas</span> OS
        </span>
      </div>

      {/* Control Buttons */}
      <div 
        style={{ WebkitAppRegion: 'no-drag' } as any}
        className="flex items-center h-full"
      >
        <button
          onClick={() => (window as any).electronAPI?.minimizeWindow()}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className="w-11 h-8 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
          title="Minimize"
        >
          <Minus size={14} className="text-slate-400" />
        </button>
        <button
          onClick={() => (window as any).electronAPI?.maximizeWindow()}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className="w-11 h-8 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
          title="Maximize"
        >
          <Square size={10} className="text-slate-400" />
        </button>
        <button
          onClick={() => (window as any).electronAPI?.toggleFullScreen()}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className="w-11 h-8 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Full Screen"
        >
          <Maximize2 size={11} className="text-slate-400" />
        </button>
        <button
          onClick={() => (window as any).electronAPI?.closeWindow()}
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className="w-11 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          title="Close"
        >
          <X size={14} className="text-slate-400 hover:text-white" />
        </button>
      </div>
    </header>
  );
}
