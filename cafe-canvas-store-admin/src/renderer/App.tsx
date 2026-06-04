import { useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '../store/tenant.store'
import { useUIStore, type ScreenType } from '../store/ui.store'

import { TitleBar } from '../components/layout/TitleBar'
import { Sidebar } from '../components/layout/Sidebar'
import { StatusBar } from '../components/layout/StatusBar'
import { ToastContainer } from '../components/ui/Toast'

// ── Screen imports ───────────────────────────────────────────────────────────
import { LoginScreen } from '../screens/Auth/LoginScreen'
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen'
import { MenuScreen } from '../screens/Menu/MenuScreen'
import { OrdersScreen } from '../screens/Orders/OrdersScreen'
import { TablesScreen } from '../screens/Tables/TablesScreen'
import { BillingScreen } from '../screens/Billing/BillingScreen'
import { StaffScreen } from '../screens/Staff/StaffScreen'
import { CustomersScreen } from '../screens/Customers/CustomersScreen'
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen'
import { MarketingScreen } from '../screens/Marketing/MarketingScreen'
import { InventoryScreen } from '../screens/Inventory/InventoryScreen'
import { LocationsScreen } from '../screens/Locations/LocationsScreen'
import { SettingsScreen } from '../screens/Settings/SettingsScreen'
import { KDSScreen } from '../screens/KDS/KDSScreen'
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen'
import { StorefrontConfigScreen } from '../screens/StorefrontConfig/StorefrontConfigScreen'
import { AIAssistantScreen } from '../screens/AI/AIAssistantScreen'

// ── Screen title map ─────────────────────────────────────────────────────────
const SCREEN_TITLES: Record<ScreenType, string> = {
  login:              'Login',
  dashboard:          'Dashboard',
  menu:               'Menu Management',
  orders:             'Orders',
  pos:                'Point of Sale',
  tables:             'Table Management',
  billing:            'Billing & Invoices',
  staff:              'Staff Management',
  customers:          'Customer CRM',
  analytics:          'Analytics',
  marketing:          'Marketing',
  inventory:          'Inventory',
  locations:          'Locations',
  settings:           'Settings',
  kds:                'Kitchen Display',
  notifications:      'Notifications',
  'storefront-config': 'Storefront',
  ai:                 'AI Assistant',
}

export default function App() {
  const { session, tenantId, isLoading: authLoading, initialize } = useAuthStore()
  const { fetchTenantData } = useTenantStore()
  const { currentScreen, setScreen } = useUIStore()

  // Initialize session on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Sync screen and data loading when session state updates
  useEffect(() => {
    if (session) {
      if (currentScreen === 'login') {
        setScreen('dashboard')
      }
      if (tenantId) {
        fetchTenantData(tenantId)
      }
    } else {
      setScreen('login')
    }
  }, [session, tenantId, currentScreen, setScreen, fetchTenantData])

  // ── Global Keyboard Shortcuts ────────────────────────────────────────────
  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (!session) return
      if (!e.ctrlKey && !e.metaKey) return

      const screenMap: Record<string, ScreenType> = {
        '1': 'dashboard',
        '2': 'menu',
        '3': 'orders',
        '4': 'tables',
        '5': 'billing',
        '6': 'staff',
        '7': 'customers',
        '8': 'analytics',
        '9': 'settings',
      }

      const target = screenMap[e.key]
      if (target) {
        e.preventDefault()
        setScreen(target)
      }
    },
    [session, setScreen]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [handleKeyboard])

  // ── Loading State ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-canvas-cream font-body select-none">
        <div className="w-16 h-16 bg-canvas-terracotta rounded-2xl flex items-center justify-center border-2 border-canvas-gold shadow-lg mb-6 animate-bounce-soft">
          <span className="font-display text-2xl font-bold text-white tracking-widest">CC</span>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-canvas-champagne border-t-canvas-terracotta mb-4" />
        <p className="text-canvas-brown_mid font-semibold text-sm">Resolving session...</p>
      </div>
    )
  }

  // ── Login Screen ─────────────────────────────────────────────────────────
  if (!session || currentScreen === 'login') {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas-cream">
        <TitleBar title="Login" />
        <div className="flex-1 overflow-hidden">
          <LoginScreen />
        </div>
        <ToastContainer />
      </div>
    )
  }

  // ── Active Screen Router ─────────────────────────────────────────────────
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':          return <DashboardScreen />
      case 'menu':               return <MenuScreen />
      case 'orders':             return <OrdersScreen />
      case 'tables':             return <TablesScreen />
      case 'billing':            return <BillingScreen />
      case 'staff':              return <StaffScreen />
      case 'customers':          return <CustomersScreen />
      case 'analytics':          return <AnalyticsScreen />
      case 'marketing':          return <MarketingScreen />
      case 'inventory':          return <InventoryScreen />
      case 'locations':          return <LocationsScreen />
      case 'settings':           return <SettingsScreen />
      case 'kds':                return <KDSScreen />
      case 'notifications':      return <NotificationsScreen />
      case 'storefront-config':  return <StorefrontConfigScreen />
      case 'ai':                 return <AIAssistantScreen />
      default:                   return <DashboardScreen />
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas-cream font-body text-canvas-brown">
      {/* Draggable custom title bar */}
      <TitleBar title={SCREEN_TITLES[currentScreen] || 'Store Admin'} />

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar navigation */}
        <Sidebar />

        {/* Content canvas with screen transition */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col bg-canvas-cream">
          <div key={currentScreen} className="screen-enter flex-1 flex flex-col">
            {renderActiveScreen()}
          </div>
        </main>
      </div>

      {/* Connection & app details status bar */}
      <StatusBar />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  )
}
