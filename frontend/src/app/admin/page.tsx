import { LayoutDashboard, Users, Store, Settings, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-[#0f0f11]">
      {/* Sidebar */}
      <aside className="w-64 glass-dark border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-2 font-bold text-xl mb-12 text-white">
          <Coffee className="text-[#ff6b35]" />
          <span>Admin</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Store size={20} /> Menu Items
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Users size={20} /> Staff
          </Link>
        </nav>
        
        <div className="mt-auto">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Settings size={20} /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cafe Dashboard</h1>
            <p className="text-zinc-400">Welcome back! Here's what's happening today.</p>
          </div>
          <button className="brand-gradient text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/20">
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6 rounded-2xl">
            <div className="text-zinc-400 font-medium mb-1">Today's Sales</div>
            <div className="text-3xl font-bold text-white">$1,248.50</div>
            <div className="text-green-400 text-sm mt-2 font-medium">+14% vs yesterday</div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-zinc-400 font-medium mb-1">Active Orders</div>
            <div className="text-3xl font-bold text-white">24</div>
            <div className="text-zinc-500 text-sm mt-2">6 pending in kitchen</div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-zinc-400 font-medium mb-1">Top Selling Item</div>
            <div className="text-2xl font-bold text-white truncate">Iced Caramel Macchiato</div>
            <div className="text-zinc-500 text-sm mt-2">42 orders today</div>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Time</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { id: '#ORD-092', time: '10:42 AM', amount: '$24.50', status: 'Completed' },
                { id: '#ORD-093', time: '10:45 AM', amount: '$12.00', status: 'Completed' },
                { id: '#ORD-094', time: '10:50 AM', amount: '$8.50', status: 'Preparing' },
                { id: '#ORD-095', time: '10:52 AM', amount: '$32.00', status: 'Pending' },
              ].map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{order.id}</td>
                  <td className="p-4">{order.time}</td>
                  <td className="p-4">{order.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'Preparing' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
