'use client'

import * as React from 'react'
import { 
  Grid, 
  Layers, 
  MapPin, 
  Users, 
  Activity, 
  Plus, 
  Settings 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'

interface TableData {
  id: string
  name: string
  capacity: number
  section: 'Indoor' | 'Outdoor' | 'Balcony'
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
}

const initialTables: TableData[] = [
  { id: '1', name: 'T-01', capacity: 2, section: 'Indoor', status: 'available' },
  { id: '2', name: 'T-02', capacity: 4, section: 'Indoor', status: 'occupied' },
  { id: '3', name: 'T-03', capacity: 4, section: 'Indoor', status: 'reserved' },
  { id: '4', name: 'T-04', capacity: 6, section: 'Outdoor', status: 'available' },
  { id: '5', name: 'T-05', capacity: 2, section: 'Outdoor', status: 'cleaning' },
  { id: '6', name: 'T-06', capacity: 4, section: 'Balcony', status: 'available' },
  { id: '7', name: 'T-07', capacity: 4, section: 'Balcony', status: 'occupied' },
  { id: '8', name: 'T-08', capacity: 6, section: 'Indoor', status: 'available' }
]

export default function TablesPage() {
  const [tables, setTables] = React.useState<TableData[]>(initialTables)
  const [activeSection, setActiveSection] = React.useState<'All' | 'Indoor' | 'Outdoor' | 'Balcony'>('All')

  // Status cycling for live non-placeholder interactivity!
  const cycleStatus = (id: string) => {
    const statuses: TableData['status'][] = ['available', 'occupied', 'reserved', 'cleaning']
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        const nextIndex = (statuses.indexOf(t.status) + 1) % statuses.length
        return { ...t, status: statuses[nextIndex] }
      }
      return t
    }))
  }

  const filteredTables = tables.filter(t => 
    activeSection === 'All' ? true : t.section === activeSection
  )

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  }

  return (
    <div className="space-y-6">
      {/* 1. STATUS SUMMARY CARDS */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card className="hover:border-slate-800 transition-all p-4 flex flex-col justify-between h-20">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Tables</span>
          <span className="text-2xl font-bold text-slate-100">{stats.total}</span>
        </Card>
        <Card className="hover:border-slate-800 transition-all p-4 flex flex-col justify-between h-20">
          <span className="text-xs font-semibold text-emerald-500 uppercase">Available</span>
          <span className="text-2xl font-bold text-emerald-400">{stats.available}</span>
        </Card>
        <Card className="hover:border-slate-800 transition-all p-4 flex flex-col justify-between h-20">
          <span className="text-xs font-semibold text-indigo-500 uppercase">Occupied</span>
          <span className="text-2xl font-bold text-indigo-400">{stats.occupied}</span>
        </Card>
        <Card className="hover:border-slate-800 transition-all p-4 flex flex-col justify-between h-20">
          <span className="text-xs font-semibold text-amber-500 uppercase">Reserved</span>
          <span className="text-2xl font-bold text-amber-400">{stats.reserved}</span>
        </Card>
        <Card className="hover:border-slate-800 transition-all p-4 flex flex-col justify-between h-20">
          <span className="text-xs font-semibold text-slate-400 uppercase">Cleaning</span>
          <span className="text-2xl font-bold text-slate-300">{stats.cleaning}</span>
        </Card>
      </div>

      {/* 2. SECTION SELECTION FILTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Dynamic section tabs */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-lg border border-slate-900 w-full sm:w-auto overflow-x-auto">
          {['All', 'Indoor', 'Outdoor', 'Balcony'].map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeSection === sec 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <Button className="w-full sm:w-auto gap-2 shrink-0">
          <Plus className="w-4 h-4 text-indigo-200" />
          <span>Add Table</span>
        </Button>
      </div>

      {/* 3. DYNAMIC INTERACTIVE TABLES GRID */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredTables.map(t => (
          <Card 
            key={t.id} 
            className="hover:border-slate-700 transition-all border border-slate-800 cursor-pointer overflow-hidden group"
            onClick={() => cycleStatus(t.id)}
          >
            <div className="p-5 space-y-4">
              {/* Header: Table label and layout icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">
                    {t.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-900 px-2 py-1 rounded-md">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{t.capacity} Seated</span>
                  </div>
                </div>
                {/* Active settings trigger */}
                <Button variant="ghost" size="sm" className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                </Button>
              </div>

              {/* Status and dynamic description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Serving Status</span>
                  <Badge variant={
                    t.status === 'available' ? 'success' :
                    t.status === 'occupied' ? 'indigo' as any :
                    t.status === 'reserved' ? 'warning' : 'secondary'
                  } className="text-[9px] uppercase tracking-wider font-extrabold">
                    {t.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{t.section} Floor Layout</span>
                </div>
              </div>
            </div>

            {/* Bottom Interactivity Nudge banner */}
            <div className="bg-slate-950/40 border-t border-slate-900/60 px-5 py-2 text-[10px] text-slate-500 font-medium flex items-center justify-between">
              <span>Click card to cycle status</span>
              <Activity className="w-3 h-3 text-slate-600 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
