'use client';

import { useState } from 'react';
import { Coffee, LogIn, UserPlus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
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

    if (isSignUp) {
      // 1. Sign Up in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Insert User Profile matching auth user UUID
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            tenant_id: 'a0000000-0000-0000-0000-000000000001', // Mapped to seeded AETHER Cafe Tenant
            branch_id: 'ab000000-0000-0000-0000-000000000001', // Mapped to seeded Branch
            name: fullName || 'Test Store Owner',
            email: email,
            role: 'owner',
            active: true
          });

        if (insertError) {
          console.error('Error inserting user profile:', insertError);
          setError('Auth created, but profile insertion failed. Please ensure schema and migrations are pushed.');
          setLoading(false);
          return;
        }

        setSuccess('Temporary test account successfully registered! Logging you in...');
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      }
    } else {
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
        // Fetch role from custom users table (fixed legacy store_id schema column reference)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, tenant_id, branch_id')
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user role:', userError);
          // If profile doesn't exist, create one to prevent blockage during manual dev triggers
          const { error: profileFixError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              tenant_id: 'a0000000-0000-0000-0000-000000000001',
              branch_id: 'ab000000-0000-0000-0000-000000000001',
              name: 'Store Owner',
              email: email,
              role: 'owner',
              active: true
            });

          if (profileFixError) {
            setError('Auth succeeded, but profile sync failed. Please check RLS policies.');
            setLoading(false);
            return;
          }
          router.push('/admin');
          return;
        }

        // Route based on role
        const role = userData.role;
        if (role === 'superadmin') router.push('/superadmin');
        else if (role === 'admin' || role === 'owner' || role === 'manager') router.push('/admin');
        else if (role === 'staff') router.push('/staff');
        else if (role === 'kos') router.push('/kos');
        else router.push('/admin');
      }
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
          {isSignUp ? 'Create Test Account' : 'Welcome Back'}
        </h2>
        <p className="text-stone-500 text-xs text-center mb-6">
          {isSignUp ? 'Initialize a real PostgreSQL tenant context' : 'Log in to manage your real cafe operations'}
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
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-black text-stone-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#fcfaf4] border border-[#eae5d8] rounded-xl px-4 py-3 text-stone-800 text-xs focus:outline-none focus:border-[#e05e35] transition-colors"
                placeholder="e.g. Yash Zagde"
              />
            </div>
          )}
          
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
              isSignUp ? (
                <>
                  Register & Login <UserPlus size={16} />
                </>
              ) : (
                <>
                  Sign In <LogIn size={16} />
                </>
              )
            )}
          </button>
        </form>

        <div className="border-t border-[#eae5d8] mt-6 pt-5 text-center">
          <button 
            onClick={() => {
              setIsSignUp(s => !s);
              setError(null);
              setSuccess(null);
            }}
            className="text-xs font-bold text-[#e05e35] hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need a fresh test ID? Create Test Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
