import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

export interface InventoryItem {
  id: string
  tenant_id: string
  name: string
  unit: string
  current_stock: number
  reorder_level: number
  cost_per_unit: number  // paise
  supplier?: string
  last_restocked_at?: string
  created_at: string
}

interface InventoryState {
  items: InventoryItem[]
  isLoading: boolean

  fetchInventory: (tenantId: string) => Promise<void>
  createItem: (tenantId: string, data: Partial<InventoryItem>) => Promise<{ error: string | null }>
  updateStock: (id: string, quantity: number) => Promise<{ error: string | null }>
  deleteItem: (id: string) => Promise<{ error: string | null }>
  getLowStockCount: () => number
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,

  getLowStockCount: () => {
    return get().items.filter((i) => i.current_stock <= i.reorder_level).length
  },

  fetchInventory: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

      if (error) throw error
      set({ items: data || [] })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to fetch inventory')
    } finally {
      set({ isLoading: false })
    }
  },

  createItem: async (tenantId, data) => {
    try {
      const { data: newItem, error } = await supabase
        .from('inventory')
        .insert({
          tenant_id: tenantId,
          name: data.name || '',
          unit: data.unit || 'pcs',
          current_stock: data.current_stock || 0,
          reorder_level: data.reorder_level || 10,
          cost_per_unit: data.cost_per_unit || 0,
          supplier: data.supplier,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      set({ items: [...get().items, newItem] })
      toast.success('Item added to inventory')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to add item' }
    }
  },

  updateStock: async (id, quantity) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ current_stock: quantity, last_restocked_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return { error: error.message }
      set({
        items: get().items.map((i) =>
          i.id === id ? { ...i, current_stock: quantity, last_restocked_at: new Date().toISOString() } : i
        ),
      })
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update stock' }
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ items: get().items.filter((i) => i.id !== id) })
      toast.success('Item removed from inventory')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete item' }
    }
  },
}))
