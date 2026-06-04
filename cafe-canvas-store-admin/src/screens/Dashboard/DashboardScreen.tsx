import { useEffect, useState } from 'react'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
import { useUIStore } from '../../store/ui.store'
import { supabase } from '../../lib/supabase'
import { formatRupees } from '../../lib/utils'

interface RevenueTrend {
  day: string
  revenue: number
}

interface CategoryPie {
  name: string
  value: number
  color: string
}

interface LiveOrder {
  id: string
  customer: string
  items: string
  total: number
  status: string
  time: string
}

interface LiveStaff {
  name: string
  role: string
  duration: string
  status: string
}

export function DashboardScreen() {
  const { user, tenantId } = useAuthStore()
  const { tenant } = useTenantStore()
  const { setScreen } = useUIStore()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    totalStaff: 0,
    onlineStaff: 0,
    totalMenuItems: 0,
    outOfStockItems: 0,
    revenueChange: 0
  })

  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([])
  const [categoryData, setCategoryData] = useState<CategoryPie[]>([])
  const [recentOrders, setRecentOrders] = useState<LiveOrder[]>([])
  const [onlineStaffList, setOnlineStaffList] = useState<LiveStaff[]>([])

  useEffect(() => {
    if (!tenantId) return

    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
        const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString()

        // 1. Today's Revenue & Yesterday's Revenue
        const { data: todayBills } = await supabase
          .from('bills')
          .select('total')
          .eq('tenant_id', tenantId)
          .eq('status', 'paid')
          .gte('paid_at', startOfToday)

        const { data: yesterdayBills } = await supabase
          .from('bills')
          .select('total')
          .eq('tenant_id', tenantId)
          .eq('status', 'paid')
          .gte('paid_at', startOfYesterday)
          .lt('paid_at', startOfToday)

        const todayRevenueTotal = (todayBills || []).reduce((sum, b) => sum + (b.total || 0), 0)
        const yesterdayRevenueTotal = (yesterdayBills || []).reduce((sum, b) => sum + (b.total || 0), 0)
        
        let revenueChange = 0
        if (yesterdayRevenueTotal > 0) {
          revenueChange = Math.round(((todayRevenueTotal - yesterdayRevenueTotal) / yesterdayRevenueTotal) * 100)
        } else if (todayRevenueTotal > 0) {
          revenueChange = 100
        }

        // 2. Active Orders
        const { count: activeOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready'])

        // 3. Staff Accounts
        const { data: staffData } = await supabase
          .from('staff_accounts')
          .select('full_name, role, is_active')
          .eq('tenant_id', tenantId)

        const totalStaff = staffData?.length || 0
        const onlineStaff = staffData?.filter(s => s.is_active).length || 0

        // Map live staff for the list
        const resolvedStaffList: LiveStaff[] = (staffData || []).slice(0, 4).map(s => ({
          name: s.full_name,
          role: s.role,
          duration: 'Shift Active',
          status: s.is_active ? 'Online' : 'Offline'
        }))
        setOnlineStaffList(resolvedStaffList)

        // 4. Menu Items
        const { data: itemsData } = await supabase
          .from('menu_items')
          .select('id, is_available, category_id')
          .eq('tenant_id', tenantId)

        const totalMenuItems = itemsData?.length || 0
        const outOfStockItems = itemsData?.filter(i => !i.is_available).length || 0

        setStats({
          todayRevenue: todayRevenueTotal,
          activeOrders: activeOrdersCount || 0,
          totalStaff,
          onlineStaff,
          totalMenuItems,
          outOfStockItems,
          revenueChange
        })

        // 5. Weekly Revenue Trend Chart
        const days = 7
        const trend: RevenueTrend[] = []
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()
          
          const { data: dayBills } = await supabase
            .from('bills')
            .select('total')
            .eq('tenant_id', tenantId)
            .eq('status', 'paid')
            .gte('paid_at', dayStart)
            .lt('paid_at', dayEnd)
            
          const dayTotal = (dayBills || []).reduce((sum, b) => sum + (b.total || 0), 0)
          trend.push({
            day: dayNames[date.getDay()],
            revenue: Math.round(dayTotal / 100) // Display in Rupees
          })
        }
        setRevenueTrend(trend)

        // 6. Category distribution Pie Chart
        const { data: categories } = await supabase
          .from('menu_categories')
          .select('id, name')
          .eq('tenant_id', tenantId)

        if (categories && itemsData) {
          const colors = ['#C4714A', '#D4A843', '#4ECDC4', '#E8735A', '#7A5C4A', '#8E9AAF']
          const dist: CategoryPie[] = categories.map((cat, index) => {
            const count = itemsData.filter(item => item.category_id === cat.id).length
            return {
              name: cat.name,
              value: count,
              color: colors[index % colors.length]
            }
          }).filter(c => c.value > 0)
          setCategoryData(dist)
        }

        // 7. Recent live orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('id, customer_name, total, status, created_at, items:order_items(item_name, quantity)')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(4)

        if (recentOrdersData) {
          const mappedOrders: LiveOrder[] = recentOrdersData.map(o => {
            const itemsStr = (o.items || []).map((item: any) => `${item.item_name} x${item.quantity}`).join(', ')
            const mins = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000)
            const timeStr = mins < 1 ? 'Just now' : `${mins}m ago`
            return {
              id: `ORD-${o.id.slice(-4).toUpperCase()}`,
              customer: o.customer_name || 'Walk-in Customer',
              items: itemsStr || 'No items',
              total: o.total,
              status: o.status,
              time: timeStr
            }
          })
          setRecentOrders(mappedOrders)
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [tenantId])

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 flex-grow h-full select-none">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-canvas-champagne border-t-canvas-terracotta"></div>
        <p className="mt-3 text-xs font-bold text-canvas-brown_mid">Loading dashboard analytics...</p>
      </div>
    )
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
            {tenant?.name || 'CafeCanvas'} · {tenant?.city || 'Operational'} branch hub.
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm">
        <h3 className="text-xs font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => setScreen('orders')} 
            className="p-4 rounded-xl border border-canvas-border bg-canvas-cream hover:bg-canvas-terracotta/5 hover:border-canvas-terracotta transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-canvas-terracotta group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-canvas-brown">Manage Orders</span>
          </button>
          <button 
            onClick={() => setScreen('menu')} 
            className="p-4 rounded-xl border border-canvas-border bg-canvas-cream hover:bg-canvas-terracotta/5 hover:border-canvas-terracotta transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <UtensilsCrossed className="w-5 h-5 text-canvas-gold group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-canvas-brown">Edit Menu</span>
          </button>
          <button 
            onClick={() => setScreen('kds')} 
            className="p-4 rounded-xl border border-canvas-border bg-canvas-cream hover:bg-canvas-terracotta/5 hover:border-canvas-terracotta transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <Clock className="w-5 h-5 text-canvas-teal group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-canvas-brown">Kitchen KDS</span>
          </button>
          <button 
            onClick={() => setScreen('billing')} 
            className="p-4 rounded-xl border border-canvas-border bg-canvas-cream hover:bg-canvas-terracotta/5 hover:border-canvas-terracotta transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <IndianRupee className="w-5 h-5 text-canvas-coral group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-canvas-brown">GST Billing</span>
          </button>
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
              {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">{formatRupees(stats.todayRevenue / 100)}</p>
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
          <p className="font-display text-3xl font-extrabold mt-3">{stats.activeOrders}</p>
          <p className="text-[10px] text-canvas-brown_mid font-semibold mt-2">orders preparing in kitchen</p>
        </div>

        {/* Staff Card */}
        <div className="bg-canvas-teal text-canvas-brown p-6 rounded-xl border border-canvas-teal_light/30 shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <Users className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-brown_mid">Active Staff</span>
            <span className="p-1 rounded bg-canvas-brown/10 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-canvas-sage animate-ping"></span> Live
            </span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">{stats.onlineStaff}</p>
          <p className="text-[10px] text-canvas-brown_mid font-semibold mt-2">out of {stats.totalStaff} staff registered</p>
        </div>

        {/* Menu Items Card */}
        <div className="bg-canvas-coral text-white p-6 rounded-xl border border-canvas-coral/20 shadow-md relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-canvas-cream/80">Menu Catalog</span>
            <span className="p-1 rounded bg-white/20 text-[10px] font-bold">{stats.totalMenuItems} Items</span>
          </div>
          <p className="font-display text-3xl font-extrabold mt-3">{stats.totalMenuItems}</p>
          <p className="text-[10px] text-canvas-cream/70 font-semibold mt-2 font-bold">
            {stats.outOfStockItems > 0 ? `${stats.outOfStockItems} unavailable today` : 'All items in stock'}
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm">
          <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
            Weekly Revenue Trend (₹)
          </h3>
          <div className="h-64">
            {revenueTrend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-canvas-brown_mid">No revenue data for trend</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm">
          <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
            Menu Item Distribution
          </h3>
          <div className="h-64 flex flex-col items-center justify-between">
            <div className="w-full h-44">
              {categoryData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-canvas-brown_mid">No menu items configured</div>
              ) : (
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
                    <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Custom Pie Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-[10px] font-bold text-canvas-brown_mid mt-2 max-h-16 overflow-y-auto">
              {categoryData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate">{entry.name} ({entry.value})</span>
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
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-canvas-brown_mid font-bold">No orders placed yet</div>
            ) : (
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
                        <td className="py-3 px-3 font-bold">{formatRupees(ord.total / 100)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === 'preparing' ? 'bg-canvas-terracotta/15 text-canvas-terracotta' :
                            ord.status === 'pending' ? 'bg-canvas-gold/15 text-canvas-brown' :
                            ord.status === 'ready' ? 'bg-canvas-teal/15 text-canvas-teal' :
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
            )}
          </div>
        </div>

        {/* Staff Online status */}
        <div className="bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider mb-4">
              Registered Staff
            </h3>
            {onlineStaffList.length === 0 ? (
              <div className="text-center py-12 text-xs text-canvas-brown_mid font-bold">No staff accounts found</div>
            ) : (
              <div className="space-y-3.5">
                {onlineStaffList.map((staff, idx) => (
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
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Online' ? 'bg-canvas-sage animate-pulse' : 'bg-canvas-coral'}`} />
                        {staff.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
