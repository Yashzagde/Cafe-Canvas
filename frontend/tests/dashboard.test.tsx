import React from 'react'
import { describe, it, expect, vi } from 'vitest'

// Let's define mock items and test categories filtering logic matching admin/page.tsx
interface MenuItem {
  id: string;
  name: string;
  price: number;
  cat: string;
  status: 'available' | 'unavailable' | 'hidden';
  desc: string;
}

const mockMenu: MenuItem[] = [
  { id: "m1", name: "Classic Cappuccino", price: 290, cat: "Coffee", status: "available", desc: "Double ristretto, microfoam" },
  { id: "m2", name: "Specialty Cold Brew", price: 350, cat: "Coffee", status: "available", desc: "24-hr Ethiopian single origin" },
  { id: "m3", name: "Matcha Latte Special", price: 320, cat: "Tea", status: "available", desc: "Ceremonial grade Uji matcha" },
  { id: "m4", name: "Avocado Sourdough Toast", price: 390, cat: "Food", status: "available", desc: "Organic avocado, feta, dukkah" },
];

export function filterMenuItems(menu: MenuItem[], category: string, search: string) {
  return menu.filter(item => 
    (category === "All" || item.cat === category) && 
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  )
}

describe('Admin Dashboard Catalog & Menu Controller', () => {
  it('should list all items when category filter is set to All', () => {
    const result = filterMenuItems(mockMenu, 'All', '')
    expect(result.length).toBe(4)
  })

  it('should filter items correctly by category', () => {
    const result = filterMenuItems(mockMenu, 'Coffee', '')
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('Classic Cappuccino')
    expect(result[1].name).toBe('Specialty Cold Brew')
  })

  it('should filter items correctly by search query (case-insensitive)', () => {
    const result = filterMenuItems(mockMenu, 'All', 'matcha')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Matcha Latte Special')
  })

  it('should return an empty list if category and search term do not match any item', () => {
    const result = filterMenuItems(mockMenu, 'Tea', 'Avocado')
    expect(result.length).toBe(0)
  })

  it('should handle catalog updates (e.g. status toggles) correctly', () => {
    const toggleStatus = (menu: MenuItem[], id: string): MenuItem[] => {
      return menu.map(item => 
        item.id === id 
          ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' } 
          : item
      )
    }

    const updated = toggleStatus(mockMenu, 'm1')
    expect(updated[0].status).toBe('unavailable')
    expect(updated[1].status).toBe('available') // Unchanged
  })

  it('should handle item additions and auto-generate consecutive sequential IDs', () => {
    const addItem = (menu: MenuItem[], newItem: Omit<MenuItem, 'id'>): MenuItem[] => {
      const nextId = 'm' + (menu.length + 1)
      return [...menu, { ...newItem, id: nextId }]
    }

    const updated = addItem(mockMenu, {
      name: 'Vegan Blueberry Muffin',
      price: 160,
      cat: 'Bakery',
      status: 'available',
      desc: 'Plant-based delicious muffin'
    })

    expect(updated.length).toBe(5)
    expect(updated[4].id).toBe('m5')
    expect(updated[4].name).toBe('Vegan Blueberry Muffin')
  })

  it('should calculate todayOrdersCount correctly by combining today bills and unbilled active orders', () => {
    // Simulate rawOrders for today
    const mockRawOrders = [
      { id: 'o1', created_at: '2026-06-14T05:00:00Z', status: 'served' }, // unbilled order
      { id: 'o2', created_at: '2026-06-14T06:00:00Z', status: 'paid' },   // billed/paid order
      { id: 'o3', created_at: '2026-06-14T07:00:00Z', status: 'pending' },// unbilled order
      { id: 'o4', created_at: '2026-06-14T08:00:00Z', status: 'cancelled' }, // cancelled (should be ignored)
      { id: 'o5', created_at: '2026-06-13T10:00:00Z', status: 'paid' },   // yesterday paid (should be ignored)
    ]

    // Simulate today's bills
    const mockTodayBills = [
      { id: 'b1', created_at: '2026-06-14T06:05:00Z', order_ids: ['o2'] }  // bill linked to o2
    ]

    // Today filter logic matching DashboardTab.tsx
    const nowString = new Date('2026-06-14T10:00:00Z').toDateString()

    const todayBills = mockTodayBills.filter(b => {
      const d = new Date(b.created_at)
      return d.toDateString() === nowString
    })

    const todayOrders = mockRawOrders.filter(o => {
      const d = new Date(o.created_at)
      return d.toDateString() === nowString && o.status !== 'cancelled'
    })

    const billedOrderIds = new Set<string>()
    todayBills.forEach(b => {
      if (Array.isArray(b.order_ids)) {
        b.order_ids.forEach((id: string) => billedOrderIds.add(id))
      }
    })

    const unbilledTodayOrders = todayOrders.filter(o => !billedOrderIds.has(o.id))

    const todayOrdersCount = todayBills.length + unbilledTodayOrders.length

    // Expect: 1 bill (b1) + 2 unbilled active orders (o1, o3) = 3 total orders today
    expect(todayOrdersCount).toBe(3)
  })
})
