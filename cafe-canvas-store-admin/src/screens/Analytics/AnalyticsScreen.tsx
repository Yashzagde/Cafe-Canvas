import { useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { BarChart3, TrendingUp, ShoppingCart, IndianRupee } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useAnalyticsStore } from '../../store/analytics.store'
import { Card, CardHeader, StatCard } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { SkeletonStats, SkeletonCard } from '../../components/ui/Skeleton'
import { formatRupees } from '../../lib/utils'

export function AnalyticsScreen() {
  const { tenantId } = useAuthStore()
  const { summary, revenueChart, topItems, isLoading, dateRange, setDateRange, fetchSummary, fetchRevenueChart, fetchTopItems } = useAnalyticsStore()

  useEffect(() => {
    if (tenantId) {
      fetchSummary(tenantId)
      fetchRevenueChart(tenantId)
      fetchTopItems(tenantId)
    }
  }, [tenantId, fetchSummary, fetchRevenueChart, fetchTopItems])

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'Quarter' },
  ]

  const revenueChange = summary
    ? summary.yesterdayRevenue > 0
      ? Math.round(((summary.todayRevenue - summary.yesterdayRevenue) / summary.yesterdayRevenue) * 100)
      : summary.todayRevenue > 0 ? 100 : 0
    : 0

  if (isLoading && !summary) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Analytics</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">Revenue insights and performance metrics</p>
        </div>
        <Tabs tabs={tabs} activeTab={dateRange} onChange={(id) => setDateRange(id as typeof dateRange)} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          value={formatRupees((summary?.todayRevenue || 0) / 100)}
          change={`${revenueChange >= 0 ? '+' : ''}${revenueChange}%`}
          changeType={revenueChange >= 0 ? 'positive' : 'negative'}
          icon={<IndianRupee className="w-24 h-24" />}
          color="bg-canvas-terracotta"
        />
        <StatCard
          label="Today's Orders"
          value={summary?.todayOrders || 0}
          icon={<ShoppingCart className="w-24 h-24" />}
          color="bg-canvas-gold"
          textColor="text-canvas-brown"
        />
        <StatCard
          label="Avg Order Value"
          value={formatRupees((summary?.avgOrderValue || 0) / 100)}
          icon={<TrendingUp className="w-24 h-24" />}
          color="bg-canvas-teal"
          textColor="text-canvas-brown"
        />
        <StatCard
          label="Week Revenue"
          value={formatRupees((summary?.weekRevenue || 0) / 100)}
          icon={<BarChart3 className="w-24 h-24" />}
          color="bg-canvas-coral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Revenue Trend" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart.map((d) => ({ ...d, revenue: d.revenue / 100 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B7" opacity={0.5} />
                <XAxis dataKey="date" stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
                <Tooltip contentStyle={{ backgroundColor: '#FFEEDD', border: '1px solid #E8D5B7', borderRadius: '8px' }} formatter={(value: number) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#C4714A" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, fill: '#D4A843', stroke: '#C4714A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader title="Top Selling Items" subtitle="By quantity sold" />
          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-xs text-canvas-brown_mid text-center py-8">No sales data yet</p>
            ) : (
              topItems.slice(0, 8).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-canvas-terracotta/10 text-canvas-terracotta text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-canvas-brown truncate">{item.name}</p>
                    <div className="w-full bg-canvas-border/30 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-canvas-terracotta h-1.5 rounded-full"
                        style={{ width: `${Math.min((item.quantity / (topItems[0]?.quantity || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-canvas-brown_mid shrink-0">{item.quantity} sold</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card>
        <CardHeader title="Daily Order Volume" />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B7" opacity={0.5} />
              <XAxis dataKey="date" stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
              <YAxis stroke="#7A5C4A" fontSize={11} fontWeight="bold" />
              <Tooltip contentStyle={{ backgroundColor: '#FFEEDD', border: '1px solid #E8D5B7', borderRadius: '8px' }} />
              <Bar dataKey="orders" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
