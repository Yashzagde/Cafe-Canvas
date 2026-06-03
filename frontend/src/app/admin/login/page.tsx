'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if login is successful
      if (data?.user) {
        // Redirect to admin dashboard
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#fcfaf4] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Visual background watercolor blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e28743]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#21130d]/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#151820] border border-[#262b38] rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#e28743] to-[#f0a050] rounded-2xl flex items-center justify-center shadow-lg shadow-[#e28743]/20">
            <Coffee className="w-7 h-7 text-[#151820]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-[#fcfaf4] via-[#f5e6d3] to-[#e28743]">
            CafeCanvas OS
          </h1>
          <p className="text-xs text-[#fcfaf4]/50 uppercase tracking-widest font-semibold">
            Store Admin Gateway
          </p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#fcfaf4]/70 tracking-wider uppercase block">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#fcfaf4]/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                className="w-full pl-12 pr-4 py-3.5 bg-[#1e222d] border border-[#262b38] rounded-2xl text-sm focus:outline-none focus:border-[#e28743] transition-all text-[#fcfaf4] placeholder-[#fcfaf4]/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#fcfaf4]/70 tracking-wider uppercase block">
              Gateway Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#fcfaf4]/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-[#1e222d] border border-[#262b38] rounded-2xl text-sm focus:outline-none focus:border-[#e28743] transition-all text-[#fcfaf4] placeholder-[#fcfaf4]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#e28743] to-[#f0a050] hover:opacity-95 text-[#151820] font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-[#e28743]/15 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#151820] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262b38]/50 text-center">
          <p className="text-xs text-[#fcfaf4]/30">
            Secure, encrypted multi-tenant operations strictly logged to compliance databases.
          </p>
        </div>
      </div>
    </div>
  );
}
