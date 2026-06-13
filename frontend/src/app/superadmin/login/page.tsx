'use client';

import React, { useState } from 'react';
import { Shield, Lock, RefreshCw, Key, ShieldAlert, ArrowRight } from 'lucide-react';
import { loginSuperAdmin } from '@/app/admin/actions/superadmin-auth.actions';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const result = await loginSuperAdmin({
        email,
        password,
        deviceFingerprint: typeof window !== 'undefined' ? navigator.userAgent : 'Server Runner',
      });

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Credential validation successful. Redirecting to platform control...',
        });
        setTimeout(() => {
          window.location.href = '/superadmin';
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Authentication failed.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.message || 'Connection timeout or internal server error.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-stone-850 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none mask-radial" />

      <div className="max-w-md w-full flex flex-col gap-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header Branding */}
        <header className="text-center flex flex-col items-center gap-2.5">
          <div className="logo flex items-center gap-2 font-bold text-2xl tracking-tighter text-stone-900">
            <div className="w-8 h-8 bg-gradient-to-r from-[#d97706] to-[#ca8a04] rounded-lg flex items-center justify-center text-white text-xs font-black">
              CC
            </div>
            <span>Cafe<span className="text-amber-600">Canva</span></span>
          </div>
          <div>
            <h1 className="text-lg font-black text-stone-900 leading-tight">Super-Admin Authorization</h1>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-black">Zero Trust Control Panel</p>
          </div>
        </header>

        {/* Auth Panel Box */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xl shadow-stone-250/10 space-y-6">
          
          {/* Status Message */}
          {status.type !== 'idle' && (
            <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
              status.type === 'success' 
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50/50 border-red-200 text-red-800'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Operator Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@cafecanvas.bar"
                className="w-full bg-[#f8fafc] border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-600/50 text-stone-900 placeholder-stone-400 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Operator Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-600/50 text-stone-900 placeholder-stone-400 font-medium"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-850 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Lock size={16} className="text-amber-500" />
              )}
              Log In as Administrator
            </button>
          </form>

          {/* Guidelines info */}
          <div className="border-t border-stone-150 pt-5 text-left space-y-3">
            <h4 className="font-bold text-[10px] text-stone-700 uppercase tracking-wide flex items-center gap-1">
              <Key size={12} className="text-amber-600" />
              Secure Protocol Authentication
            </h4>
            <p className="text-[9px] text-stone-500 leading-normal">
              CafeCanvas Platform Security standard strictly mandates authorized operators to log in. Security events and login attempts are logged, and device fingerprints are audited to block unauthorized credentials.
            </p>
          </div>
        </div>

        {/* Warning Indicator */}
        <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl flex gap-3 text-[10px] text-amber-800 font-semibold items-start leading-relaxed">
          <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <span>If you cannot authenticate or forgot your operator password, please contact the lead DevOps architect.</span>
        </div>
      </div>
    </main>
  );
}
