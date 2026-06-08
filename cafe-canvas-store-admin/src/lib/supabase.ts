import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment')
}

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    ...(isElectron && {
      storage: {
        // Use Electron-safe storage (file-based, encrypted, not localstorage)
        getItem:    (key) => window.electronAPI.secureGet(key),
        setItem:    async (key, val) => { await window.electronAPI.secureSet(key, val) },
        removeItem: async (key) => { await window.electronAPI.secureRemove(key) },
      },
    }),
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  false,
  }
})
