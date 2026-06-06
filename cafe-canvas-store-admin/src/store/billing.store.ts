import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import { calculateGST } from '../lib/utils'
import type { BillStatus, PaymentMethod } from '../lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Bill {
  id: string
  tenant_id: string
  order_id: string
  table_number?: number
  customer_name?: string
  subtotal: number         // paise
  discount_amount: number  // paise
  cgst: number             // paise
  sgst: number             // paise
  total: number            // paise
  payment_method?: PaymentMethod
  status: BillStatus
  gstin?: string
  notes?: string
  created_at: string
  paid_at?: string
}

// ─── State ───────────────────────────────────────────────────────────────────

interface BillingState {
  bills: Bill[]
  selectedBill: Bill | null
  isLoading: boolean

  fetchBills: (tenantId: string) => Promise<void>
  generateBill: (tenantId: string, data: {
    order_id: string
    table_number?: number
    customer_name?: string
    subtotal: number
    discount_amount?: number
    cgstRate?: number
    sgstRate?: number
  }) => Promise<{ error: string | null; bill?: Bill }>
  markPaid: (billId: string, paymentMethod: PaymentMethod) => Promise<{ error: string | null }>
  voidBill: (billId: string) => Promise<{ error: string | null }>
  selectBill: (bill: Bill | null) => void
  subscribeToBills: (tenantId: string) => () => void
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: [],
  selectedBill: null,
  isLoading: false,

  selectBill: (bill) => set({ selectedBill: bill }),

  fetchBills: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      set({ bills: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch bills'
      toast.error('Error', msg)
    } finally {
      set({ isLoading: false })
    }
  },

  generateBill: async (tenantId, data) => {
    try {
      const discount = data.discount_amount || 0
      const taxableAmount = data.subtotal - discount
      const gst = calculateGST(taxableAmount, data.cgstRate, data.sgstRate)

      const { data: newBill, error } = await supabase
        .from('bills')
        .insert({
          tenant_id: tenantId,
          order_id: data.order_id,
          table_number: data.table_number,
          customer_name: data.customer_name,
          subtotal: data.subtotal,
          discount_amount: discount,
          cgst: gst.cgst,
          sgst: gst.sgst,
          total: gst.total,
          status: 'unpaid',
        })
        .select()
        .single()

      if (error) return { error: error.message }

      set({ bills: [newBill, ...get().bills] })
      toast.success('Bill generated', `Total: ₹${(gst.total / 100).toFixed(2)}`)
      return { error: null, bill: newBill }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate bill'
      return { error: msg }
    }
  },

  markPaid: async (billId, paymentMethod) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        })
        .eq('id', billId)

      if (error) return { error: error.message }

      set({
        bills: get().bills.map((b) =>
          b.id === billId
            ? { ...b, status: 'paid' as BillStatus, payment_method: paymentMethod, paid_at: new Date().toISOString() }
            : b
        ),
      })
      toast.success('Payment recorded')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark paid'
      return { error: msg }
    }
  },

  voidBill: async (billId) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'void' })
        .eq('id', billId)

      if (error) return { error: error.message }

      set({
        bills: get().bills.map((b) =>
          b.id === billId ? { ...b, status: 'void' as BillStatus } : b
        ),
      })
      toast.warning('Bill voided')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to void bill'
      return { error: msg }
    }
  },

  subscribeToBills: (tenantId) => {
    const channel = supabase
      .channel(`bills:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const { bills } = get()

          if (payload.eventType === 'INSERT') {
            const newBill = payload.new as Bill
            set({ bills: [newBill, ...bills] })
            toast.info('New bill generated', `Bill #${newBill.id.slice(-6).toUpperCase()} generated for Table ${newBill.table_number || '—'}`)
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bill
            set({
              bills: bills.map((b) =>
                b.id === updated.id ? { ...b, ...updated } : b
              ),
              selectedBill: get().selectedBill?.id === updated.id
                ? { ...get().selectedBill!, ...updated }
                : get().selectedBill
            })
          }

          if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            set({ bills: bills.filter((b) => b.id !== deleted.id) })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
