'use client';

import Link from 'next/link';
import { Coffee, ArrowLeft, Sparkles, Clock } from 'lucide-react';

export default function ComingSoon() {
  return (
    <main className="min-h-screen bg-[#fbfbf9] text-stone-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none mask-radial" />

      <div className="max-w-md w-full text-center z-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Animated Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-md shadow-amber-600/5 relative group">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Clock size={36} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-[10px] font-black uppercase tracking-wider text-amber-700">
            <Sparkles size={10} /> Under Construction
          </span>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">
            Feature Brewing...
          </h1>
          <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            We are crafting a beautiful, high-fidelity experience here. Cafe Canva developers are working to release this feature very soon.
          </p>
        </div>

        {/* Back Link Button */}
        <div className="pt-2 w-full">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-amber-600/20 active:scale-98 cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>

        {/* Brand signature */}
        <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1.5 mt-6">
          <img src="/logo.png" alt="" className="w-4 h-4 object-contain" />
          Cafe Canva Hospitality OS
        </div>
      </div>
    </main>
  );
}
