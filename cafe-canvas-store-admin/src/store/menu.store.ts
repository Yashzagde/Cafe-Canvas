import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MenuCategory {
  id: string
  tenant_id: string
  name: string
  name_hi?: string
  description?: string
  sort_order: number
  is_visible: boolean
  item_count?: number
  created_at: string
}

export interface MenuItem {
  id: string
  tenant_id: string
  category_id: string
  name: string
  name_hi?: string
  description?: string
  price: number           // paise
  compare_price?: number  // paise (strikethrough price)
  image_url?: string
  is_available: boolean
  is_featured: boolean
  dietary_tags: string[]
  prep_time_mins?: number
  sort_order: number
  created_at: string
  category?: MenuCategory
}

export interface ModifierGroup {
  id: string
  tenant_id: string
  name: string
  min_select: number
  max_select: number
  is_required: boolean
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  group_id: string
  name: string
  price: number  // paise
  is_available: boolean
  sort_order: number
}

// ─── State ───────────────────────────────────────────────────────────────────

interface MenuState {
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  isLoading: boolean
  selectedCategoryId: string | null

  // Category actions
  fetchCategories: (tenantId: string) => Promise<void>
  createCategory: (tenantId: string, data: Partial<MenuCategory>) => Promise<{ error: string | null }>
  updateCategory: (id: string, data: Partial<MenuCategory>) => Promise<{ error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  setSelectedCategory: (id: string | null) => void

  // Item actions
  fetchItems: (tenantId: string, categoryId?: string) => Promise<void>
  createItem: (tenantId: string, data: Partial<MenuItem>) => Promise<{ error: string | null }>
  updateItem: (id: string, data: Partial<MenuItem>) => Promise<{ error: string | null }>
  deleteItem: (id: string) => Promise<{ error: string | null }>
  toggleItemAvailability: (id: string, available: boolean) => Promise<void>

  // Modifier actions
  fetchModifiers: (tenantId: string) => Promise<void>
  createModifierGroup: (tenantId: string, data: Partial<ModifierGroup>) => Promise<{ error: string | null }>
  deleteModifierGroup: (id: string) => Promise<{ error: string | null }>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  items: [],
  modifierGroups: [],
  isLoading: false,
  selectedCategoryId: null,

  setSelectedCategory: (id) => set({ selectedCategoryId: id }),

  // ── Categories ────────────────────────────────────────────────────────────

  fetchCategories: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      set({ categories: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch categories'
      toast.error('Error', msg)
    } finally {
      set({ isLoading: false })
    }
  },

  createCategory: async (tenantId, data) => {
    try {
      const { categories } = get()
      const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0)

      const { data: newCat, error } = await supabase
        .from('menu_categories')
        .insert({
          tenant_id: tenantId,
          name: data.name || 'New Category',
          name_hi: data.name_hi,
          description: data.description,
          sort_order: maxOrder + 1,
          is_visible: true,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      set({ categories: [...categories, newCat] })
      toast.success('Category created', `"${newCat.name}" added to menu`)
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category'
      return { error: msg }
    }
  },

  updateCategory: async (id, data) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update(data)
        .eq('id', id)

      if (error) return { error: error.message }
      set({
        categories: get().categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
      })
      toast.success('Category updated')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update category'
      return { error: msg }
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase.from('menu_categories').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ categories: get().categories.filter((c) => c.id !== id) })
      toast.success('Category deleted')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category'
      return { error: msg }
    }
  },

  // ── Items ──────────────────────────────────────────────────────────────────

  fetchItems: async (tenantId, categoryId) => {
    set({ isLoading: true })
    try {
      let query = supabase
        .from('menu_items')
        .select('*, category:menu_categories(id, name)')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) throw error
      set({ items: data || [] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch items'
      toast.error('Error', msg)
    } finally {
      set({ isLoading: false })
    }
  },

  createItem: async (tenantId, data) => {
    try {
      const { items } = get()
      const maxOrder = items.reduce((max, i) => Math.max(max, i.sort_order), 0)

      const { data: newItem, error } = await supabase
        .from('menu_items')
        .insert({
          tenant_id: tenantId,
          category_id: data.category_id,
          name: data.name || 'New Item',
          name_hi: data.name_hi,
          description: data.description,
          price: data.price || 0,
          compare_price: data.compare_price,
          image_url: data.image_url,
          is_available: true,
          is_featured: data.is_featured || false,
          dietary_tags: data.dietary_tags || [],
          prep_time_mins: data.prep_time_mins,
          sort_order: maxOrder + 1,
        })
        .select('*, category:menu_categories(id, name)')
        .single()

      if (error) return { error: error.message }
      set({ items: [...items, newItem] })
      toast.success('Item created', `"${newItem.name}" added to menu`)
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create item'
      return { error: msg }
    }
  },

  updateItem: async (id, data) => {
    try {
      const { error } = await supabase.from('menu_items').update(data).eq('id', id)
      if (error) return { error: error.message }
      set({
        items: get().items.map((i) => (i.id === id ? { ...i, ...data } : i)),
      })
      toast.success('Item updated')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update item'
      return { error: msg }
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ items: get().items.filter((i) => i.id !== id) })
      toast.success('Item deleted')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item'
      return { error: msg }
    }
  },

  toggleItemAvailability: async (id, available) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: available })
      .eq('id', id)

    if (!error) {
      set({
        items: get().items.map((i) => (i.id === id ? { ...i, is_available: available } : i)),
      })
    }
  },

  // ── Modifiers ──────────────────────────────────────────────────────────────

  fetchModifiers: async (tenantId) => {
    try {
      const { data: groups, error: gErr } = await supabase
        .from('modifier_groups')
        .select('*')
        .eq('tenant_id', tenantId)

      if (gErr) throw gErr

      const { data: options, error: oErr } = await supabase
        .from('modifier_options')
        .select('*')
        .in('group_id', (groups || []).map((g) => g.id))
        .order('sort_order', { ascending: true })

      if (oErr) throw oErr

      const enriched = (groups || []).map((g) => ({
        ...g,
        options: (options || []).filter((o) => o.group_id === g.id),
      }))

      set({ modifierGroups: enriched })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch modifiers'
      toast.error('Error', msg)
    }
  },

  createModifierGroup: async (tenantId, data) => {
    try {
      const { data: newGroup, error } = await supabase
        .from('modifier_groups')
        .insert({
          tenant_id: tenantId,
          name: data.name || 'New Group',
          min_select: data.min_select || 0,
          max_select: data.max_select || 1,
          is_required: data.is_required || false,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      set({
        modifierGroups: [...get().modifierGroups, { ...newGroup, options: [] }],
      })
      toast.success('Modifier group created')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create modifier group'
      return { error: msg }
    }
  },

  deleteModifierGroup: async (id) => {
    try {
      const { error } = await supabase.from('modifier_groups').delete().eq('id', id)
      if (error) return { error: error.message }
      set({ modifierGroups: get().modifierGroups.filter((g) => g.id !== id) })
      toast.success('Modifier group deleted')
      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete modifier group'
      return { error: msg }
    }
  },
}))
