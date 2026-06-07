'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Fetch role from backward compatibility users view to enforce admin/owner restrictions
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          await supabase.auth.signOut();
          setErrorMsg('Access denied: User profile not found.');
          setLoading(false);
          return;
        }

        const allowedRoles = ['owner', 'manager', 'admin'];
        if (!allowedRoles.includes(userData.role)) {
          await supabase.auth.signOut();
          setErrorMsg('Access denied: Only owners, managers, and administrators can access the Store Admin dashboard.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Authentication successful. Loading workspace...');

        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('Incorrect email or password. Please verify and try again.');
      } else if (err.message?.includes('Failed to fetch')) {
        setErrorMsg('Database connection error. Please check your network connection.');
      } else {
        setErrorMsg(err.message || 'Invalid credentials or login failed.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-[#1e293b] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Animated Liquid Background Blobs */}
      <div className="liquid-blob-1 top-[-10%] left-[-10%]" />
      <div className="liquid-blob-2 bottom-[-10%] right-[-10%]" />

      {/* Grid overlay mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.015)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none mask-radial" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/70 border border-[#eae5d8] rounded-3xl p-8 shadow-xl relative z-10 glass"
      >
        {/* Decorative canvas top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 brand-gradient rounded-full" />

        {/* Branding header */}
        <div className="flex flex-col items-center gap-3.5 mb-8">
          <div className="w-14 h-14 bg-[#fef3c7] border border-[#e2e8f0] rounded-2xl flex items-center justify-center shadow-md shadow-[#d97706]/10 overflow-hidden">
            <img src="/logo.png" alt="Cafe Canvas Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e293b] font-display">
              Cafe<span className="text-[#d97706]">Canvas</span> OS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-1">
              Store Admin Gateway
            </p>
          </div>
        </div>

        {/* Notifications and Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form container */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Gateway Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

        <div className="mt-8 pt-6 border-t border-[#eae5d8]/50 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Secure, encrypted multi-tenant operations strictly logged to compliance databases.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
