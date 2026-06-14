'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { CartItem } from '../StorefrontClient'

interface MenuItem {
  id: string; name: string; name_hi: string | null
  description: string | null; price_paise: number
  compare_price_paise: number | null; image_url: string | null
  is_available: boolean; is_featured: boolean
  dietary_tags: string[]; prep_time_mins: number
}

interface MenuCategory {
  id: string; name: string; image_url: string | null; sort_order: number
  menu_items: MenuItem[]
}

export function MenuSection({ tenantId, showPrices, featuredOnly, currency: _currency, cartItems, onCartUpdate }: {
  tenantId: string; showPrices: boolean; featuredOnly: boolean
  currency: string; cartItems: CartItem[]; onCartUpdate: (items: CartItem[]) => void
}) {
  const supabase = createClient()
  const [menuVersion, setMenuVersion] = useState(0)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  interface MenuCategoryResponse {
    id: string
    name: string
    image_url: string | null
    sort_order: number
    menu_items: MenuItem[] | null
  }

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      const itemQuery = supabase
        .from('menu_categories')
        .select(`
          id, name, image_url, sort_order,
          menu_items (
            id, name, name_hi, description,
            price_paise, compare_price_paise, image_url,
            is_available, is_featured, dietary_tags, prep_time_mins
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })

      const { data, error } = await itemQuery
      if (!error && data) {
        const processed: MenuCategory[] = (data as unknown as MenuCategoryResponse[]).map(cat => ({
          ...cat,
          menu_items: (cat.menu_items || [])
            .filter((item: MenuItem) => item.is_available)
            .filter((item: MenuItem) => !featuredOnly || item.is_featured)
        })).filter(cat => cat.menu_items.length > 0)

        setCategories(processed)
        if (processed.length > 0) setActiveCategory(processed[0].id)
      }
      setLoading(false)
    }

    fetchMenu()
  }, [tenantId, featuredOnly, supabase, menuVersion])

  // ── REALTIME: listen for menu item changes ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`menu-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'menu_items',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          setMenuVersion(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'menu_categories',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          setMenuVersion(prev => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId, supabase])

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(0)}`
  }

  const addToCart = (item: MenuItem) => {
    onCartUpdate([...cartItems, {
      id: item.id, name: item.name, price_paise: item.price_paise, quantity: 1
    }])
  }

  const filteredCategories = categories.map((cat: MenuCategory) => ({
    ...cat,
    menu_items: cat.menu_items.filter(item =>
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((cat: MenuCategory) => cat.menu_items.length > 0)

  if (loading) return (
    <div className="py-16 text-center text-gray-400">Loading menu...</div>
  )

  if (categories.length === 0) return (
    <div className="py-16 text-center text-gray-400">Menu coming soon.</div>
  )

  return (
    <section id="menu" className="py-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-805 mb-6">Our Menu</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 mb-6 text-sm"
      />

      {/* Category tabs */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
        {categories.map((cat: MenuCategory) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
            }`}
            style={activeCategory === cat.id
              ? { backgroundColor: 'var(--primary)' }
              : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filteredCategories
        .filter((cat: MenuCategory) => !activeCategory || cat.id === activeCategory)
        .map((cat: MenuCategory) => (
          <div key={cat.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{cat.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.menu_items.map(item => (
                <div key={item.id}
                  className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-805 text-sm">{item.name}</p>
                        {item.dietary_tags?.includes('veg') && (
                          <span className="inline-block w-3 h-3 border-2 border-green-600 rounded-sm mr-1">
                            <span className="block w-1.5 h-1.5 bg-green-600 rounded-full m-auto mt-0.5" />
                          </span>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {showPrices && (
                        <div>
                          <span className="font-bold text-gray-805 text-sm">
                            {formatPrice(item.price_paise)}
                          </span>
                          {item.compare_price_paise && item.compare_price_paise > item.price_paise && (
                            <span className="text-xs text-gray-400 line-through ml-1">
                              {formatPrice(item.compare_price_paise)}
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1 rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </section>
  )
}
