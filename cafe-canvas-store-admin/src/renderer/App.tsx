import { useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '../store/tenant.store'
import { useUIStore, type ScreenType } from '../store/ui.store'
import { useNotificationsStore } from '../store/notifications.store'
import { useStaffCallsStore } from '../store/staffCalls.store'
import { Modal } from '../components/ui/Modal'

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
  const { fetchTenantData, tenant } = useTenantStore()
  const { currentScreen, setScreen } = useUIStore()
  const { fetchNotifications, subscribeToNotifications } = useNotificationsStore()
  const { 
    escalatedCall, 
    availableStaff, 
    fetchActiveCalls, 
    fetchAvailableStaff, 
    subscribeToStaffCalls, 
    forwardCall, 
    clearEscalation 
  } = useStaffCallsStore()

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

  // Sync notifications
  useEffect(() => {
    let unsub: (() => void) | undefined
    if (session && tenantId) {
      fetchNotifications(tenantId)
      unsub = subscribeToNotifications(tenantId)
    }
    return () => {
      if (unsub) unsub()
    }
  }, [session, tenantId, fetchNotifications, subscribeToNotifications])

  // Sync staff calls
  useEffect(() => {
    let unsub: (() => void) | undefined
    if (session && tenantId && tenant?.public_id) {
      fetchActiveCalls(tenantId)
      fetchAvailableStaff(tenantId)
      unsub = subscribeToStaffCalls(tenant.public_id, tenantId, tenant.id)
    }
    return () => {
      if (unsub) unsub()
    }
  }, [session, tenantId, tenant, fetchActiveCalls, fetchAvailableStaff, subscribeToStaffCalls])

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
        <div className="w-16 h-16 bg-canvas-rose/20 rounded-2xl flex items-center justify-center border-2 border-canvas-rose/30 shadow-boutique-md mb-6 animate-float">
          <span className="font-display text-2xl font-bold text-canvas-brown tracking-widest">CC</span>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-canvas-surface border-t-canvas-rose mb-4" />
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

      {/* Global Escalation Modal */}
      {escalatedCall && (
        <Modal
          isOpen={!!escalatedCall}
          onClose={clearEscalation}
          title="🚨 Staff Call Escalation Alert!"
        >
          <div className="space-y-4 p-2 font-body text-canvas-brown">
            <p className="text-sm font-medium">
              The staff call from <strong className="text-canvas-terracotta">{escalatedCall.tableName}</strong> has remained unanswered for over 1 minute.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-canvas-brown">
                Forward/Assign to Staff:
              </label>
              <select
                className="w-full rounded-xl border border-canvas-border bg-canvas-cream p-3 text-sm text-canvas-brown font-semibold focus:outline-none focus:ring-2 focus:ring-canvas-rose"
                defaultValue=""
                onChange={async (e) => {
                  const staffId = e.target.value
                  if (staffId && tenant) {
                    await forwardCall(escalatedCall.id, staffId, tenant.id)
                  }
                }}
              >
                <option value="" disabled>-- Select Available Staff --</option>
                {availableStaff
                  .filter(s => s.role !== 'owner' && s.role !== 'manager')
                  .map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={clearEscalation}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-canvas-border/30 hover:bg-canvas-border/50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  )
}
