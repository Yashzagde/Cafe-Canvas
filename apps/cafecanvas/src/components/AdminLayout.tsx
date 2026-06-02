'use client'

import * as React from 'react'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Layers, 
  Receipt, 
  Users, 
  BarChart3, 
  Menu as MenuIcon, 
  X, 
  Bell, 
  ChevronRight, 
  Settings,
  Coffee
} from 'lucide-react'
import { Button } from './ui/button'

interface SidebarItem {
  name: string
  icon: React.ComponentType<any>
  href: string
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Menu Management', icon: UtensilsCrossed, href: '/admin/menu' },
  { name: 'Table Layout', icon: Layers, href: '/admin/tables' },
  { name: 'Billing', icon: Receipt, href: '/admin/billing' },
  { name: 'Customers', icon: Users, href: '/admin/customers' },
  { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState('Dashboard')

  return (
    <div className="flex h-screen bg-[#070b13] text-slate-100 font-sans overflow-hidden">
      {/* 1. SIDEBAR FOR DESKTOP */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-900 bg-[#0a0f1d] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
              <Coffee className="w-5 h-5 shrink-0" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                CafeCanvas
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.name
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveItem(item.name)
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </a>
            )
          })}
        </nav>

        {/* User Workspace Profile bottom strip */}
        <div className="p-4 border-t border-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400">
            A
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-semibold text-slate-200">Admin User</p>
              <p className="text-[10px] text-slate-500 truncate">admin@cafecanvas.bar</p>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-[#0a0f1d] flex flex-col h-full animate-in slide-in-from-left duration-250">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-base text-indigo-100">CafeCanvas</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeItem === item.name
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveItem(item.name)
                      setIsMobileOpen(false)
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </a>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/60 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden" 
              onClick={() => setIsMobileOpen(true)}
            >
              <MenuIcon className="w-5 h-5 text-slate-300" />
            </Button>
            <h1 className="text-base font-bold text-slate-100 md:text-lg">
              {activeItem}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2 rounded-full relative">
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
              </Button>
            </div>
            {/* System configuration Settings */}
            <Button variant="ghost" size="sm" className="p-2 rounded-full">
              <Settings className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </header>

        {/* VIEWPORT SCROLL CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
