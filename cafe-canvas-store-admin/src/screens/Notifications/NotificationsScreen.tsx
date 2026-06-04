import { useState } from 'react'
import { Bell, CheckCheck, Trash2, BellOff, Clock, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn, formatDate } from '../../lib/utils'

interface Notification {
  id: string
  type: 'order' | 'staff_call' | 'low_stock' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
}

// Demo notifications for UI (will be replaced by Supabase once table is wired)
const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'order', title: 'New Order Received', message: 'Order #A1B2 from Table 5 — 3 items', read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', type: 'staff_call', title: 'Staff Call — Table 8', message: 'Customer requested assistance at Table 8', read: false, created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: '3', type: 'low_stock', title: 'Low Stock Alert', message: 'Milk (2L) has fallen below reorder level', read: false, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '4', type: 'order', title: 'Payment Received', message: 'Bill #F3G4 paid via UPI — ₹1,240', read: true, created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: '5', type: 'system', title: 'Daily Report Ready', message: 'Yesterday\'s revenue summary is available in Analytics', read: true, created_at: new Date(Date.now() - 120 * 60000).toISOString() },
]

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="w-4 h-4 text-canvas-teal" />,
  staff_call: <Users className="w-4 h-4 text-canvas-gold" />,
  low_stock: <AlertTriangle className="w-4 h-4 text-canvas-error" />,
  system: <Bell className="w-4 h-4 text-canvas-brown_mid" />,
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => filter === 'unread' ? !n.read : n.read)

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  const deleteNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id))

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read', count: notifications.filter((n) => n.read).length },
  ]

  return (
    <div className="space-y-6 select-none max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Notifications</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck className="w-3.5 h-3.5" />} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={filter} onChange={(id) => setFilter(id as 'all' | 'unread' | 'read')} />

      {filtered.length === 0 ? (
        <EmptyState icon={<BellOff className="w-8 h-8" />} title="No notifications" description={filter === 'unread' ? "You're all caught up!" : "No notifications to display."} />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                n.read
                  ? 'bg-canvas-surface border-canvas-border/50'
                  : 'bg-canvas-surface border-canvas-terracotta/20 shadow-sm border-l-4 border-l-canvas-terracotta'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-canvas-cream border border-canvas-border flex items-center justify-center shrink-0">
                {typeIcons[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-canvas-brown">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-canvas-terracotta shrink-0" />}
                </div>
                <p className="text-[11px] text-canvas-brown_mid mt-0.5">{n.message}</p>
                <span className="text-[10px] text-canvas-brown_light mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{formatDate(n.created_at, 'relative')}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                className="p-1 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
