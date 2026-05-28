'use client';

import React, { useState } from 'react';

export default function TablesPage() {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [tables, setTables] = useState([
    { id: '1', name: 'Table 01', size: 2, x: 120, y: 80, section: 'indoor' },
    { id: '2', name: 'Table 02', size: 4, x: 260, y: 80, section: 'indoor' },
    { id: '3', name: 'Table 03', size: 4, x: 400, y: 80, section: 'indoor' },
    { id: '4', name: 'Table 04', size: 6, x: 120, y: 220, section: 'outdoor' },
    { id: '5', name: 'Table 05', size: 2, x: 260, y: 220, section: 'outdoor' },
    { id: '6', name: 'Table 06', size: 2, x: 400, y: 220, section: 'bar' },
  ]);

  const handleDrag = (id: string, dir: 'up' | 'down' | 'left' | 'right') => {
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          x: dir === 'left' ? Math.max(0, t.x - 20) : dir === 'right' ? t.x + 20 : t.x,
          y: dir === 'up' ? Math.max(0, t.y - 20) : dir === 'down' ? t.y + 20 : t.y,
        };
      }
      return t;
    }));
  };

  const filteredTables = selectedSection === 'all' 
    ? tables 
    : tables.filter(t => t.section === selectedSection);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Visual Floor Map</h2>
          <p className="text-sm text-neutral-400 mt-1">Arrange physical tables and coordinate active covers.</p>
        </div>
        <button className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition">
          + Add Physical Table
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings and Sections Sidebar */}
        <div className="glass-card p-6 h-fit space-y-6">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">Floor Sections</span>
            <div className="space-y-1">
              {['all', 'indoor', 'outdoor', 'bar'].map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${selectedSection === sec ? 'bg-accent-indigo text-white shadow' : 'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 text-xs text-neutral-400 leading-relaxed">
            <strong>Designer mode active.</strong> Use the action controls on any table card to reposition items on the storefront digital map grid.
          </div>
        </div>

        {/* Visual Map Grid Area */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 h-[500px] relative overflow-hidden bg-white/[0.01] border-dashed border-2 border-white/10 flex items-center justify-center">
            
            {/* Background Grid Mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Draggable Tables Mock Rendering */}
            {filteredTables.map(tbl => (
              <div 
                key={tbl.id}
                style={{ left: `${tbl.x}px`, top: `${tbl.y}px` }}
                className="absolute w-36 h-36 rounded-2xl glass-card border border-white/10 p-4 flex flex-col justify-between shadow-xl cursor-move transition-all duration-300 hover:border-accent-indigo/50 hover:bg-white/5 bg-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{tbl.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-accent-emerald bg-accent-emerald/10 px-1.5 py-0.5 rounded border border-accent-emerald/20">{tbl.section}</span>
                </div>
                
                <div className="flex justify-center my-2 text-neutral-500 font-display font-semibold text-xs">
                  {tbl.size} Seats
                </div>

                {/* Coordinate movement helper controls */}
                <div className="flex items-center justify-between gap-1 mt-1">
                  <button onClick={() => handleDrag(tbl.id, 'left')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">◀</button>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleDrag(tbl.id, 'up')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▲</button>
                    <button onClick={() => handleDrag(tbl.id, 'down')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▼</button>
                  </div>
                  <button onClick={() => handleDrag(tbl.id, 'right')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▶</button>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}
