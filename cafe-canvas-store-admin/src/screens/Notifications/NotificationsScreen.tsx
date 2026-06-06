import { useState } from 'react'
import { Bell, CheckCheck, Trash2, BellOff, Clock, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn, formatDate } from '../../lib/utils'
import { useNotificationsStore } from '../../store/notifications.store'
import { useAuthStore } from '../../store/auth.store'

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="w-4 h-4 text-canvas-teal" />,
  staff_call: <Users className="w-4 h-4 text-canvas-gold" />,
  low_stock: <AlertTriangle className="w-4 h-4 text-canvas-error" />,
  customer_checkin: <Users className="w-4 h-4 text-canvas-teal" />,
  system: <Bell className="w-4 h-4 text-canvas-brown_mid" />,
}

export function NotificationsScreen() {
  const { tenantId } = useAuthStore()
  const { notifications, markRead, markAllRead, deleteNotification, isLoading } = useNotificationsStore()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => filter === 'unread' ? !n.read : n.read)

  const handleMarkAllRead = () => {
    if (tenantId) markAllRead(tenantId)
  }

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read', count: notifications.filter((n) => n.read).length },
  ]

  const getNotificationType = (type: string): 'order' | 'staff_call' | 'low_stock' | 'customer_checkin' | 'system' => {
    if (type === 'customer_checkin') return 'customer_checkin'
    if (type === 'staff_call') return 'staff_call'
    if (type === 'low_stock') return 'low_stock'
    if (type === 'order' || type === 'order_status' || type === 'payment_received') return 'order'
    return 'system'
  }

  return (
    <div className="space-y-6 select-none max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Notifications</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck className="w-3.5 h-3.5" />} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={filter} onChange={(id) => setFilter(id as 'all' | 'unread' | 'read')} />

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-canvas-champagne border-t-canvas-terracotta" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BellOff className="w-8 h-8" />} title="No notifications" description={filter === 'unread' ? "You're all caught up!" : "No notifications to display."} />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const displayType = getNotificationType(n.type)
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                  n.read
                    ? 'bg-canvas-surface border-canvas-border/50'
                    : 'bg-canvas-surface border-canvas-terracotta/20 shadow-sm border-l-4 border-l-canvas-terracotta'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-canvas-cream border border-canvas-border flex items-center justify-center shrink-0">
                  {typeIcons[displayType] || <Bell className="w-4 h-4 text-canvas-brown_mid" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-canvas-brown">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-canvas-terracotta shrink-0" />}
                  </div>
                  <p className="text-[11px] text-canvas-brown_mid mt-0.5">{n.body}</p>
                  <span className="text-[10px] text-canvas-brown_light mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDate(n.sent_at, 'relative')}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                  className="p-1 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
