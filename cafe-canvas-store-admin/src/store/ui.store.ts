import { create } from 'zustand'

export type ScreenType =
  | 'login'
  | 'dashboard'
  | 'menu'
  | 'orders'
  | 'pos'
  | 'tables'
  | 'billing'
  | 'staff'
  | 'customers'
  | 'analytics'
  | 'marketing'
  | 'inventory'
  | 'locations'
  | 'settings'
  | 'kds'
  | 'notifications'
  | 'storefront-config'
  | 'ai'

interface UIState {
  currentScreen: ScreenType
  previousScreen: ScreenType | null
  sidebarCollapsed: boolean

  // Notification badge counts
  pendingOrdersCount: number
  unreadNotificationsCount: number
  lowStockCount: number

  // Actions
  setScreen: (screen: ScreenType) => void
  goBack: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setBadgeCounts: (counts: Partial<Pick<UIState, 'pendingOrdersCount' | 'unreadNotificationsCount' | 'lowStockCount'>>) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  currentScreen: 'login',
  previousScreen: null,
  sidebarCollapsed: false,

  pendingOrdersCount: 0,
  unreadNotificationsCount: 0,
  lowStockCount: 0,

  setScreen: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),

  goBack: () => {
    const { previousScreen } = get()
    if (previousScreen) {
      set({ currentScreen: previousScreen, previousScreen: null })
    }
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setBadgeCounts: (counts) => set(counts),
}))
