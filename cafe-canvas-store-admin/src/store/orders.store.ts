import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import type { OrderStatus } from '../lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  quantity: number
  unit_price: number      // paise
  modifier_details?: string
  notes?: string
}

export interface Order {
  id: string
  tenant_id: string
  branch_id?: string
  table_id?: string
  table_number?: number
  customer_name?: string
  customer_phone?: string
  status: OrderStatus
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  subtotal: number        // paise
  tax_amount: number      // paise
  discount_amount: number // paise
  total: number           // paise
  notes?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

// ─── State ───────────────────────────────────────────────────────────────────

interface OrdersState {
  orders: Order[]
  selectedOrder: Order | null
  isLoading: boolean
  statusFilter: OrderStatus | 'all'

  fetchOrders: (tenantId: string) => Promise<void>
  selectOrder: (order: Order | null) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ error: string | null }>
  setStatusFilter: (status: OrderStatus | 'all') => void
  subscribeToOrders: (tenantId: string) => () => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  statusFilter: 'all',

  setStatusFilter: (status) => set({ statusFilter: status }),

  selectOrder: (order) => set({ selectedOrder: order }),

  fetchOrders: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      set({ orders: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders'
      toast.error('Error', msg)
    } finally {
      set({ isLoading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) return { error: error.message }

      set({
        orders: get().orders.map((o) =>
          o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
        ),
        selectedOrder: get().selectedOrder?.id === orderId
          ? { ...get().selectedOrder!, status, updated_at: new Date().toISOString() }
          : get().selectedOrder,
      })

      toast.success('Order updated', `Status changed to ${status}`)
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order'
      return { error: msg }
    }
  },

  subscribeToOrders: (tenantId) => {
    const channel = supabase
      .channel(`orders:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const { orders } = get()

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            set({ orders: [{ ...newOrder, items: [] }, ...orders] })
            toast.info('New order', `Order received!`)
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order
            set({
              orders: orders.map((o) =>
                o.id === updated.id ? { ...o, ...updated } : o
              ),
            })
          }

          if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            set({ orders: orders.filter((o) => o.id !== deleted.id) })
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
