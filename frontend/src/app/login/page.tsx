'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, LayoutDashboard, ClipboardList, Utensils, QrCode, LogOut, ArrowLeft, RefreshCw, User, Store } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getStaffByStoreSlug } from './actions';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<'standard' | 'alternate'>('standard');
  
  // Standard Login fields
  const [email, setEmail] = useState('');
  
  // Alternate Login fields
  const [storeSlug, setStoreSlug] = useState('');
  const [fetchingStaff, setFetchingStaff] = useState(false);
  const [staffList, setStaffList] = useState<Array<{ id: string, name: string, email: string, role: string }>>([]);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  
  // Shared fields
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Logged-in State for Portal Selector
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    tenantSlug?: string;
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLoadStaff = async () => {
    if (!storeSlug.trim()) {
      setError('Please enter a store code.');
      return;
    }
    setFetchingStaff(true);
    setError(null);
    try {
      const res = await getStaffByStoreSlug(storeSlug);
      setStaffList(res.staffList);
      setStoreName(res.tenantName);
      if (res.staffList.length > 0) {
        setSelectedStaffEmail(res.staffList[0].email);
      } else {
        setError('No staff accounts found for this store.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staff list.');
      setStaffList([]);
    } finally {
      setFetchingStaff(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const loginEmail = loginMode === 'standard' ? email : selectedStaffEmail;

    if (!loginEmail) {
      setError('Please select a staff member or enter an email.');
      setLoading(false);
      return;
    }

    try {
      // Sign In Flow
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (signInError) {
        // Humanize error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect password or PIN. Please verify and try again.');
        } else if (signInError.message.includes('Failed to fetch')) {
          setError('Database connection error. Please check your network connection.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch role from custom users table/view
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, role, tenant_id, branch_id, active')
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user role:', userError);
          setError('User profile not found. Please contact your system administrator.');
          setLoading(false);
          return;
        }

        if (!userData.active) {
          await supabase.auth.signOut();
          setError('Access Denied. Your account has been suspended or deactivated.');
          setLoading(false);
          return;
        }

        // Fetch tenant slug to build custom links
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('slug')
          .eq('id', userData.tenant_id)
          .single();

        setSuccess('Successfully authenticated!');

        const authUser = {
          id: userData.id,
          name: userData.name || 'Operator',
          email: loginEmail,
          role: userData.role,
          tenantSlug: tenantData?.slug || storeSlug || 'store',
        };

        // If superadmin, redirect directly. Otherwise, show portal selector!
        if (userData.role === 'superadmin') {
          setTimeout(() => {
            router.push('/superadmin');
          }, 1000);
        } else {
          setTimeout(() => {
            setSuccess(null);
            setAuthenticatedUser(authUser);
            setLoading(false);
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setAuthenticatedUser(null);
    setEmail('');
    setPassword('');
    setStaffList([]);
    setStoreSlug('');
    setStoreName('');
    setLoginMode('standard');
    setLoading(false);
  };

  const getAvailablePortals = (role: string, slug?: string) => {
    const list = [];
    const isOwnerOrManager = ['owner', 'manager', 'admin'].includes(role);
    
    // 1. Store Admin Dashboard
    if (isOwnerOrManager) {
      list.push({
        id: 'admin',
        title: 'Store Admin Dashboard',
        description: 'Manage menus, billing reports, staff accounts, and configurations.',
        icon: <LayoutDashboard className="w-8 h-8 text-[#d97706]" />,
        path: '/admin',
      });
    }



    // 4. Customer Storefront Menu
    if (slug) {
      list.push({
        id: 'storefront',
        title: 'Digital Menu Storefront',
        description: 'Customer digital menu view to test ordering and layouts.',
        icon: <QrCode className="w-8 h-8 text-rose-600" />,
        path: `/${slug}`,
      });
    }

    return list;
  };

  // Portal Selector UI Render
  if (authenticatedUser) {
    const portals = getAvailablePortals(authenticatedUser.role, authenticatedUser.tenantSlug);
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc] text-[#1e293b]">
        {/* Dynamic Animated Liquid Background Blobs */}
        <div className="liquid-blob-1 top-[5%] left-[5%]" />
        <div className="liquid-blob-2 bottom-[10%] right-[5%]" />
        <div className="liquid-blob-3 top-[40%] left-[30%]" />

        {/* Grid overlay mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.015)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none mask-radial" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/75 border border-[#eae5d8] rounded-3xl p-8 shadow-xl relative z-10 glass"
        >
          {/* Decorative canvas top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 brand-gradient rounded-full" />

          {/* User welcome header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#eae5d8]/50 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-[#d97706]">
                <User size={24} />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-black tracking-tight font-display">
                  Welcome, <span className="text-[#d97706]">{authenticatedUser.name}</span>
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">
                  Role: {authenticatedUser.role} • {storeName || authenticatedUser.tenantSlug}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          <p className="text-sm font-bold text-slate-600 mb-6 text-center md:text-left">
            Select a working portal to open:
          </p>

          {/* Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((portal) => (
              <motion.div
                key={portal.id}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => router.push(portal.path)}
                className="p-5 rounded-2xl bg-white border border-[#eae5d8] hover:border-amber-500/30 hover:shadow-md transition-all cursor-pointer flex gap-4 group"
              >
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-amber-500/5 border border-slate-100 group-hover:border-amber-500/10 flex items-center justify-center shrink-0 h-14 w-14">
                  {portal.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 group-hover:text-[#d97706] flex items-center gap-1.5 transition-colors">
                    {portal.title}
                    <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {portal.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#eae5d8]/50 text-center">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
              CafeCanvas Enterprise OS • Multi-Tenant Gateway
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc] text-[#1e293b]">
      {/* Dynamic Animated Liquid Background Blobs */}
      <div className="liquid-blob-1 top-[5%] left-[5%]" />
      <div className="liquid-blob-2 bottom-[10%] right-[5%]" />
      <div className="liquid-blob-3 top-[40%] left-[30%]" />

      {/* Grid overlay mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.015)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none mask-radial" />

      {/* Main Entrance Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md p-8 rounded-3xl z-10 relative border border-[#eae5d8] bg-white/70 shadow-xl"
      >
        {/* Decorative canvas top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 brand-gradient rounded-full" />

        {/* Branding Area */}
        <div className="flex flex-col items-center gap-3.5 mb-6">
          <div className="w-14 h-14 bg-[#fef3c7] border border-[#e2e8f0] rounded-2xl flex items-center justify-center shadow-md shadow-[#d97706]/10 overflow-hidden">
            <img src="/logo.png" alt="Cafe Canvas Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e293b] font-display">
              Cafe<span className="text-[#d97706]">Canvas</span> OS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-1">
              Multi-Tenant Gateway
            </p>
          </div>
        </div>

        {/* Login Mode Toggle Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setLoginMode('standard');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all ${
              loginMode === 'standard'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Standard Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('alternate');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all ${
              loginMode === 'alternate'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quick Staff Login
          </button>
        </div>

        {/* Notifications and Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alternate Login - Select Staff Flow */}
        {loginMode === 'alternate' && staffList.length === 0 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Enter Store Code / Slug
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  placeholder="e.g. chai-point"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400 font-mono"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleLoadStaff}
              disabled={fetchingStaff}
              className="w-full py-3.5 bg-[#1e293b] hover:bg-black text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {fetchingStaff ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Loading Staff List...</span>
                </>
              ) : (
                <>
                  <span>Load Staff Roster</span>
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <form onSubmit={handleAction} className="space-y-5">
            {loginMode === 'alternate' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-[#d97706] uppercase tracking-wider">
                    Store: {storeName || storeSlug}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffList([]);
                      setStoreSlug('');
                      setStoreName('');
                      setError(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={10} />
                    Change Store
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Select Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedStaffEmail}
                      onChange={(e) => setSelectedStaffEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-semibold focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all appearance-none cursor-pointer"
                    >
                      {staffList.map((staff) => (
                        <option key={staff.id} value={staff.email}>
                          {staff.name} ({staff.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Login - Email Input */}
            {loginMode === 'standard' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Operator Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@cafecanvas.bar"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Password Field (shared) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {loginMode === 'alternate' ? 'Enter Password / PIN' : 'Secure Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={loginMode === 'alternate' ? '••••' : '••••••••'}
                  className="w-full pl-11 pr-10 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Form Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#d97706]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-[#eae5d8]/50 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Authorized operations only. Session details, security tokens, and access logs are recorded for compliance audits.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
