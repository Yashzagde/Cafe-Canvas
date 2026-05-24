"use client";

import React from "react";

export default function AnimatedBokeh() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Orb 1: Green Accent */}
      <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-green-200/25 rounded-full filter blur-[100px] animate-drift-slow-1" />
      {/* Orb 2: Warm Orange */}
      <div className="absolute top-[25%] right-[-10%] w-[35vw] h-[35vw] bg-orange-200/20 rounded-full filter blur-[90px] animate-drift-slow-2" />
      {/* Orb 3: White Neutral */}
      <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] bg-white/40 rounded-full filter blur-[110px] animate-drift-slow-3" />
      {/* Orb 4: Emerald Glow */}
      <div className="absolute bottom-[5%] right-[5%] w-[38vw] h-[38vw] bg-emerald-250/20 rounded-full filter blur-[80px] animate-drift-slow-4" />
      {/* Orb 5: Amber Light */}
      <div className="absolute top-[50%] left-[40%] w-[25vw] h-[25vw] bg-amber-100/25 rounded-full filter blur-[100px] animate-drift-slow-5" />
    </div>
  );
}
