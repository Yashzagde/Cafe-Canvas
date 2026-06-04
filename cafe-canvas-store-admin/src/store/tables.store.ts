import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import type { TableStatus } from '../lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RestaurantTable {
  id: string
  tenant_id: string
  branch_id?: string
  table_number: number
  capacity: number
  section?: string
  qr_token?: string
  status: TableStatus
  is_active: boolean
  created_at: string
}

export interface TableSession {
  id: string
  table_id: string
  tenant_id: string
  customer_name?: string
  customer_phone?: string
  pax: number
  started_at: string
  ended_at?: string
  order_ids: string[]
}

// ─── State ───────────────────────────────────────────────────────────────────

interface TablesState {
  tables: RestaurantTable[]
  sessions: TableSession[]
  isLoading: boolean

  fetchTables: (tenantId: string) => Promise<void>
  createTable: (tenantId: string, data: Partial<RestaurantTable>) => Promise<{ error: string | null }>
  updateTable: (id: string, data: Partial<RestaurantTable>) => Promise<{ error: string | null }>
  deleteTable: (id: string) => Promise<{ error: string | null }>
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>
  fetchSessions: (tenantId: string) => Promise<void>
}

export const useTablesStore = create<TablesState>((set, get) => ({
  tables: [],
  sessions: [],
  isLoading: false,

  fetchTables: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('table_number', { ascending: true })

      if (error) throw error
      set({ tables: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch tables'
      toast.error('Error', msg)
    } finally {
      set({ isLoading: false })
    }
  },

  createTable: async (tenantId, data) => {
    try {
      const qrToken = `${tenantId.slice(0, 8)}-T${data.table_number}-${Date.now().toString(36)}`

      const { data: newTable, error } = await supabase
        .from('tables')
        .insert({
          tenant_id: tenantId,
          table_number: data.table_number || 1,
          capacity: data.capacity || 4,
          section: data.section,
          qr_token: qrToken,
          status: 'vacant',
          is_active: true,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      set({ tables: [...get().tables, newTable] })
      toast.success('Table created', `Table #${newTable.table_number} added`)
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create table'
      return { error: msg }
    }
  },

  updateTable: async (id, data) => {
    try {
      const { error } = await supabase.from('tables').update(data).eq('id', id)
      if (error) return { error: error.message }
      set({ tables: get().tables.map((t) => (t.id === id ? { ...t, ...data } : t)) })
      toast.success('Table updated')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update table'
      return { error: msg }
    }
  },

  deleteTable: async (id) => {
    try {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ tables: get().tables.filter((t) => t.id !== id) })
      toast.success('Table deleted')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete table'
      return { error: msg }
    }
  },

  updateTableStatus: async (id, status) => {
    const { error } = await supabase.from('tables').update({ status }).eq('id', id)
    if (!error) {
      set({ tables: get().tables.map((t) => (t.id === id ? { ...t, status } : t)) })
    }
  },

  fetchSessions: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })

      if (error) throw error
      set({ sessions: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch sessions'
      toast.error('Error', msg)
    }
  },
}))
