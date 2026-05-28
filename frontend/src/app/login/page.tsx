'use client';

import { useState } from 'react';
import { Coffee, LogIn } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Fetch role from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, store_id')
        .eq('id', data.user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user role:', userError);
        // Fallback or error state
        setLoading(false);
        return;
      }

      // Route based on role
      const role = userData.role;
      if (role === 'superadmin') router.push('/superadmin');
      else if (role === 'admin') router.push('/admin');
      else if (role === 'staff') router.push('/staff');
      else if (role === 'kos') router.push('/kos');
      else router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#ff6b35]">
            <Coffee size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-zinc-400 text-center mb-8">Log in to manage your cafe</p>
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6b35]/50 transition-colors"
              placeholder="admin@cafe.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6b35]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full brand-gradient py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In <LogIn size={18} />
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-zinc-500 mt-8">
          For demo purposes, a Supabase user must be created first.
        </p>
      </div>
    </div>
  );
}
