import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

export interface RevenueDataPoint {
  date: string
  revenue: number  // paise
  orders: number
}

export interface TopItem {
  name: string
  quantity: number
  revenue: number  // paise
  category: string
}

export interface AnalyticsSummary {
  todayRevenue: number
  yesterdayRevenue: number
  weekRevenue: number
  monthRevenue: number
  todayOrders: number
  avgOrderValue: number
  uniqueCustomers: number
}

interface AnalyticsState {
  summary: AnalyticsSummary | null
  revenueChart: RevenueDataPoint[]
  topItems: TopItem[]
  isLoading: boolean
  dateRange: 'today' | 'week' | 'month' | 'quarter'

  fetchSummary: (tenantId: string) => Promise<void>
  fetchRevenueChart: (tenantId: string) => Promise<void>
  fetchTopItems: (tenantId: string) => Promise<void>
  setDateRange: (range: 'today' | 'week' | 'month' | 'quarter') => void
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  summary: null,
  revenueChart: [],
  topItems: [],
  isLoading: false,
  dateRange: 'week',

  setDateRange: (range) => set({ dateRange: range }),

  fetchSummary: async (tenantId) => {
    set({ isLoading: true })
    try {
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString()
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

      // Today's revenue
      const { data: todayBills } = await supabase
        .from('bills')
        .select('total')
        .eq('tenant_id', tenantId)
        .eq('status', 'paid')
        .gte('paid_at', startOfToday)

      // Yesterday's revenue
      const { data: yesterdayBills } = await supabase
        .from('bills')
        .select('total')
        .eq('tenant_id', tenantId)
        .eq('status', 'paid')
        .gte('paid_at', startOfYesterday)
        .lt('paid_at', startOfToday)

      // Week revenue
      const { data: weekBills } = await supabase
        .from('bills')
        .select('total')
        .eq('tenant_id', tenantId)
        .eq('status', 'paid')
        .gte('paid_at', startOfWeek)

      // Month revenue
      const { data: monthBills } = await supabase
        .from('bills')
        .select('total')
        .eq('tenant_id', tenantId)
        .eq('status', 'paid')
        .gte('paid_at', startOfMonth)

      // Today orders count
      const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startOfToday)

      const sumBills = (bills: Array<{ total: number }> | null) =>
        (bills || []).reduce((sum, b) => sum + (b.total || 0), 0)

      const todayRevenue = sumBills(todayBills)
      const todayCount = todayOrders || 0

      set({
        summary: {
          todayRevenue,
          yesterdayRevenue: sumBills(yesterdayBills),
          weekRevenue: sumBills(weekBills),
          monthRevenue: sumBills(monthBills),
          todayOrders: todayCount,
          avgOrderValue: todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0,
          uniqueCustomers: 0, // Would need a distinct count query
        },
      })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRevenueChart: async (tenantId) => {
    try {
      const days = 7
      const dataPoints: RevenueDataPoint[] = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()

        const { data: bills } = await supabase
          .from('bills')
          .select('total')
          .eq('tenant_id', tenantId)
          .eq('status', 'paid')
          .gte('paid_at', dayStart)
          .lt('paid_at', dayEnd)

        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', dayStart)
          .lt('created_at', dayEnd)

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        dataPoints.push({
          date: dayNames[date.getDay()],
          revenue: (bills || []).reduce((sum, b) => sum + (b.total || 0), 0),
          orders: count || 0,
        })
      }

      set({ revenueChart: dataPoints })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to load chart data')
    }
  },

  fetchTopItems: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('item_name, quantity, unit_price')
        .eq('tenant_id', tenantId)
        .limit(500)

      if (error) throw error

      // Aggregate by item name
      const itemMap = new Map<string, { quantity: number; revenue: number }>()
      for (const item of data || []) {
        const existing = itemMap.get(item.item_name) || { quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.unit_price * item.quantity
        itemMap.set(item.item_name, existing)
      }

      const topItems: TopItem[] = Array.from(itemMap.entries())
        .map(([name, stats]) => ({
          name,
          quantity: stats.quantity,
          revenue: stats.revenue,
          category: '',
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      set({ topItems })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to load top items')
    }
  },
}))
