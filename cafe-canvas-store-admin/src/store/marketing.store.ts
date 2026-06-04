import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

export interface Discount {
  id: string
  tenant_id: string
  name: string
  type: 'flat' | 'percentage'
  value: number           // flat=paise, percentage=number
  min_order_amount?: number // paise
  max_discount?: number   // paise (for percentage cap)
  is_active: boolean
  starts_at?: string
  ends_at?: string
  created_at: string
}

export interface Coupon {
  id: string
  tenant_id: string
  code: string
  discount_id: string
  max_uses: number
  current_uses: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

interface MarketingState {
  discounts: Discount[]
  coupons: Coupon[]
  isLoading: boolean

  fetchDiscounts: (tenantId: string) => Promise<void>
  createDiscount: (tenantId: string, data: Partial<Discount>) => Promise<{ error: string | null }>
  updateDiscount: (id: string, data: Partial<Discount>) => Promise<{ error: string | null }>
  deleteDiscount: (id: string) => Promise<{ error: string | null }>
  fetchCoupons: (tenantId: string) => Promise<void>
  createCoupon: (tenantId: string, data: Partial<Coupon>) => Promise<{ error: string | null }>
  deleteCoupon: (id: string) => Promise<{ error: string | null }>
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  discounts: [],
  coupons: [],
  isLoading: false,

  fetchDiscounts: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ discounts: data || [] })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to fetch discounts')
    } finally {
      set({ isLoading: false })
    }
  },

  createDiscount: async (tenantId, data) => {
    try {
      const { data: newDiscount, error } = await supabase
        .from('discounts')
        .insert({ tenant_id: tenantId, ...data, is_active: true })
        .select()
        .single()
      if (error) return { error: error.message }
      set({ discounts: [newDiscount, ...get().discounts] })
      toast.success('Discount created')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to create discount' }
    }
  },

  updateDiscount: async (id, data) => {
    try {
      const { error } = await supabase.from('discounts').update(data).eq('id', id)
      if (error) return { error: error.message }
      set({ discounts: get().discounts.map((d) => (d.id === id ? { ...d, ...data } : d)) })
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update discount' }
    }
  },

  deleteDiscount: async (id) => {
    try {
      const { error } = await supabase.from('discounts').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ discounts: get().discounts.filter((d) => d.id !== id) })
      toast.success('Discount deleted')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete discount' }
    }
  },

  fetchCoupons: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ coupons: data || [] })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to fetch coupons')
    }
  },

  createCoupon: async (tenantId, data) => {
    try {
      const { data: newCoupon, error } = await supabase
        .from('coupons')
        .insert({ tenant_id: tenantId, ...data, current_uses: 0, is_active: true })
        .select()
        .single()
      if (error) return { error: error.message }
      set({ coupons: [newCoupon, ...get().coupons] })
      toast.success('Coupon created')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to create coupon' }
    }
  },

  deleteCoupon: async (id) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ coupons: get().coupons.filter((c) => c.id !== id) })
      toast.success('Coupon deleted')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete coupon' }
    }
  },
}))
