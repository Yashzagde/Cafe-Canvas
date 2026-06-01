import React from 'react'

export const metadata = {
  title: 'Cafe Canva — Interactive Sandbox Demo',
  description: 'Experience Cafe Canva multi-tenant SaaS features in a secure local mock sandbox.'
}

export default function DemoLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative Glowing Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f15_1px,transparent_1px),linear-gradient(to_bottom,#0f0f15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Premium Sandbox Top Banner */}
      <header className="relative z-10 w-full bg-neutral-900/60 backdrop-blur-md border-b border-indigo-500/20 px-4 py-2 text-center text-xs font-semibold tracking-wider text-indigo-300 uppercase flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        Interactive Demo Mode
        <span className="text-neutral-500 font-normal">|</span>
        <span className="text-neutral-400 font-medium normal-case">All transactions are local & simulated</span>
      </header>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
