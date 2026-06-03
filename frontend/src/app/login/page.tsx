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
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Sign In Flow
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Fetch role from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, tenant_id, branch_id')
        .eq('id', data.user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user role:', userError);
        setError('User profile not found. Please contact your system administrator.');
        setLoading(false);
        return;
      }

      setSuccess('Successfully authenticated! Redirecting to panel...');

      // Route based on role
      const role = userData.role;
      setTimeout(() => {
        if (role === 'superadmin') router.push('/superadmin');
        else if (role === 'admin' || role === 'owner' || role === 'manager') router.push('/admin');
        else if (role === 'staff') router.push('/staff');
        else if (role === 'kos') router.push('/kos');
        else router.push('/admin');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fcfaf4]">
      {/* Warm artist's canvas blur shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e05e35]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative border border-[#eae5d8] bg-white/90 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#fbeee7] flex items-center justify-center text-[#e05e35]">
            <Coffee size={28} />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-center mb-1 text-[#4a2d22]">
          Welcome Back
        </h2>
        <p className="text-stone-500 text-xs text-center mb-6">
          Log in to manage your cafe operations
        </p>
        
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 mb-5 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 mb-5 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-stone-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fcfaf4] border border-[#eae5d8] rounded-xl px-4 py-3 text-stone-800 text-xs focus:outline-none focus:border-[#e05e35] transition-colors"
              placeholder="admin@cafecanvas.bar"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-stone-500 mb-1.5 uppercase tracking-wider">Secure Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fcfaf4] border border-[#eae5d8] rounded-xl px-4 py-3 text-stone-800 text-xs focus:outline-none focus:border-[#e05e35] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full brand-gradient text-[#fcfaf4] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:opacity-95 transition-opacity disabled:opacity-50 text-xs uppercase tracking-wider shadow-md shadow-orange-500/10"
          >
            {loading ? 'Processing...' : (
              <>
                Sign In <LogIn size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

