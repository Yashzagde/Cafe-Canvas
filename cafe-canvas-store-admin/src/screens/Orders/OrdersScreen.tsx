import { useEffect } from 'react'
import { ShoppingCart, Clock, CheckCircle2, ChefHat, Truck } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useOrdersStore } from '../../store/orders.store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/EmptyState'
import { PriceDisplay, GSTBreakdown } from '../../components/ui/PriceDisplay'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { cn, formatDate } from '../../lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, type OrderStatus } from '../../lib/constants'

export function OrdersScreen() {
  const { tenantId } = useAuthStore()
  const {
    orders, selectedOrder, isLoading, statusFilter,
    fetchOrders, selectOrder, updateOrderStatus, setStatusFilter, subscribeToOrders,
  } = useOrdersStore()

  useEffect(() => {
    if (!tenantId) return
    fetchOrders(tenantId)
    const unsub = subscribeToOrders(tenantId)
    return unsub
  }, [tenantId, fetchOrders, subscribeToOrders])

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const tabs = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: statusCounts['pending'] || 0 },
    { id: 'confirmed', label: 'Confirmed', count: statusCounts['confirmed'] || 0 },
    { id: 'preparing', label: 'Preparing', count: statusCounts['preparing'] || 0 },
    { id: 'ready', label: 'Ready', count: statusCounts['ready'] || 0 },
    { id: 'served', label: 'Served', count: statusCounts['served'] || 0 },
    { id: 'paid', label: 'Paid', count: statusCounts['paid'] || 0 },
  ]

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':   return <Clock className="w-3.5 h-3.5" />
      case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'preparing': return <ChefHat className="w-3.5 h-3.5" />
      case 'ready':     return <Truck className="w-3.5 h-3.5" />
      default:          return <ShoppingCart className="w-3.5 h-3.5" />
    }
  }

  if (isLoading) return <SkeletonTable rows={8} cols={5} />

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Orders</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">
            {orders.length} total · {statusCounts['pending'] || 0} pending · Real-time updates active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-canvas-sage">
            <span className="w-2 h-2 rounded-full bg-canvas-sage animate-pulse-dot" />
            Live
          </span>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs tabs={tabs} activeTab={statusFilter} onChange={(id) => setStatusFilter(id as OrderStatus | 'all')} className="mb-4" />

      {/* Split Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Order List */}
        <div className="w-full lg:w-1/2 overflow-y-auto space-y-2 pr-1">
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8" />}
              title="No orders found"
              description={statusFilter !== 'all' ? `No ${statusFilter} orders right now.` : 'Orders will appear here in real-time.'}
            />
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id
              return (
                <button
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all',
                    isSelected
                      ? 'bg-canvas-terracotta/5 border-canvas-terracotta shadow-sm'
                      : 'bg-canvas-surface border-canvas-border hover:border-canvas-champagne'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold text-canvas-terracotta">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <Badge
                      variant={
                        order.status === 'paid' ? 'success' :
                        order.status === 'cancelled' ? 'danger' :
                        order.status === 'pending' ? 'warning' : 'info'
                      }
                      size="sm"
                      dot
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      {order.table_number && (
                        <span className="text-xs font-bold text-canvas-brown">Table #{order.table_number}</span>
                      )}
                      {order.customer_name && (
                        <span className="text-xs text-canvas-brown_mid ml-2">· {order.customer_name}</span>
                      )}
                      <p className="text-[10px] text-canvas-brown_light mt-0.5">
                        {order.items?.length || 0} items · {formatDate(order.created_at, 'relative')}
                      </p>
                    </div>
                    <PriceDisplay paise={order.total} compact className="text-canvas-brown font-extrabold" />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          {selectedOrder ? (
            <div className="bg-canvas-surface rounded-xl border border-canvas-border p-6 flex-1 overflow-y-auto">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-canvas-brown">
                    Order #{selectedOrder.id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-canvas-brown_mid mt-0.5">
                    {formatDate(selectedOrder.created_at, 'long')}
                  </p>
                </div>
                <Badge
                  variant={selectedOrder.status === 'paid' ? 'success' : selectedOrder.status === 'pending' ? 'warning' : 'info'}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </Badge>
              </div>

              {/* Customer / Table info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedOrder.table_number && (
                  <div className="p-3 rounded-lg bg-canvas-cream border border-canvas-border">
                    <p className="text-[10px] text-canvas-brown_mid font-bold uppercase">Table</p>
                    <p className="text-sm font-bold text-canvas-brown">#{selectedOrder.table_number}</p>
                  </div>
                )}
                {selectedOrder.customer_name && (
                  <div className="p-3 rounded-lg bg-canvas-cream border border-canvas-border">
                    <p className="text-[10px] text-canvas-brown_mid font-bold uppercase">Customer</p>
                    <p className="text-sm font-bold text-canvas-brown">{selectedOrder.customer_name}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold text-canvas-brown uppercase tracking-wider mb-3">Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-canvas-border/30 last:border-0">
                      <div>
                        <span className="text-xs font-bold text-canvas-brown">{item.item_name}</span>
                        <span className="text-[10px] text-canvas-brown_mid ml-2">×{item.quantity}</span>
                        {item.notes && <p className="text-[10px] text-canvas-brown_light italic">{item.notes}</p>}
                      </div>
                      <PriceDisplay paise={item.unit_price * item.quantity} size="sm" compact />
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <GSTBreakdown
                subtotal={selectedOrder.subtotal}
                cgst={Math.round(selectedOrder.tax_amount / 2)}
                sgst={Math.round(selectedOrder.tax_amount / 2)}
                total={selectedOrder.total}
                discount={selectedOrder.discount_amount}
                className="mb-6"
              />

              {/* Actions */}
              {ORDER_STATUS_TRANSITIONS[selectedOrder.status].length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-canvas-border">
                  {ORDER_STATUS_TRANSITIONS[selectedOrder.status].map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      variant={nextStatus === 'cancelled' ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => updateOrderStatus(selectedOrder.id, nextStatus)}
                    >
                      {nextStatus === 'cancelled' ? 'Cancel Order' : `Mark ${ORDER_STATUS_LABELS[nextStatus]}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-canvas-surface/50 rounded-xl border border-dashed border-canvas-border">
              <EmptyState
                icon={<ShoppingCart className="w-8 h-8" />}
                title="Select an order"
                description="Click on any order from the list to view its details and manage status."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
