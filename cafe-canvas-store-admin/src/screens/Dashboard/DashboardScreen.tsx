import React from 'react'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import { 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  UtensilsCrossed, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'

// Mock chart data aligned with design aesthetics
const revenueData = [
  { day: 'Mon', revenue: 8400 },
  { day: 'Tue', revenue: 9200 },
  { day: 'Wed', revenue: 11500 },
  { day: 'Thu', revenue: 10200 },
  { day: 'Fri', revenue: 14800 },
  { day: 'Sat', revenue: 18200 },
  { day: 'Sun', revenue: 12450 },
]

const categoryData = [
  { name: 'Beverages', value: 4200, color: '#C4714A' }, // Terracotta
  { name: 'Appetizers', value: 2800, color: '#D4A843' }, // Gold
  { name: 'Main Course', value: 6500, color: '#4ECDC4' }, // Teal
  { name: 'Desserts', value: 1800, color: '#E8735A' }, // Coral
]

const recentOrders = [
  { id: 'ORD-8942', customer: 'Rohan Deshmukh', items: 'Cappuccino x2, Croissant', total: 420, status: 'Preparing', time: '5 mins ago' },
  { id: 'ORD-8941', customer: 'Aparna Sen', items: 'Paneer Tikka Roll, Lemon Tea', total: 310, status: 'Pending', time: '12 mins ago' },
  { id: 'ORD-8940', customer: 'Vikram Seth', items: 'Espresso Macchiato, Blueberry Muffin', total: 290, status: 'Ready', time: '15 mins ago' },
  { id: 'ORD-8939', customer: 'Neha Sharma', items: 'Cold Brew, Club Sandwich', total: 360, status: 'Delivered', time: '32 mins ago' },
]

const onlineStaff = [
  { name: 'Arjun Sharma', role: 'manager', duration: '5h 12m', status: 'Online' },
  { name: 'Rohan Verma', role: 'cashier', duration: '3h 40m', status: 'Online' },
  { name: 'Amit Joshi', role: 'kitchen', duration: '6h 15m', status: 'Online' },
  { name: 'Meera Iyer', role: 'delivery', duration: '2h 10m', status: 'Online' },
]

export function DashboardScreen() {
  const { user } = useAuthStore()
  const { tenant } = useTenantStore()

  // Derive simple greeting time
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Good morning'
    if (hours < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Helper for staff role badge styling
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-canvas-gold/15 text-canvas-brown border-canvas-gold/30'
      case 'cashier':
        return 'bg-canvas-teal/15 text-canvas-brown border-canvas-teal/30'
      case 'kitchen':
        return 'bg-canvas-coral/15 text-canvas-brown border-canvas-coral/30'
      case 'delivery':
        return 'bg-canvas-terracotta/15 text-canvas-brown border-canvas-terracotta/30'
      default:
        return 'bg-canvas-surface text-canvas-brown_mid border-canvas-border'
    }
  }

  // Format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-canvas-brown leading-tight">
            {getGreeting()}, {user?.email?.split('@')[0] || 'Partner'}
          </h2>
          <p className="text-sm text-canvas-brown_mid font-medium mt-1">
            {tenant?.name || 'Aether Café'} · {tenant?.city || 'Pune'} branch operational hub.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 text-xs font-bold bg-canvas-surface text-canvas-brown border border-canvas-border rounded-lg shadow-sm">
            Primary: Main Location
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-canvas-terracotta text-white p-6 rounded-xl border border-canvas-terra_dark/20 shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <IndianRupee className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-cream/80">Today's Revenue</span>
            <span className="p-1 rounded bg-white/20 text-[10px] font-bold flex items-center gap-0.5">
              +12% <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">{formatINR(12450)}</p>
          <p className="text-[10px] text-canvas-cream/70 font-semibold mt-2">vs yesterday</p>
        </div>

        {/* Orders Card */}
        <div className="bg-canvas-gold text-canvas-brown p-6 rounded-xl border border-canvas-champagne shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-brown_mid">Active Orders</span>
            <span className="p-1 rounded bg-canvas-brown/10 text-[10px] font-bold">POS Live</span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">8</p>
          <p className="text-[10px] text-canvas-brown_mid font-semibold mt-2">3 pending · 5 preparing</p>
        </div>

        {/* Staff Card */}
        <div className="bg-canvas-teal text-canvas-brown p-6 rounded-xl border border-canvas-teal_light/30 shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <Users className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-brown_mid">Total Staff</span>
            <span className="p-1 rounded bg-canvas-brown/10 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-canvas-sage animate-ping"></span> Live
            </span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">50</p>
          <p className="text-[10px] text-canvas-brown_mid font-semibold mt-2">4 staff online now</p>
        </div>

        {/* Menu Items Card */}
        <div className="bg-canvas-coral text-white p-6 rounded-xl border border-canvas-coral/20 shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-cream/80">Menu Catalog</span>
            <span className="p-1 rounded bg-white/20 text-[10px] font-bold">124 Items</span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">124</p>
          <p className="text-[10px] text-canvas-cream/70 font-semibold mt-2 text-red-100 font-bold">8 out of stock today</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm">
          <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
            Weekly Revenue Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B7" opacity={0.5} />
                <XAxis dataKey="day" stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFEEDD', border: '1px solid #E8D5B7', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#3D2B1F' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C4714A" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, fill: '#D4A843', stroke: '#C4714A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm">
          <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
            Sales by Category
          </h3>
          <div className="h-64 flex flex-col items-center justify-between">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Pie Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs font-semibold text-canvas-brown_mid mt-2">
              {categoryData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Online Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders table */}
        <div className="lg:col-span-2 bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
              Recent Live Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-canvas-brown border-collapse">
                <thead>
                  <tr className="border-b border-canvas-border text-canvas-brown_mid bg-canvas-cream/50">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border/50">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-canvas-cream/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-canvas-terracotta">{ord.id}</td>
                      <td className="py-3 px-3 truncate max-w-[120px]">{ord.customer}</td>
                      <td className="py-3 px-3 truncate max-w-[180px] text-canvas-brown_mid">{ord.items}</td>
                      <td className="py-3 px-3 font-bold">{formatINR(ord.total)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'Preparing' ? 'bg-canvas-terracotta/15 text-canvas-terracotta' :
                          ord.status === 'Pending' ? 'bg-canvas-gold/15 text-canvas-brown' :
                          ord.status === 'Ready' ? 'bg-canvas-teal/15 text-canvas-teal' :
                          'bg-canvas-sage/15 text-canvas-sage'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Staff Online status */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
              Online Staff
            </h3>
            <div className="space-y-3.5">
              {onlineStaff.map((staff, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-canvas-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-canvas-brown text-canvas-cream font-bold text-xs flex items-center justify-center">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-canvas-brown">{staff.name}</p>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border mt-0.5 ${getRoleBadgeClass(staff.role)}`}>
                        {staff.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-bold text-canvas-brown_mid flex items-center gap-1">
                      <Clock className="w-3 h-3 text-canvas-gold" />
                      {staff.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
