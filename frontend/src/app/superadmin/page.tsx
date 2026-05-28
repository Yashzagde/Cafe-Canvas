import { Building2, Users, Activity, BarChart3, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminDashboard() {
  return (
    <div className="min-h-screen flex bg-[#0f0f11] text-white">
      {/* Sidebar */}
      <aside className="w-64 glass-dark border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-2 font-bold text-xl mb-12 text-white">
          <ShieldAlert className="text-purple-500" />
          <span>Superadmin</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/superadmin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium">
            <Activity size={20} /> Platform Health
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Building2 size={20} /> All Stores
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Users size={20} /> All Users
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <BarChart3 size={20} /> Global Reports
          </Link>
        </nav>
        
        <div className="mt-auto">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors">
            <Settings size={20} /> System Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
            <p className="text-zinc-400">System metrics and global performance</p>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass p-6 rounded-2xl border-t-2 border-t-purple-500">
            <div className="text-zinc-400 font-medium mb-1">Total Stores</div>
            <div className="text-3xl font-bold">142</div>
            <div className="text-green-400 text-sm mt-2 font-medium">+12 this month</div>
          </div>
          <div className="glass p-6 rounded-2xl border-t-2 border-t-blue-500">
            <div className="text-zinc-400 font-medium mb-1">Active Users</div>
            <div className="text-3xl font-bold">4,892</div>
            <div className="text-green-400 text-sm mt-2 font-medium">+18% vs last month</div>
          </div>
          <div className="glass p-6 rounded-2xl border-t-2 border-t-green-500">
            <div className="text-zinc-400 font-medium mb-1">Gross Volume (30d)</div>
            <div className="text-3xl font-bold">$2.4M</div>
          </div>
          <div className="glass p-6 rounded-2xl border-t-2 border-t-orange-500">
            <div className="text-zinc-400 font-medium mb-1">System Health</div>
            <div className="text-3xl font-bold text-green-400">99.99%</div>
            <div className="text-zinc-500 text-sm mt-2">All systems operational</div>
          </div>
        </div>

        {/* Stores Table */}
        <h2 className="text-xl font-bold mb-6">Recent Store Signups</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4 font-medium">Store Name</th>
                <th className="p-4 font-medium">Owner Email</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Brew & Bake', email: 'john@brew.com', status: 'Active', date: 'Today' },
                { name: 'Downtown Roasters', email: 'sarah@dt.com', status: 'Pending', date: 'Yesterday' },
                { name: 'Sunny Side Cafe', email: 'owner@sunny.com', status: 'Active', date: 'May 24' },
              ].map((store, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{store.name}</td>
                  <td className="p-4">{store.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      store.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="p-4">{store.date}</td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Manage</button>
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
