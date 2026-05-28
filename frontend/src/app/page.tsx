import Link from 'next/link';
import { Coffee, ArrowRight, BarChart3, ChefHat, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Abstract blurred background shapes */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <Coffee className="text-[#ff6b35]" />
          <span>Cafe<span className="text-[#ff6b35]">Canva</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 rounded-full font-medium transition-colors hover:bg-white/5">
            Log In
          </Link>
          <Link href="/login" className="px-5 py-2 rounded-full font-medium brand-gradient text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl text-center mt-32 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/10 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Cafe Canva MVP is now live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
          Run your cafe with <br/>
          <span className="text-transparent bg-clip-text brand-gradient">beautiful ease.</span>
        </h1>
        
        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for modern cafes. Manage orders, beautiful digital menus, kitchen operations, and staff from one stunning dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold brand-gradient text-white text-lg shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform">
            Open your digital store <ArrowRight size={20} />
          </Link>
          <Link href="#features" className="flex items-center justify-center px-8 py-4 rounded-full font-semibold glass hover:bg-white/10 transition-colors text-lg">
            See how it works
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-6xl z-10">
        <FeatureCard 
          icon={<Smartphone />}
          title="Digital Storefront"
          description="A beautiful, interactive menu your customers can browse on their phones."
        />
        <FeatureCard 
          icon={<ChefHat />}
          title="Kitchen Order System"
          description="Real-time order tracking for your chefs. Never miss a ticket again."
        />
        <FeatureCard 
          icon={<BarChart3 />}
          title="Admin Dashboard"
          description="Track sales, manage staff, and update your menu in seconds."
        />
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-3xl hover:bg-white/5 transition-colors group cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-[#ff6b35] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}
