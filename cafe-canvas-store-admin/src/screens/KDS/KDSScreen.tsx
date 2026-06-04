import { useEffect } from 'react'
import { Clock, ChefHat, CheckCircle, RotateCcw } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useOrdersStore, type Order } from '../../store/orders.store'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { type OrderStatus } from '../../lib/constants'

type KDSColumn = 'pending' | 'preparing' | 'ready'

const KDS_COLUMNS: { status: KDSColumn; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending', label: 'New Orders', icon: <Clock className="w-4 h-4" />, color: 'border-amber-400 bg-amber-50' },
  { status: 'preparing', label: 'In Progress', icon: <ChefHat className="w-4 h-4" />, color: 'border-orange-400 bg-orange-50' },
  { status: 'ready', label: 'Ready to Serve', icon: <CheckCircle className="w-4 h-4" />, color: 'border-emerald-400 bg-emerald-50' },
]

export function KDSScreen() {
  const { tenantId } = useAuthStore()
  const { orders, fetchOrders, updateOrderStatus, subscribeToOrders } = useOrdersStore()

  useEffect(() => {
    if (!tenantId) return
    fetchOrders(tenantId)
    const unsub = subscribeToOrders(tenantId)
    return unsub
  }, [tenantId, fetchOrders, subscribeToOrders])

  const getOrdersByStatus = (status: KDSColumn): Order[] =>
    orders.filter((o) => o.status === status).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const getTimeSinceOrder = (createdAt: string): string => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const getNextStatus = (status: KDSColumn): OrderStatus | null => {
    switch (status) {
      case 'pending': return 'preparing'
      case 'preparing': return 'ready'
      case 'ready': return 'served'
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Kitchen Display</h2>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-canvas-sage">
            <span className="w-2 h-2 rounded-full bg-canvas-sage animate-pulse-dot" />
            Live
          </span>
        </div>
        <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => tenantId && fetchOrders(tenantId)}>
          Refresh
        </Button>
      </div>

      {/* KDS Kanban Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {KDS_COLUMNS.map((col) => {
          const columnOrders = getOrdersByStatus(col.status)
          return (
            <div key={col.status} className="flex flex-col overflow-hidden">
              {/* Column Header */}
              <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-xl border-t-4', col.color)}>
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-sm font-extrabold text-canvas-brown">{col.label}</span>
                </div>
                <Badge variant={col.status === 'pending' ? 'warning' : col.status === 'preparing' ? 'info' : 'success'}>
                  {columnOrders.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-canvas-cream/30 rounded-b-xl border border-canvas-border border-t-0">
                {columnOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-canvas-brown_light">
                    No orders
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const time = getTimeSinceOrder(order.created_at)
                    const isUrgent = (Date.now() - new Date(order.created_at).getTime()) > 15 * 60000 // >15 min
                    const nextStatus = getNextStatus(col.status)

                    return (
                      <div
                        key={order.id}
                        className={cn(
                          'bg-canvas-surface rounded-lg border p-4 transition-all hover:shadow-md',
                          isUrgent ? 'border-canvas-error/50 shadow-sm shadow-canvas-error/10' : 'border-canvas-border'
                        )}
                      >
                        {/* Order header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-extrabold text-canvas-terracotta">
                            #{order.id.slice(-4).toUpperCase()}
                          </span>
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded',
                            isUrgent ? 'bg-canvas-error/10 text-canvas-error' : 'bg-canvas-cream text-canvas-brown_mid'
                          )}>
                            {time}
                          </span>
                        </div>

                        {/* Table */}
                        {order.table_number && (
                          <div className="flex items-center gap-1 mb-2">
                            <span className="px-2 py-0.5 rounded bg-canvas-terracotta/10 text-canvas-terracotta text-[10px] font-bold">
                              Table #{order.table_number}
                            </span>
                            {order.order_type !== 'dine_in' && (
                              <Badge variant="info" size="sm">{order.order_type}</Badge>
                            )}
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-1 mb-3">
                          {(order.items || []).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              <span className="w-5 h-5 rounded bg-canvas-terracotta/10 text-canvas-terracotta font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                {item.quantity}
                              </span>
                              <span className="font-bold text-canvas-brown">{item.item_name}</span>
                            </div>
                          ))}
                          {order.notes && (
                            <p className="text-[10px] text-canvas-brown_mid italic mt-1 bg-canvas-cream rounded p-1.5">
                              📝 {order.notes}
                            </p>
                          )}
                        </div>

                        {/* Action */}
                        {nextStatus && (
                          <Button
                            fullWidth
                            size="sm"
                            variant={col.status === 'ready' ? 'success' : 'primary'}
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                          >
                            {col.status === 'pending' && 'Start Preparing'}
                            {col.status === 'preparing' && 'Mark Ready'}
                            {col.status === 'ready' && 'Mark Served'}
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
