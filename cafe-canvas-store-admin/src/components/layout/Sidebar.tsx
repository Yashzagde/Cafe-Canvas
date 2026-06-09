import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Grid3X3,
  Receipt,
  Users,
  UserCheck,
  BarChart3,
  Megaphone,
  Package,
  MapPin,
  Settings,
  Sparkles,
  Monitor,
  Bell,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore, type ScreenType } from '../../store/ui.store'
import { cn } from '../../lib/utils'
import { CountBadge } from '../ui/Badge'
import logoUrl from '../../assets/logo.png'

interface NavItem {
  id: ScreenType
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: 'orders' | 'notifications' | 'inventory'
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
      { id: 'orders',     label: 'Orders',         icon: ShoppingCart, badge: 'orders' },
      { id: 'tables',     label: 'Tables',          icon: Grid3X3 },
      { id: 'kds',        label: 'Kitchen Display', icon: Monitor },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'menu',       label: 'Menu',           icon: UtensilsCrossed },
      { id: 'billing',    label: 'Billing',         icon: Receipt },
      { id: 'inventory',  label: 'Inventory',       icon: Package, badge: 'inventory' },
      { id: 'customers',  label: 'Customers',       icon: UserCheck },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'analytics',  label: 'Analytics',       icon: BarChart3 },
      { id: 'marketing',  label: 'Marketing',       icon: Megaphone },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'staff',              label: 'Staff',             icon: Users },
      { id: 'locations',          label: 'Locations',          icon: MapPin },
      { id: 'storefront-config',  label: 'Storefront',        icon: Palette },
      { id: 'notifications',      label: 'Notifications',      icon: Bell, badge: 'notifications' },
      { id: 'settings',           label: 'Settings',           icon: Settings },
      { id: 'ai',                 label: 'AI Assistant',       icon: Sparkles },
    ],
  },
]

export function Sidebar() {
  const { user, role, signOut } = useAuthStore()
  const {
    currentScreen,
    setScreen,
    sidebarCollapsed,
    toggleSidebar,
    pendingOrdersCount,
    unreadNotificationsCount,
    lowStockCount,
  } = useUIStore()

  const getBadgeCount = (badge?: 'orders' | 'notifications' | 'inventory'): number => {
    switch (badge) {
      case 'orders':        return pendingOrdersCount
      case 'notifications': return unreadNotificationsCount
      case 'inventory':     return lowStockCount
      default:              return 0
    }
  }

  const getInitials = () => {
    if (user?.email) return user.email.slice(0, 2).toUpperCase()
    return 'AD'
  }

  const getRoleLabel = () => {
    if (!role) return 'Administrator'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <aside
      className={cn(
        'bg-canvas-sidebar text-canvas-cream flex flex-col justify-between select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0',
        sidebarCollapsed ? 'w-[68px]' : 'w-60'
      )}
      style={{
        background: 'linear-gradient(180deg, #4A3728 0%, #3D2B1F 100%)',
      }}
    >
      {/* ── Top: Logo & Branding ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className={cn(
          'border-b border-white/8 flex items-center shrink-0',
          sidebarCollapsed ? 'p-3 justify-center' : 'p-5 gap-3'
        )}>
          <div className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center border border-canvas-rose/20 shadow-lg shadow-black/10 shrink-0 overflow-hidden">
            <img src={logoUrl} alt="Cafe Canvas Logo" className="w-8 h-8 object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold tracking-wide text-canvas-cream truncate">
                Cafe Canvas
              </h2>
              <span className="text-[9px] font-body text-canvas-rose tracking-widest uppercase">
                Store Admin
              </span>
            </div>
          )}
        </div>

        {/* ── Navigation Sections ─────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-canvas-tan/60">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = currentScreen === item.id
                  const Icon = item.icon
                  const badgeCount = getBadgeCount(item.badge)

                  return (
                    <button
                      key={item.id}
                      onClick={() => setScreen(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center gap-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group',
                        sidebarCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                        isActive
                          ? 'bg-canvas-rose/20 text-white shadow-sm border border-canvas-rose/15'
                          : 'text-canvas-cream/60 hover:bg-white/6 hover:text-canvas-cream/90 border border-transparent'
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-canvas-rose" />
                      )}
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive ? 'text-canvas-rose' : 'text-canvas-tan/60 group-hover:text-canvas-rose/70'
                        )}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {badgeCount > 0 && (
                            <CountBadge count={badgeCount} />
                          )}
                        </>
                      )}
                      {sidebarCollapsed && badgeCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-canvas-rose animate-pulse-dot" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Collapse Toggle ─────────────────────────────────────── */}
        <button
          onClick={toggleSidebar}
          className="mx-2 mb-2 p-2 rounded-xl hover:bg-white/6 text-canvas-cream/40 hover:text-canvas-cream transition-all duration-200 flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Bottom: Profile & Logout ──────────────────────────────── */}
      <div className={cn(
        'border-t border-white/8 bg-black/10 shrink-0',
        sidebarCollapsed ? 'p-2' : 'p-3'
      )}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-canvas-rose/20 text-canvas-rose font-bold flex items-center justify-center text-[10px]">
              {getInitials()}
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg hover:bg-red-500/15 text-canvas-cream/40 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-canvas-rose/20 text-canvas-rose font-bold flex items-center justify-center text-[10px] shrink-0">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate text-canvas-cream/90">
                  {user?.email || 'Store Manager'}
                </p>
                <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-md bg-canvas-rose/10 text-canvas-rose border border-canvas-rose/15 mt-0.5 uppercase tracking-wider">
                  {getRoleLabel()}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-transparent hover:bg-red-500/10 border border-white/8 hover:border-red-500/25 text-[11px] font-semibold text-canvas-cream/50 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
