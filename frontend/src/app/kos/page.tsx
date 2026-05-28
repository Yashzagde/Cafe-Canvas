import { Clock, CheckCircle2 } from 'lucide-react';

export default function KOSDashboard() {
  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col">
      {/* Header */}
      <header className="glass-dark border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Kitchen Screen</h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold animate-pulse border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            LIVE
          </div>
        </div>
        <div className="text-2xl font-bold text-zinc-400 font-mono">
          11:32 AM
        </div>
      </header>

      {/* Main Kanban Board */}
      <main className="flex-1 p-6 flex gap-6 overflow-x-auto">
        
        {/* Pending Column */}
        <div className="flex-1 min-w-[350px] flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              NEW TICKETS
            </h2>
            <span className="bg-white/10 text-white px-2 py-0.5 rounded text-sm font-bold">2</span>
          </div>
          
          {/* Ticket Card */}
          <div className="glass border-l-4 border-l-red-500 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-2xl font-black text-white">#095</div>
                <div className="text-zinc-400 text-sm font-medium">Table 4</div>
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                <Clock size={14} /> 2m ago
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex justify-between text-lg text-white font-medium border-b border-white/5 pb-2">
                <span>1x Avocado Toast</span>
              </li>
              <li className="flex justify-between text-lg text-white font-medium border-b border-white/5 pb-2">
                <span>2x Flat White</span>
                <span className="text-orange-400 text-sm self-center">Oat Milk</span>
              </li>
            </ul>
            
            <button className="w-full brand-gradient text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all text-lg">
              START PREPARING
            </button>
          </div>
        </div>

        {/* Preparing Column */}
        <div className="flex-1 min-w-[350px] flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
              PREPARING
            </h2>
            <span className="bg-white/10 text-white px-2 py-0.5 rounded text-sm font-bold">1</span>
          </div>
          
          <div className="glass border-l-4 border-l-orange-500 p-5 rounded-xl shadow-lg relative overflow-hidden bg-orange-500/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-2xl font-black text-white">#094</div>
                <div className="text-zinc-400 text-sm font-medium">Takeaway (John)</div>
              </div>
              <div className="flex items-center gap-1 text-orange-400 text-sm font-bold bg-orange-500/10 px-2 py-1 rounded">
                <Clock size={14} /> 5m ago
              </div>
            </div>
            
            <ul className="space-y-3 mb-6 opacity-80">
              <li className="flex justify-between text-lg text-white font-medium border-b border-white/5 pb-2">
                <span>1x Classic Cheeseburger</span>
                <span className="text-orange-400 text-sm self-center">No Pickles</span>
              </li>
              <li className="flex justify-between text-lg text-white font-medium border-b border-white/5 pb-2 line-through text-zinc-500">
                <span>1x Fries</span>
              </li>
            </ul>
            
            <button className="w-full bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
              <CheckCircle2 size={20} /> MARK READY
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
