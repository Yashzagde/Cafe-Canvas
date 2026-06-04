import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Settings, 
  Sparkles, 
  LogOut 
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore, ScreenType } from '../../store/ui.store'

export function Sidebar() {
  const { user, role, signOut } = useAuthStore()
  const { currentScreen, setScreen } = useUIStore()

  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staff' as ScreenType, label: 'Staff Accounts', icon: Users },
    { id: 'locations' as ScreenType, label: 'Locations', icon: MapPin },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
    { id: 'ai' as ScreenType, label: 'AI Assistant', icon: Sparkles },
  ]

  // Extract initials for avatar
  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'AD'
  }

  // Format roles into clean user-facing strings
  const getRoleLabel = () => {
    if (!role) return 'Administrator'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <aside className="w-60 bg-canvas-brown text-canvas-cream flex flex-col justify-between select-none">
      {/* Top Section: Logo & Branding */}
      <div>
        <div className="p-6 border-b border-canvas-brown_mid/20 flex flex-col items-center">
          <div className="w-12 h-12 bg-canvas-terracotta rounded-full flex items-center justify-center border border-canvas-gold mb-3 shadow-md shadow-black/10">
            <span className="font-display text-xl font-bold text-white tracking-widest">CC</span>
          </div>
          <h2 className="font-display text-lg font-bold tracking-wide text-canvas-cream">
            Cafe Canvas
          </h2>
          <span className="text-[10px] font-body text-canvas-gold tracking-widest uppercase mt-0.5">
            Store Admin
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-canvas-terracotta text-white shadow-sm shadow-canvas-terra_dark/20' 
                    : 'text-canvas-cream/80 hover:bg-canvas-brown_mid/20 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-canvas-gold' : 'text-canvas-gold/80 group-hover:text-canvas-gold'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile Card & Logout */}
      <div className="p-4 border-t border-canvas-brown_mid/20 bg-canvas-brown_mid/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-canvas-gold text-canvas-brown font-bold flex items-center justify-center text-xs shadow-inner">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">
              {user?.email || 'Store Manager'}
            </p>
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-canvas-gold/15 text-canvas-gold border border-canvas-gold/20 mt-1 uppercase tracking-wider">
              {getRoleLabel()}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-transparent hover:bg-red-500/10 border border-canvas-cream/10 hover:border-red-500/30 text-xs font-semibold text-canvas-cream/70 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
