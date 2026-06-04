import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '../store/tenant.store'
import { useUIStore } from '../store/ui.store'

import { TitleBar } from '../components/layout/TitleBar'
import { Sidebar } from '../components/layout/Sidebar'
import { StatusBar } from '../components/layout/StatusBar'

import { LoginScreen } from '../screens/Auth/LoginScreen'
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen'
import { StaffScreen } from '../screens/Staff/StaffScreen'
import { LocationsScreen } from '../screens/Locations/LocationsScreen'
import { SettingsScreen } from '../screens/Settings/SettingsScreen'
import { AIAssistantScreen } from '../screens/AI/AIAssistantScreen'

export default function App() {
  const { session, tenantId, isLoading: authLoading, initialize } = useAuthStore()
  const { fetchTenantData } = useTenantStore()
  const { currentScreen, setScreen } = useUIStore()

  // Initialize session on mount
  useEffect(() => {
    initialize()
  }, [])

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
  }, [session, tenantId])

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-canvas-cream font-body select-none">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-canvas-champagne border-t-canvas-terracotta"></div>
        <p className="mt-4 text-canvas-brown_mid font-semibold">Resolving session...</p>
      </div>
    )
  }

  if (!session || currentScreen === 'login') {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas-cream">
        <TitleBar title="Login" />
        <div className="flex-1 overflow-hidden">
          <LoginScreen />
        </div>
      </div>
    )
  }

  // Active session shell layout
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />
      case 'staff':
        return <StaffScreen />
      case 'locations':
        return <LocationsScreen />
      case 'settings':
        return <SettingsScreen />
      case 'ai':
        return <AIAssistantScreen />
      default:
        return <DashboardScreen />
    }
  }

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard'
      case 'staff':
        return 'Staff Management'
      case 'locations':
        return 'Locations'
      case 'settings':
        return 'Settings'
      case 'ai':
        return 'AI Assistant'
      default:
        return 'Store Admin'
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas-cream font-body text-canvas-brown">
      {/* Draggable custom title bar */}
      <TitleBar title={getScreenTitle()} />

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar navigation */}
        <Sidebar />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col bg-canvas-cream">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Connection & app details status bar */}
      <StatusBar />
    </div>
  )
}
