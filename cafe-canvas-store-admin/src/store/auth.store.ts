import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session:    Session | null
  user:       User | null
  tenantId:   string | null
  role:       string | null
  isLoading:  boolean
  signIn:     (email: string, password: string) => Promise<{ error: string | null }>
  signOut:    () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  tenantId: null,
  role: null,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user) {
        let tenantId: string | null = null
        let role: string | null = null

        // Resolve staff details
        const { data: staff } = await supabase
          .from('staff_accounts')
          .select('tenant_id, role')
          .eq('auth_user_id', session.user.id)
          .maybeSingle()

        if (staff) {
          tenantId = staff.tenant_id
          role = staff.role
        } else if (session.user.email) {
          // Check if this is the tenant owner email
          const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('email', session.user.email)
            .maybeSingle()

          if (tenant) {
            tenantId = tenant.id
            role = 'manager' // Treat owner as manager
          }
        }

        set({ 
          session, 
          user: session.user, 
          tenantId, 
          role, 
          isLoading: false 
        })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      console.error('Failed to initialize auth session:', err)
      set({ isLoading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        let tenantId: string | null = null
        let role: string | null = null

        const { data: staff } = await supabase
          .from('staff_accounts')
          .select('tenant_id, role')
          .eq('auth_user_id', session.user.id)
          .maybeSingle()

        if (staff) {
          tenantId = staff.tenant_id
          role = staff.role
        } else if (session.user.email) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('email', session.user.email)
            .maybeSingle()

          if (tenant) {
            tenantId = tenant.id
            role = 'manager'
          }
        }
        set({ session, user: session.user, tenantId, role })
      } else {
        set({ session: null, user: null, tenantId: null, role: null })
      }
    })
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (!data.user) return { error: 'No user data returned' }

      let tenantId: string | null = null
      let role: string | null = null

      const { data: staff } = await supabase
        .from('staff_accounts')
        .select('tenant_id, role')
        .eq('auth_user_id', data.user.id)
        .maybeSingle()

      if (staff) {
        tenantId = staff.tenant_id
        role = staff.role
      } else if (data.user.email) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('email', data.user.email)
          .maybeSingle()

        if (tenant) {
          tenantId = tenant.id
          role = 'manager'
        }
      }

      set({ session: data.session, user: data.user, tenantId, role })
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'An unknown error occurred during sign in' }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error during sign out:', err)
    } finally {
      set({ session: null, user: null, tenantId: null, role: null })
    }
  },
}))
