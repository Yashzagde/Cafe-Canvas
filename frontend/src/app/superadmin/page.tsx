'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Activity, BarChart3, Settings, ShieldAlert, 
  Plus, Check, X, Shield, Mail, Globe, Key, AlertTriangle, Trash2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
}

interface Branch {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Staff {
  id: string;
  tenantId: string;
  branchId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

const BACKEND_URL = 'http://localhost:5000/api/super-admin';

// Local storage helper for dev fallback
const getLocalData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const setLocalData = <T,>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export default function SuperadminDashboard() {
  // State
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalBranches: 0,
    totalUsers: 0,
    systemHealth: '99.99%'
  });
  
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantDetails, setTenantDetails] = useState<{ branches: Branch[]; staff: Staff[] }>({ branches: [], staff: [] });
  
  // Modals & UI States
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedTenantUrl, setGeneratedTenantUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Forms
  const [tenantForm, setTenantForm] = useState({
    tenantName: '',
    subdomain: '',
    plan: 'free',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: ''
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    branchId: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Try to fetch stats
      const statsRes = await fetch(`${BACKEND_URL}/stats`);
      const statsData = await statsRes.json();
      
      const tenantsRes = await fetch(`${BACKEND_URL}/tenants`);
      const tenantsData = await tenantsRes.json();
      
      if (statsData.success && tenantsData.success) {
        setStats(statsData.stats);
        setTenantsList(tenantsData.tenants);
        setIsDemoMode(false);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.warn('Backend offline, using localStorage fallback simulation mode.');
      setIsDemoMode(true);
      
      // Load fallback mock data
      const localTenants = getLocalData<Tenant[]>('cc_tenants', [
        { id: '1', name: 'AETHER Café & Roastery', subdomain: 'demo', plan: 'pro', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: '2', name: 'Bandra Brews', subdomain: 'bandra', plan: 'growth', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: '3', name: 'Downtown Roasters', subdomain: 'downtown', plan: 'free', status: 'SUSPENDED', createdAt: new Date().toISOString() }
      ]);
      const localBranches = getLocalData<Branch[]>('cc_branches', [
        { id: 'b1', tenantId: '1', name: 'Main Bandra Roastery', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'b2', tenantId: '2', name: 'Bandra West Outlet', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'b3', tenantId: '3', name: 'Downtown Corner', status: 'ACTIVE', createdAt: new Date().toISOString() }
      ]);
      const localStaff = getLocalData<Staff[]>('cc_staff', [
        { id: 's1', tenantId: '1', branchId: 'b1', fullName: 'Yash Zagde', email: 'yash@cafecanvas.bar', role: 'owner', status: 'ACTIVE' },
        { id: 's2', tenantId: '1', branchId: 'b1', fullName: 'Amit Patel', email: 'amit@cafecanvas.bar', role: 'staff', status: 'ACTIVE' }
      ]);

      setTenantsList(localTenants);
      setStats({
        totalTenants: localTenants.length,
        totalBranches: localBranches.length,
        totalUsers: localStaff.length,
        systemHealth: '100.00% (Local Demo)'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenant details (branches + staff)
  const loadTenantDetails = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setLoading(true);
    if (isDemoMode) {
      const localBranches = getLocalData<Branch[]>('cc_branches', []);
      const localStaff = getLocalData<Staff[]>('cc_staff', []);
      
      const filteredBranches = localBranches.filter(b => b.tenantId === tenant.id);
      const filteredStaff = localStaff.filter(s => s.tenantId === tenant.id);
      
      setTenantDetails({
        branches: filteredBranches.length > 0 ? filteredBranches : [{ id: `b_${tenant.id}`, tenantId: tenant.id, name: `${tenant.name} Main Branch`, status: 'ACTIVE', createdAt: new Date().toISOString() }],
        staff: filteredStaff
      });
      setLoading(false);
    } else {
      try {
        const res = await fetch(`${BACKEND_URL}/tenants/${tenant.id}/details`);
        const data = await res.json();
        if (data.success) {
          setTenantDetails({
            branches: data.branches,
            staff: data.staff
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle tenant active/suspended status
  const handleToggleTenantStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    if (isDemoMode) {
      const updated = tenantsList.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t);
      setTenantsList(updated);
      setLocalData('cc_tenants', updated);
      if (selectedTenant?.id === tenant.id) {
        setSelectedTenant({ ...selectedTenant, status: newStatus });
      }
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
        if (selectedTenant?.id === tenant.id) {
          setSelectedTenant({ ...selectedTenant, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create new tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const generatedUrl = `${tenantForm.subdomain}.cafecanvas.bar`;

    if (isDemoMode) {
      const mockId = Math.random().toString(36).substring(2, 9);
      const newTenant: Tenant = {
        id: mockId,
        name: tenantForm.tenantName,
        subdomain: tenantForm.subdomain,
        plan: tenantForm.plan,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      const updatedTenants = [...tenantsList, newTenant];
      setTenantsList(updatedTenants);
      setLocalData('cc_tenants', updatedTenants);

      // Create branch
      const mockBranchId = 'b_' + mockId;
      const newBranch: Branch = {
        id: mockBranchId,
        tenantId: mockId,
        name: `${tenantForm.tenantName} Main Branch`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      const updatedBranches = [...getLocalData<Branch[]>('cc_branches', []), newBranch];
      setLocalData('cc_branches', updatedBranches);

      // Create owner user
      const mockOwner: Staff = {
        id: 's_' + mockId,
        tenantId: mockId,
        branchId: mockBranchId,
        fullName: tenantForm.ownerName,
        email: tenantForm.ownerEmail,
        role: 'owner',
        status: 'ACTIVE'
      };
      const updatedStaff = [...getLocalData<Staff[]>('cc_staff', []), mockOwner];
      setLocalData('cc_staff', updatedStaff);

      setStats({
        totalTenants: updatedTenants.length,
        totalBranches: updatedBranches.length,
        totalUsers: updatedStaff.length,
        systemHealth: '100.00% (Local Demo)'
      });

      setGeneratedTenantUrl(generatedUrl);
      setShowAddTenant(false);
      setShowSuccessModal(true);
      setLoading(false);
      
      // Reset form
      setTenantForm({
        tenantName: '',
        subdomain: '',
        plan: 'free',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: ''
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
        setGeneratedTenantUrl(generatedUrl);
        setShowAddTenant(false);
        setShowSuccessModal(true);
        // Reset form
        setTenantForm({
          tenantName: '',
          subdomain: '',
          plan: 'free',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: ''
        });
      } else {
        setErrorMsg(data.error || 'Failed to create tenant');
      }
    } catch (err) {
      setErrorMsg('Server offline or network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add staff user
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    // Check 50 staff limit
    if (tenantDetails.staff.length >= 50) {
      alert('Staff limit reached. A maximum of 50 staff IDs are allowed per tenant.');
      return;
    }

    setSubmittingStaff(true);
    const branchIdToUse = staffForm.branchId || tenantDetails.branches[0]?.id;

    if (isDemoMode) {
      const newStaff: Staff = {
        id: Math.random().toString(36).substring(2, 9),
        tenantId: selectedTenant.id,
        branchId: branchIdToUse,
        fullName: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
        status: 'ACTIVE'
      };

      const allStaff = [...getLocalData<Staff[]>('cc_staff', []), newStaff];
      setLocalData('cc_staff', allStaff);
      
      setTenantDetails({
        ...tenantDetails,
        staff: [...tenantDetails.staff, newStaff]
      });
      setStats(prev => ({ ...prev, totalUsers: allStaff.length }));
      setSubmittingStaff(false);
      setStaffForm({ name: '', email: '', password: '', role: 'staff', branchId: '' });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/tenants/${selectedTenant.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffForm,
          branchId: branchIdToUse
        })
      });
      const data = await res.json();
      if (data.success) {
        loadTenantDetails(selectedTenant);
        setStaffForm({ name: '', email: '', password: '', role: 'staff', branchId: '' });
      } else {
        alert(data.error || 'Failed to create staff');
      }
    } catch (err) {
      alert('Error creating staff account.');
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Delete staff user
  const handleDeleteStaff = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this staff user account?')) return;

    if (isDemoMode) {
      const allStaff = getLocalData<Staff[]>('cc_staff', []);
      const updated = allStaff.filter(s => s.id !== userId);
      setLocalData('cc_staff', updated);
      setTenantDetails({
        ...tenantDetails,
        staff: tenantDetails.staff.filter(s => s.id !== userId)
      });
      setStats(prev => ({ ...prev, totalUsers: updated.length }));
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/staff/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && selectedTenant) {
        loadTenantDetails(selectedTenant);
      }
    } catch (err) {
      alert('Error deleting staff.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d0d10] text-[#f1f1f6] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-[#121217] border-r border-white/5 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2 font-bold text-xl text-white">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight leading-none text-base">CafeCanva</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Super-Admin</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link href="/superadmin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600/10 to-orange-500/0 text-[#ff7b39] font-semibold border-l-2 border-orange-500 transition-all">
              <Activity size={18} /> Platform Health
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left">
              <Building2 size={18} /> All Stores
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left">
              <Users size={18} /> Global Directory
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left">
              <BarChart3 size={18} /> Global Billing
            </button>
          </nav>
        </div>
        
        <div className="space-y-4">
          {isDemoMode && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                <AlertTriangle size={14} /> Local Simulation
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Backend offline. Data saved in browser session storage.
              </p>
            </div>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left">
            <Settings size={18} /> System Settings
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Super-Admin Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5">CafeCanva Cloud Management Portal</p>
          </div>
          <button 
            onClick={() => setShowAddTenant(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Create Tenant Account
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-10 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Tenants', value: stats.totalTenants, border: 'border-t-orange-500', desc: 'Active cafe operations' },
              { label: 'Total Branches', value: stats.totalBranches, border: 'border-t-amber-500', desc: 'Physical outlets online' },
              { label: 'Global Users', value: stats.totalUsers, border: 'border-t-emerald-500', desc: 'Registered staff & owners' },
              { label: 'System Health', value: stats.systemHealth, border: 'border-t-blue-500', desc: 'Operational status', isHealth: true },
            ].map((stat, i) => (
              <div key={i} className={`bg-[#121217] p-6 rounded-2xl border border-white/5 border-t-2 ${stat.border} shadow-lg shadow-black/10 flex flex-col justify-between h-32`}>
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">{stat.label}</div>
                <div className={`text-3xl font-black ${stat.isHealth ? 'text-emerald-400' : 'text-white'}`}>{stat.value}</div>
                <div className="text-[10px] text-zinc-400">{stat.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Tenants List Table */}
            <div className="lg:col-span-2 bg-[#121217] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight">Active Tenant Accounts</h2>
                <span className="text-[10px] px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md uppercase font-semibold tracking-wider">
                  {tenantsList.length} Accounts
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5 text-zinc-400 uppercase font-semibold text-[10px]">
                      <th className="p-4">Store Name</th>
                      <th className="p-4">Subdomain</th>
                      <th className="p-4">Service Plan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tenantsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-zinc-500 font-medium">
                          No tenant accounts found. Click 'Create Tenant' to register one.
                        </td>
                      </tr>
                    ) : (
                      tenantsList.map((tenant) => (
                        <tr 
                          key={tenant.id} 
                          onClick={() => loadTenantDetails(tenant)}
                          className={`hover:bg-white/2 cursor-pointer transition-colors ${selectedTenant?.id === tenant.id ? 'bg-[#ff7b39]/5' : ''}`}
                        >
                          <td className="p-4 font-bold text-white text-[13px]">{tenant.name}</td>
                          <td className="p-4 font-mono text-zinc-400">{tenant.subdomain}.cafecanvas.bar</td>
                          <td className="p-4">
                            <span className="capitalize text-zinc-300 font-medium px-2 py-0.5 bg-white/5 border border-white/5 rounded-md">
                              {tenant.plan}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tenant.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {tenant.status}
                            </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleToggleTenantStatus(tenant)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                tenant.status === 'ACTIVE' 
                                  ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                                  : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={tenant.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                            >
                              {tenant.status === 'ACTIVE' ? <X size={14} /> : <Check size={14} />}
                            </button>
                            <button 
                              onClick={() => loadTenantDetails(tenant)}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 text-[11px] font-bold"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Selected Tenant Details Drawer */}
            <div className="bg-[#121217] rounded-2xl border border-white/5 shadow-lg p-6 space-y-6">
              {selectedTenant ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{selectedTenant.name}</h3>
                      <Link 
                        href={`http://${selectedTenant.subdomain}.cafecanvas.bar`}
                        target="_blank"
                        className="text-[11px] font-mono text-[#ff7b39] hover:underline flex items-center gap-1 mt-1.5"
                      >
                        <Globe size={12} /> {selectedTenant.subdomain}.cafecanvas.bar
                      </Link>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      selectedTenant.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {selectedTenant.status}
                    </span>
                  </div>

                  <hr className="border-white/5" />

                  {/* Branches Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Branches / Locations</h4>
                    <div className="space-y-2">
                      {tenantDetails.branches.map(b => (
                        <div key={b.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{b.name}</span>
                          <span className="text-[10px] text-zinc-500">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staff List & Creation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Staff Members
                      </h4>
                      <span className={`text-[10px] font-bold ${tenantDetails.staff.length >= 50 ? 'text-red-400' : 'text-zinc-500'}`}>
                        {tenantDetails.staff.length} / 50 Staff IDs
                      </span>
                    </div>

                    {/* Staff List Scroll Box */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {tenantDetails.staff.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-4">No staff members created yet.</p>
                      ) : (
                        tenantDetails.staff.map(s => (
                          <div key={s.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {s.fullName} 
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  s.role === 'owner' ? 'bg-orange-500/10 text-orange-500' : 'bg-white/5 text-zinc-400'
                                }`}>
                                  {s.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{s.email}</div>
                            </div>
                            {s.role !== 'owner' && (
                              <button 
                                onClick={() => handleDeleteStaff(s.id)}
                                className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Staff Form */}
                    {tenantDetails.staff.length < 50 ? (
                      <form onSubmit={handleAddStaff} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                        <div className="text-xs font-bold text-white">Create Staff ID</div>
                        
                        <div className="space-y-2.5">
                          <input 
                            type="text" 
                            required
                            placeholder="Staff Full Name"
                            value={staffForm.name}
                            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                            className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50"
                          />
                          <input 
                            type="email" 
                            required
                            placeholder="Staff Email"
                            value={staffForm.email}
                            onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                            className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50"
                          />
                          <input 
                            type="password" 
                            required
                            placeholder="Password"
                            value={staffForm.password}
                            onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                            className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={staffForm.role}
                              onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                              className="bg-[#0d0d10] border border-white/5 rounded-xl px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500/50"
                            >
                              <option value="staff">Staff / Waiter</option>
                              <option value="cashier">Cashier</option>
                              <option value="manager">Manager</option>
                              <option value="kitchen">Kitchen Staff</option>
                            </select>
                            <select
                              value={staffForm.branchId}
                              onChange={e => setStaffForm({ ...staffForm, branchId: e.target.value })}
                              className="bg-[#0d0d10] border border-white/5 rounded-xl px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500/50"
                            >
                              <option value="">Select Branch</option>
                              {tenantDetails.branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={submittingStaff}
                          className="w-full py-2 bg-[#ff7b39] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
                        >
                          {submittingStaff ? 'Creating...' : 'Register Staff Account'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 space-y-1">
                        <div className="font-bold">Staff Limit Reached</div>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          This tenant has reached the maximum allowed limit of 50 staff ID accounts.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-zinc-500 text-xs">
                  <ShieldAlert size={32} className="mx-auto text-zinc-600 mb-3" />
                  Select a tenant from the list to manage branches and staff IDs.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: CREATE TENANT ACCOUNT */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121217] w-full max-w-xl rounded-3xl border border-white/5 p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowAddTenant(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create Tenant Account</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Register a new cafe brand and set up owner credentials</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Cafe Brand Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Bandra Brews"
                    value={tenantForm.tenantName}
                    onChange={e => setTenantForm({ ...tenantForm, tenantName: e.target.value })}
                    className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Dedicated Subdomain</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. bandrabrews"
                      value={tenantForm.subdomain}
                      onChange={e => setTenantForm({ ...tenantForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50 text-right"
                    />
                    <span className="bg-[#181822] border-y border-r border-white/5 rounded-r-xl px-3 py-3 text-xs text-zinc-500 font-mono">
                      .cafecanvas.bar
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Service Plan</label>
                  <select 
                    value={tenantForm.plan}
                    onChange={e => setTenantForm({ ...tenantForm, plan: e.target.value })}
                    className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="free">Free Tier</option>
                    <option value="pro">Pro Retailer</option>
                    <option value="growth">Growth Platform</option>
                    <option value="enterprise">Enterprise VIP</option>
                  </select>
                </div>
                <div className="p-3 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Staff Account Limit</span>
                  <span className="text-xs font-bold text-white">50 Staff IDs</span>
                </div>
              </div>

              <hr className="border-white/5" />

              <div className="space-y-4">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key size={14} className="text-orange-500" /> Owner Account Credentials
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Owner Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Owner Full Name"
                    value={tenantForm.ownerName}
                    onChange={e => setTenantForm({ ...tenantForm, ownerName: e.target.value })}
                    className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Owner Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="email@cafebrand.com"
                      value={tenantForm.ownerEmail}
                      onChange={e => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                      className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Temporary Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Minimum 6 characters"
                      value={tenantForm.ownerPassword}
                      onChange={e => setTenantForm({ ...tenantForm, ownerPassword: e.target.value })}
                      className="w-full bg-[#0d0d10] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/15 hover:opacity-95 transition-opacity disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating Tenant System...' : 'Initialize Tenant & Owner Accounts'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUCCESS CONFIRMATION */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121217] w-full max-w-md rounded-3xl border border-white/5 p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 border border-emerald-500/25">
              <Check size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Tenant Online!</h3>
              <p className="text-xs text-zinc-500 leading-relaxed px-4">
                The multi-tenant database sandbox and admin owner credentials have been successfully initialized.
              </p>
            </div>

            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-left space-y-3">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Live Customer Storefront URL</div>
              <Link 
                href={`http://${generatedTenantUrl}`}
                target="_blank"
                className="text-xs font-mono text-[#ff7b39] hover:underline flex items-center justify-between font-bold"
              >
                <span>{generatedTenantUrl}/</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/10"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
