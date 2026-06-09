import { useState, useEffect } from 'react'
import { useTenantStore } from '../../store/tenant.store'

export function StatusBar() {
  const { tenant } = useTenantStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getTierColor = (tier: string = 'Free') => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-canvas-rose/15 text-canvas-rose_dark border-canvas-rose/25'
      case 'Growth':
        return 'bg-canvas-mint/15 text-canvas-mint_deep border-canvas-mint/25'
      case 'Pro':
        return 'bg-canvas-tan/15 text-canvas-brown border-canvas-tan/30'
      default:
        return 'bg-canvas-highlight text-canvas-brown_mid border-canvas-border'
    }
  }

  return (
    <footer className="h-7 bg-canvas-highlight border-t border-canvas-border/60 px-4 flex items-center justify-between text-[11px] font-semibold text-canvas-brown_mid select-none">
      {/* Left: Connection Health */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-canvas-mint_deep animate-pulse' : 'bg-canvas-coral'}`}></span>
        <span>{isOnline ? 'Live Backend Connected' : 'Offline Mode (Local Cache)'}</span>
      </div>

      {/* Center: Tenant details & tier */}
      {tenant && (
        <div className="flex items-center gap-2">
          <span>Tenant: <strong className="text-canvas-brown">{tenant.name}</strong></span>
          <span className="text-canvas-border">|</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getTierColor(tenant.subscription_tier)}`}>
            {tenant.subscription_tier} Tier
          </span>
        </div>
      )}

      {/* Right: App Version */}
      <div>
        <span>v1.0.0</span>
      </div>
    </footer>
  )
}
