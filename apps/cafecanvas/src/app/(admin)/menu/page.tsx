'use client'

import * as React from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  Utensils, 
  Trash2, 
  Edit3, 
  Check, 
  Coffee,
  DollarSign
} from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'

const mockCategories = [
  { id: '1', name: 'Beverages', count: 12 },
  { id: '2', name: 'Snacks & Quick Bites', count: 18 },
  { id: '3', name: 'Main Course', count: 15 },
  { id: '4', name: 'Desserts', count: 8 },
]

const mockItems = [
  { id: '101', catId: '1', name: 'Masala Chai', desc: 'Brewed with fresh ginger, cardamom, and premium Assam tea leaves.', price: 2500, isVeg: true, available: true, featured: true },
  { id: '102', catId: '1', name: 'Cold Coffee with Ice Cream', desc: 'Thick, creamy blended espresso topped with premium vanilla scoop.', price: 12000, isVeg: true, available: true, featured: false },
  { id: '103', catId: '2', name: 'Cheese Garlic Bread', desc: 'Toasted artisanal bread topped with garlic herb butter and dynamic mozzarella pull.', price: 15000, isVeg: true, available: true, featured: true },
  { id: '104', catId: '2', name: 'Chicken Keema Pav', desc: 'Spiced minced chicken masala served with toasted butter pav.', price: 18000, isVeg: false, available: true, featured: false },
  { id: '105', catId: '3', name: 'Paneer Butter Masala Pav', desc: 'Creamy paneer butter masala accompanied by toasted butter soft pav.', price: 22000, isVeg: true, available: false, featured: false }
]

export default function MenuPage() {
  const [activeCat, setActiveCat] = React.useState('1')
  const [search, setSearch] = React.useState('')
  const [dietFilter, setDietFilter] = React.useState<'all' | 'veg' | 'non-veg'>('all')

  const filteredItems = mockItems.filter(item => {
    const matchesCat = item.catId === activeCat
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesDiet = 
      dietFilter === 'all' ? true :
      dietFilter === 'veg' ? item.isVeg === true :
      item.isVeg === false
    return matchesCat && matchesSearch && matchesDiet
  })

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
      {/* 1. LEFT SIDEBAR: CATEGORIES */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Categories</h2>
          <Button variant="ghost" size="sm" className="p-1.5 rounded-full hover:bg-slate-900">
            <Plus className="w-4 h-4 text-indigo-400" />
          </Button>
        </div>

        <Card className="flex-1 overflow-y-auto">
          <CardContent className="p-3 space-y-1">
            {mockCategories.map((cat) => {
              const isActive = activeCat === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-500 font-bold">
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* 2. RIGHT GRID: MENU ITEMS */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Filters Top Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="w-full sm:max-w-xs relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search dishes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Diet filters button row */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-lg border border-slate-900 shrink-0">
            {[
              { id: 'all', name: 'All' },
              { id: 'veg', name: 'Veg only' },
              { id: 'non-veg', name: 'Non-veg' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setDietFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  dietFilter === btn.id 
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid viewport */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-xl text-slate-500 gap-2">
              <Coffee className="w-8 h-8 text-slate-600" />
              <p className="text-sm">No items found matching the filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <Card key={item.id} className="hover:border-slate-800 transition-all flex flex-col justify-between overflow-hidden relative">
                  {/* Item Image Card top placeholder */}
                  <div className="h-32 w-full bg-slate-800/40 border-b border-slate-900/60 flex items-center justify-center text-slate-600 relative">
                    <Coffee className="w-10 h-10 text-slate-700" />
                    {/* Featured items badge overlay */}
                    {item.featured && (
                      <Badge variant="primary" className="absolute top-3 right-3 text-[10px] uppercase font-bold">
                        Featured
                      </Badge>
                    )}
                    {/* Diet dot overlay */}
                    <div className="absolute top-3 left-3 flex items-center justify-center w-5 h-5 rounded-md border border-slate-800 bg-slate-900/80">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-base text-slate-100 line-clamp-1">{item.name}</h3>
                        <span className="font-extrabold text-sm text-indigo-400 shrink-0">₹{(item.price / 100).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                      {/* Availability status tag */}
                      <Badge variant={item.available ? 'success' : 'danger'} className="text-[10px] font-bold">
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-slate-800 text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
