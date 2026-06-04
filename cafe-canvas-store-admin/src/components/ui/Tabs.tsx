import { cn } from '../../lib/utils'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 bg-canvas-cream rounded-lg p-1 border border-canvas-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all duration-150 whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-canvas-terracotta text-white shadow-sm'
              : 'text-canvas-brown_mid hover:text-canvas-brown hover:bg-canvas-surface',
            tab.disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[9px] font-extrabold',
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-canvas-border text-canvas-brown_mid'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Underline variant for a different aesthetic
interface UnderlineTabsProps extends TabsProps {
  variant?: 'pill' | 'underline'
}

export function UnderlineTabs({ tabs, activeTab, onChange, className }: UnderlineTabsProps) {
  return (
    <div className={cn('flex items-center gap-6 border-b border-canvas-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 pb-3 text-xs font-bold transition-all duration-150 border-b-2 -mb-px whitespace-nowrap',
            activeTab === tab.id
              ? 'border-canvas-terracotta text-canvas-brown'
              : 'border-transparent text-canvas-brown_mid hover:text-canvas-brown hover:border-canvas-champagne',
            tab.disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-canvas-terracotta/10 text-canvas-terracotta">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
