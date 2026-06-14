'use client'

import { Coffee, ShoppingBag, BookOpen, Home, MessageSquare, Newspaper, HelpCircle } from 'lucide-react'

interface StorefrontNavProps {
  tenant: {
    name: string; logoUrl: string | null
  }
  tableNumber: string | null
  cartCount: number
  activeTab: string
  onTabChange: (tab: string) => void
  showBlog: boolean
  onTableClick: () => void
}

export function StorefrontNav({
  tenant, tableNumber, cartCount, activeTab, onTabChange, showBlog, onTableClick
}: StorefrontNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3.5">
        {tenant.logoUrl ? (
          <img src={tenant.logoUrl} alt={tenant.name} className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-150" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Coffee size={18} />
          </div>
        )}
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-sm text-gray-850 tracking-tight leading-tight">{tenant.name}</span>
          {tableNumber ? (
            <button
              onClick={onTableClick}
              className="text-[9px] font-black tracking-widest text-[var(--primary)] uppercase bg-[var(--primary)]/10 px-2 py-0.5 rounded-full w-fit mt-0.5 hover:bg-[var(--primary)]/20 transition-colors"
            >
              Table: {tableNumber}
            </button>
          ) : (
            <button
              onClick={onTableClick}
              className="text-[9px] font-black tracking-widest text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-full w-fit mt-0.5 hover:bg-red-100 transition-colors"
            >
              No Table Set
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <nav className="hidden md:flex items-center gap-2">
        <button
          onClick={() => onTabChange('home')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'home' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home size={14} />
          <span>Home</span>
        </button>
        <button
          onClick={() => onTabChange('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'menu' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen size={14} />
          <span>Menu</span>
        </button>
        {showBlog && (
          <button
            onClick={() => onTabChange('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'blogs' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Newspaper size={14} />
            <span>Blog</span>
          </button>
        )}
        <button
          onClick={() => onTabChange('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'reviews' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare size={14} />
          <span>Reviews</span>
        </button>
      </nav>

      {/* Cart Button */}
      <div className="flex items-center gap-2">
        <button className="relative p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-850 transition-all flex items-center justify-center cursor-pointer">
          <ShoppingBag size={16} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--primary)] border-2 border-white text-white rounded-full text-[9px] font-black flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Tab Bar (sticky bottom of screen fallback or just layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-150 px-6 py-3.5 flex justify-around shadow-lg">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-[var(--primary)] scale-105 font-bold' : 'text-gray-400'
          }`}
        >
          <Home size={18} />
          <span className="text-[10px]">Home</span>
        </button>
        <button
          onClick={() => onTabChange('menu')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'menu' ? 'text-[var(--primary)] scale-105 font-bold' : 'text-gray-400'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-[10px]">Menu</span>
        </button>
        {showBlog && (
          <button
            onClick={() => onTabChange('blogs')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'blogs' ? 'text-[var(--primary)] scale-105 font-bold' : 'text-gray-400'
            }`}
          >
            <Newspaper size={18} />
            <span className="text-[10px]">Blog</span>
          </button>
        )}
        <button
          onClick={() => onTabChange('reviews')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'reviews' ? 'text-[var(--primary)] scale-105 font-bold' : 'text-gray-400'
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-[10px]">Reviews</span>
        </button>
      </div>
    </header>
  )
}
