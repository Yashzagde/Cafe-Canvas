import { useTenantStore } from '../../store/tenant.store'
import logoUrl from '../../assets/logo.png'

export function TitleBar({ title }: { title: string }) {
  const { tenant } = useTenantStore()
  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

  return (
    <div
      className="h-10 flex items-center justify-between px-4 select-none border-b border-canvas-border/40 titlebar-drag"
      style={{
        background: 'linear-gradient(135deg, #4A3728 0%, #5D4A3A 100%)',
      }}
    >
      {/* Left: Logo + Screen */}
      <div className="flex items-center gap-2 titlebar-nodrag">
        <img src={logoUrl} alt="Cafe Canvas" className="w-5 h-5 object-contain" />
        <span className="font-display text-sm font-bold tracking-wide text-canvas-cream">Cafe Canvas</span>
        <span className="text-canvas-rose/40 text-xs">·</span>
        <span className="text-canvas-cream/90 text-xs font-semibold">{title}</span>
      </div>

      {/* Center: Draggable Store Name display */}
      <div className="text-canvas-tan/80 text-xs font-semibold font-display tracking-wider truncate max-w-xs uppercase">
        {tenant?.name || 'Cafe Canvas'}
      </div>

      {/* Right: Window Controls (only shown in Electron shell) */}
      {isElectron && (
        <div className="flex items-center gap-0.5 titlebar-nodrag">
          <button
            onClick={() => window.electronAPI.minimize()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-canvas-cream/70 hover:bg-white/8 transition-colors focus:outline-none"
            title="Minimize"
          >
            <span className="text-xs font-bold font-mono">─</span>
          </button>
          <button
            onClick={() => window.electronAPI.maximize()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-canvas-cream/70 hover:bg-white/8 transition-colors focus:outline-none"
            title="Maximize"
          >
            <span className="text-[10px] font-bold">⬜</span>
          </button>
          <button
            onClick={() => window.electronAPI.close()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-canvas-cream/70 hover:bg-red-500/80 hover:text-white transition-colors focus:outline-none"
            title="Close"
          >
            <span className="text-xs font-bold font-mono">✕</span>
          </button>
        </div>
      )}
    </div>
  )
}
