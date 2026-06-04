import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

export interface Customer {
  id: string
  tenant_id: string
  name?: string
  phone: string
  email?: string
  total_visits: number
  total_spent: number    // paise
  last_visit_at?: string
  notes?: string
  tags: string[]
  created_at: string
}

interface CustomersState {
  customers: Customer[]
  selectedCustomer: Customer | null
  isLoading: boolean
  searchQuery: string

  fetchCustomers: (tenantId: string) => Promise<void>
  searchCustomers: (tenantId: string, query: string) => Promise<void>
  createCustomer: (tenantId: string, data: Partial<Customer>) => Promise<{ error: string | null }>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<{ error: string | null }>
  selectCustomer: (customer: Customer | null) => void
  setSearchQuery: (query: string) => void
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),
  selectCustomer: (customer) => set({ selectedCustomer: customer }),

  fetchCustomers: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('total_visits', { ascending: false })
        .limit(200)

      if (error) throw error
      set({ customers: data || [] })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      set({ isLoading: false })
    }
  },

  searchCustomers: async (tenantId, query) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(50)

      if (error) throw error
      set({ customers: data || [] })
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Search failed')
    } finally {
      set({ isLoading: false })
    }
  },

  createCustomer: async (tenantId, data) => {
    try {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          tenant_id: tenantId,
          name: data.name,
          phone: data.phone || '',
          email: data.email,
          total_visits: 0,
          total_spent: 0,
          tags: data.tags || [],
        })
        .select()
        .single()

      if (error) return { error: error.message }
      set({ customers: [newCustomer, ...get().customers] })
      toast.success('Customer added', data.name || data.phone || '')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to create customer' }
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const { error } = await supabase.from('customers').update(data).eq('id', id)
      if (error) return { error: error.message }
      set({ customers: get().customers.map((c) => (c.id === id ? { ...c, ...data } : c)) })
      toast.success('Customer updated')
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update customer' }
    }
  },
}))
