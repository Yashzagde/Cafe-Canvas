import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Tenant, Location, StoreSettings } from '../lib/types'

interface TenantState {
  tenant:       Tenant | null
  locations:    Location[]
  settings:     StoreSettings | null
  isLoading:    boolean
  fetchTenantData: (tenantId: string) => Promise<void>
  updateSettings:  (updates: Partial<StoreSettings>) => Promise<{ error: string | null }>
  addLocation:     (location: Omit<Location, 'id' | 'tenant_id' | 'is_active'>) => Promise<{ error: string | null }>
  updateLocation:  (id: string, updates: Partial<Location>) => Promise<{ error: string | null }>
  deleteLocation:  (id: string) => Promise<{ error: string | null }>
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: null,
  locations: [],
  settings: null,
  isLoading: false,

  fetchTenantData: async (tenantId: string) => {
    set({ isLoading: true })
    try {
      // 1. Fetch Tenant profile
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .maybeSingle()

      // 2. Fetch Locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('tenant_id', tenantId)

      // 3. Fetch Store Settings
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      set({
        tenant: tenantData || null,
        locations: locationsData || [],
        settings: settingsData || null,
      })
    } catch (err) {
      console.error('Error fetching tenant data:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  updateSettings: async (updates) => {
    const { settings, tenant } = get()
    if (!tenant) return { error: 'No active tenant loaded' }

    try {
      if (settings) {
        const { error } = await supabase
          .from('store_settings')
          .update(updates)
          .eq('tenant_id', tenant.id)

        if (error) return { error: error.message }
        set({ settings: { ...settings, ...updates } })
      } else {
        const newSettings = { tenant_id: tenant.id, ...updates }
        const { data, error } = await supabase
          .from('store_settings')
          .insert(newSettings)
          .select()
          .single()

        if (error) return { error: error.message }
        set({ settings: data })
      }
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'An error occurred updating settings' }
    }
  },

  addLocation: async (locationInfo) => {
    const { tenant, locations } = get()
    if (!tenant) return { error: 'No active tenant loaded' }

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          tenant_id: tenant.id,
          ...locationInfo,
          is_active: true
        })
        .select()
        .single()

      if (error) return { error: error.message }
      set({ locations: [...locations, data] })
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'An error occurred adding location' }
    }
  },

  updateLocation: async (id, updates) => {
    const { locations } = get()
    try {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)

      if (error) return { error: error.message }
      set({
        locations: locations.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
      })
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'An error occurred updating location' }
    }
  },

  deleteLocation: async (id) => {
    const { locations } = get()
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (error) return { error: error.message }
      set({
        locations: locations.filter((loc) => loc.id !== id)
      })
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'An error occurred deleting location' }
    }
  }
}))
