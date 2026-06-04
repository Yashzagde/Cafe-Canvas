import { useTenantStore } from '../../store/tenant.store'
import logoUrl from '../../assets/logo.png'

export function TitleBar({ title }: { title: string }) {
  const { tenant } = useTenantStore()

  return (
    <div
      className="h-10 flex items-center justify-between px-4 select-none bg-canvas-terracotta text-white border-b border-canvas-terra_dark/25 titlebar-drag"
    >
      {/* Left: Logo + Screen */}
      <div className="flex items-center gap-2 titlebar-nodrag">
        <img src={logoUrl} alt="Cafe Canvas" className="w-5 h-5 object-contain" />
        <span className="font-display text-sm font-bold tracking-wide">Cafe Canvas</span>
        <span className="text-white/40 text-xs">·</span>
        <span className="text-white/95 text-xs font-semibold">{title}</span>
      </div>

      {/* Center: Draggable Store Name display */}
      <div className="text-white/80 text-xs font-semibold font-display tracking-wider truncate max-w-xs uppercase">
        {tenant?.name || 'Cafe Canvas'}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-0.5 titlebar-nodrag">
        <button
          onClick={() => window.electronAPI.minimize()}
          className="w-8 h-8 rounded flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors focus:outline-none"
          title="Minimize"
        >
          <span className="text-xs font-bold font-mono">─</span>
        </button>
        <button
          onClick={() => window.electronAPI.maximize()}
          className="w-8 h-8 rounded flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors focus:outline-none"
          title="Maximize"
        >
          <span className="text-[10px] font-bold">⬜</span>
        </button>
        <button
          onClick={() => window.electronAPI.close()}
          className="w-8 h-8 rounded flex items-center justify-center text-white/80 hover:bg-red-500/90 hover:text-white transition-colors focus:outline-none"
          title="Close"
        >
          <span className="text-xs font-bold font-mono">✕</span>
        </button>
      </div>
    </div>
  )
}
