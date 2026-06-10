import React from 'react';
import { 
  Bell, 
  Sparkles, 
  Coffee, 
  Heart, 
  Sun, 
  Umbrella, 
  Moon, 
  Star, 
  Flame, 
  Trophy, 
  HelpCircle,
  Clock,
  MapPin,
  Utensils,
  Smile,
  Compass,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface ThemeDesign {
  id: string;
  name: string;
  isDark: boolean;
  cardClass: string;
  buttonClass: string;
  renderBackground: () => React.JSX.Element | null;
  renderCallStaffButton: (props: {
    onClick: () => void;
    disabled: boolean;
    cooldown: number;
    isCalling: boolean;
  }) => React.JSX.Element;
}

// Map theme IDs to design definitions
export const getThemeDesign = (themeId: string): ThemeDesign => {
  const themeNumber = parseInt(themeId.replace('theme-', '')) || 2;
  const isDark = [1, 3, 5, 6, 21, 31, 44, 45].includes(themeNumber);

  // Common card classes based on theme category
  let cardClass = 'bg-card-bg border border-border-color shadow-warm rounded-3xl';
  if ([1, 44].includes(themeNumber)) {
    // Premium Glassmorphism
    cardClass = 'bg-white/10 backdrop-blur-xl border border-yellow-500/20 shadow-lg rounded-3xl';
  } else if ([2, 23, 35].includes(themeNumber)) {
    // Light Pastel/Glass
    cardClass = 'bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl';
  } else if ([3, 21, 31, 45].includes(themeNumber)) {
    // Dark Material
    cardClass = 'bg-stone-900 border border-stone-800 shadow-xl rounded-2xl';
  } else if (themeNumber === 4) {
    // Classic Cafe Brown
    cardClass = 'bg-[#F4EBE1] border-2 border-[#8B5E3C]/30 shadow-md rounded-2xl';
  } else if ([5, 34].includes(themeNumber)) {
    // Artisan / Industrial Concrete
    cardClass = 'bg-[#F2EAE1] border border-stone-300 shadow-sm rounded-none';
  } else if (themeNumber === 7) {
    // Matcha Zen
    cardClass = 'bg-[#FAF6F0] border-l-4 border-[#4A7C24] shadow-none rounded-none';
  } else if (themeNumber === 8) {
    // Rajasthani Royal
    cardClass = 'bg-[#FFFDF6] border-t-4 border-[#D4AF37] shadow-md rounded-b-3xl';
  } else if (themeNumber === 11) {
    // Punjabi Dhaba
    cardClass = 'bg-[#FFFEEB] border-2 border-dashed border-[#FF4500] shadow-sm rounded-xl';
  } else if (themeNumber === 46) {
    // High Contrast Accessibility
    cardClass = 'bg-white border-4 border-black text-black rounded-none shadow-none';
  }

  // Common button classes
  let buttonClass = 'bg-brand hover:opacity-90 text-white font-extrabold rounded-2xl';
  if ([1, 44].includes(themeNumber)) {
    buttonClass = 'bg-[#D4AF37] hover:bg-[#C5A02E] text-stone-950 font-display uppercase tracking-widest font-black rounded-full';
  } else if ([3, 30].includes(themeNumber)) {
    buttonClass = 'bg-[#C9A84C] hover:bg-[#B59640] text-stone-950 uppercase font-bold rounded-lg';
  } else if ([5, 34].includes(themeNumber)) {
    buttonClass = 'bg-stone-950 hover:bg-stone-800 text-[#F97316] font-mono uppercase tracking-wider rounded-none';
  } else if (themeNumber === 7) {
    buttonClass = 'bg-[#4A7C24] hover:bg-[#3E671E] text-white font-sans rounded-full';
  } else if (themeNumber === 11) {
    buttonClass = 'bg-[#FF4500] hover:bg-[#E03D00] text-white font-black rounded-lg scale-105 transition-transform';
  } else if (themeNumber === 46) {
    buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white font-black rounded-none border-2 border-black';
  }

  // 1. Dynamic Background Renderers for all categories
  const renderBackground = (): React.JSX.Element | null => {
    switch (themeNumber) {
      case 1: // Liquid Glass Premium
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute w-60 h-60 rounded-full bg-yellow-500/5 blur-3xl top-1/4 left-1/4 animate-pulse"></div>
            <div className="absolute w-80 h-80 rounded-full bg-[#FF6B35]/5 blur-3xl top-1/2 right-1/4 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute w-56 h-56 rounded-full bg-yellow-500/5 blur-3xl bottom-1/4 left-1/3 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
        );
      case 2: // Liquid Glass Basic
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
            <div className="absolute w-72 h-72 rounded-full bg-[#FF6B35]/5 blur-2xl top-10 right-10"></div>
          </div>
        );
      case 3: // Onyx Luxury Dark
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{
            backgroundImage: `radial-gradient(#C9A84C 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
        );
      case 4: // Classic Cafe Brown
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z' fill='%233D1C02' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 5: // Artisan Roastery
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
            backgroundImage: `linear-gradient(stone-300 1px, transparent 1px), linear-gradient(90deg, stone-300 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        );
      case 6: // Chocolate Indulgence
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0" style={{
            backgroundImage: `radial-gradient(#E91E8C 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px'
          }}></div>
        );
      case 7: // Matcha Zen
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='%234A7C24' fill-opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 8: // Rajasthani Royal
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='%23D4AF37' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 9: // Maharashtrian Heritage
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10l5 10h-10zm0 18l5-10h-10zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 14v10m-5-5h10' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 10: // Mughal Garden
        return (
          <div className="absolute inset-0 pointer-events-none opacity-4 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0l5 15h15l-12 9 4 15-12-9-12 9 4-15-12-9h15z' fill='%23D4AF37' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 11: // Punjabi Dhaba Bold
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='6' fill='%23FF4500'/%3E%3Ccircle cx='20' cy='20' r='12' fill='none' stroke='%23FFD700' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 12: // South Indian Temple
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%238B0000' stroke-width='1.5'/%3E%3Ccircle cx='20' cy='20' r='8' fill='none' stroke='%23B8860B' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 13: // Gujarat Mithai Gold
        return (
          <div className="absolute inset-0 pointer-events-none opacity-4 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='10' fill='none' stroke='%23FF8C00' stroke-width='1'/%3E%3Cpath d='M25 5v40M5 25h40' stroke='%23FFD700' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 17: // Japanese Sakura (Cherry blossom)
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute w-2 h-2 rounded-full bg-pink-300/30 top-1/4 left-1/3 animate-bounce"></div>
            <div className="absolute w-3.5 h-2 rounded-full bg-pink-200/40 top-1/2 right-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute w-1.5 h-1.5 rounded-full bg-pink-300/20 bottom-1/3 left-1/2 animate-bounce" style={{ animationDelay: '3s' }}></div>
          </div>
        );
      case 18: // Mediterranean Blue
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 0, 20 10 T40 10' fill='none' stroke='%231E90FF' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 21: // American Diner Chrome
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
            backgroundSize: '40px 40px',
            backgroundColor: '#fff'
          }}></div>
        );
      case 31: // Neon Street Food
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
        );
      case 32: // Y2K Retro Pop
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
            <div className="absolute w-20 h-20 rounded-full bg-cyan-300 blur-xl top-10 left-10"></div>
            <div className="absolute w-24 h-24 rounded-full bg-pink-300 blur-xl bottom-10 right-10"></div>
          </div>
        );
      case 33: // Botanical Garden
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 C45 15, 45 45, 30 60 C15 45, 15 15, 30 0' fill='%23166534'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      case 38: // Holi Splash
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
            <div className="absolute w-40 h-40 rounded-full bg-fuchsia-400 blur-3xl -top-10 -left-10"></div>
            <div className="absolute w-48 h-48 rounded-full bg-amber-400 blur-3xl -bottom-10 -right-10"></div>
          </div>
        );
      case 41: // Monsoon Cafe
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(170deg, rgba(37, 99, 235, 0.1) 10%, transparent 10%)`,
              backgroundSize: '10px 100px'
            }}></div>
          </div>
        );
      case 44: // New Year Noir
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute w-1 h-1 rounded-full bg-yellow-400/30 top-1/4 left-1/3 animate-ping"></div>
            <div className="absolute w-1 h-1 rounded-full bg-yellow-400/40 top-1/2 right-1/4 animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/20 bottom-1/3 left-1/2 animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>
        );
      case 52: // Kids & Family
        return (
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='5' fill='%23EC4899'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        );
      default:
        // Basic theme light/dark pattern
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{
            backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        );
    }
  };

  // 2. Custom Call Staff Buttons for ALL 52 themes
  const renderCallStaffButton = (props: {
    onClick: () => void;
    disabled: boolean;
    cooldown: number;
    isCalling: boolean;
  }): React.JSX.Element => {
    const { onClick, disabled, cooldown, isCalling } = props;

    // Build theme-specific icons & class names dynamically based on the category
    let btnContent: React.ReactNode = <Bell size={18} />;
    let btnStyle = 'w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg';

    if (cooldown > 0) {
      return (
        <button
          onClick={onClick}
          disabled={true}
          className="px-4 py-3 rounded-full bg-stone-500/20 text-stone-500 font-bold text-xs tracking-wider border border-stone-500/30 cursor-not-allowed flex items-center gap-1.5"
        >
          <Clock size={12} className="animate-spin" />
          <span>Wait {cooldown}s</span>
        </button>
      );
    }

    switch (themeNumber) {
      case 1: // Liquid Glass Premium
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-yellow-500/30 shadow-2xl relative group transform active:scale-95 transition-all hover:border-yellow-500/60"
          >
            <span className="absolute inset-0 rounded-full border border-yellow-500/30 animate-ping opacity-75"></span>
            <Bell size={18} className="text-[#D4AF37]" />
            <span className="text-[7px] font-extrabold uppercase tracking-widest text-[#D4AF37] mt-0.5">Call</span>
          </button>
        );

      case 2: // Liquid Glass Basic
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-3 rounded-full flex items-center gap-2 bg-[#FF6B35] text-white font-bold text-xs tracking-wider shadow-md transform active:scale-95 transition-all hover:bg-[#E05B26]"
          >
            <Bell size={14} />
            <span>Call Staff</span>
          </button>
        );

      case 3: // Onyx Luxury Dark
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-stone-900 border-2 border-[#C9A84C] text-[#C9A84C] shadow-lg transform active:scale-95 transition-all hover:bg-stone-850"
          >
            <Bell size={20} />
          </button>
        );

      case 4: // Classic Cafe Brown
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center bg-[#D2691E] border-2 border-[#3D1C02] text-[#FFF3E0] shadow-md transform active:scale-95 transition-all hover:scale-105"
          >
            <span className="text-base">🛎️</span>
            <span className="text-[8px] font-black tracking-widest uppercase text-[#FFF3E0]">Ting</span>
          </button>
        );

      case 5: // Artisan Roastery
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-3 bg-stone-950 border border-stone-800 text-[#E8DCC8] font-mono text-xs uppercase tracking-widest shadow-sm transform active:scale-95 transition-all hover:bg-stone-900"
          >
            [ CALL STAFF ]
          </button>
        );

      case 6: // Chocolate Indulgence
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#3B1D0E] text-[#E91E8C] border border-[#E91E8C]/30 shadow-lg relative transform active:scale-95 transition-all hover:scale-105"
          >
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E91E8C] border border-[#3B1D0E]"></span>
            <Bell size={18} />
          </button>
        );

      case 7: // Matcha Zen
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4A7C24] text-white shadow-sm transform active:scale-95 transition-all hover:bg-[#3E671E]"
          >
            <Bell size={16} />
          </button>
        );

      case 8: // Rajasthani Royal
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#D4AF37] border-4 border-[#8B0000] text-[#8B0000] shadow-md transform active:scale-95 transition-all hover:scale-105"
          >
            <Bell size={18} strokeWidth={2.5} />
          </button>
        );

      case 9: // Maharashtrian Heritage
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF8C00] border-2 border-[#006400] text-[#006400] shadow-md transform active:scale-95 transition-all hover:scale-105"
          >
            <Bell size={18} strokeWidth={2.5} />
          </button>
        );

      case 10: // Mughal Garden
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#F5F0E0] border-4 border-[#1B4332] text-[#1B4332] shadow-md transform active:scale-95 transition-all hover:scale-105"
          >
            <Bell size={18} />
          </button>
        );

      case 11: // Punjabi Dhaba Bold
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF4500] border-4 border-[#FFD700] text-[#FFD700] shadow-lg transform active:scale-95 transition-all animate-bounce"
          >
            <span className="text-xs font-black uppercase">CALL</span>
          </button>
        );

      case 12: // South Indian Temple
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center bg-[#FFFDD0] border-2 border-[#8B0000] text-[#8B0000] shadow-md transform active:scale-95 transition-all hover:scale-105"
          >
            <Bell size={16} />
            <span className="text-[8px] font-bold">Assist</span>
          </button>
        );

      case 13: // Gujarat Mithai Gold
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FFFAF0] border-2 border-[#FF8C00] text-[#FF8C00] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Flame size={18} className="animate-pulse" />
          </button>
        );

      case 14: // Kashmiri Winter
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1E3A5F] text-[#F5F5F5] border border-cyan-200 shadow-md hover:bg-[#152c49] transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 15: // Italian Trattoria
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2.5 rounded-none border-2 border-[#CE2B37] bg-[#F5F0DC] text-[#CE2B37] font-bold text-xs uppercase hover:bg-white transform active:scale-95 transition-all"
          >
            Call Waiter
          </button>
        );

      case 16: // Chinese Dynasty Red
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#DC143C] text-[#FFD700] border-2 border-[#FFD700] shadow-lg hover:brightness-110 transform active:scale-95 transition-all"
          >
            <span className="text-xl">🏮</span>
          </button>
        );

      case 17: // Japanese Sakura
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FFB7C5] text-[#1C1C1C] border border-[#FFB7C5] shadow-sm hover:opacity-95 transform active:scale-95 transition-all"
          >
            <Sparkles size={18} />
          </button>
        );

      case 18: // Mediterranean Blue
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1E90FF] text-white border-2 border-white shadow-lg hover:bg-[#007FFF] transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 19: // Mexican Fiesta
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF0000] text-[#FFD700] border-2 border-[#FFD700] shadow-md hover:rotate-12 transform active:scale-95 transition-all"
          >
            <span className="text-xl">🪇</span>
          </button>
        );

      case 20: // Thai Tropical
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#006400] text-[#FFD700] border border-[#FFD700] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 21: // American Diner Chrome
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-5 py-2.5 rounded-full bg-stone-900 border-2 border-[#C0C0C0] text-[#FF0000] font-black uppercase text-xs tracking-wider shadow-[0_0_10px_rgba(255,0,0,0.5)] hover:bg-stone-850 transform active:scale-95 transition-all"
          >
            BELL
          </button>
        );

      case 22: // Korean Bento
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2.5 bg-[#003478] border border-[#E8002D] text-white text-xs font-bold uppercase rounded-lg hover:bg-opacity-90 transform active:scale-95 transition-all"
          >
            Call POS
          </button>
        );

      case 23: // French Patisserie
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#8E3A7D] text-[#D4A873] border border-[#D4A873]/30 shadow-md hover:opacity-90 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 24: // Middle Eastern Souk
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1A3C34] text-[#B8860B] border border-[#B8860B] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <span className="text-xl">🕌</span>
          </button>
        );

      case 25: // Spanish Tapas
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#C0392B] text-[#F4A460] shadow-md hover:rotate-6 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 26: // Bengali Fish Curry
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#D4930A] text-white border-2 border-white shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 27: // Kerala Backwater
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#0D6B3A] text-white border-2 border-[#8B5E3C] shadow-sm hover:bg-[#0a562e] transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 28: // Goan Beach Shack
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#0E8A7D] text-[#E8A317] border-2 border-[#E8A317] shadow-lg hover:scale-105 transform active:scale-95 transition-all"
          >
            <span className="text-xl">🏖️</span>
          </button>
        );

      case 29: // Chettinad Spice
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#8B2500] text-[#FAF0E6] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 30: // Hyderabadi Nawabi
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#6B21A8] text-[#C9A84C] border border-[#C9A84C] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 31: // Neon Street Food
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-none flex items-center justify-center bg-[#EC4899] text-[#0A0A14] font-bold text-xs shadow-[0_0_15px_rgba(236,72,153,0.7)] hover:bg-[#db3b88] transform active:scale-95 transition-all"
          >
            CALL
          </button>
        );

      case 32: // Y2K Retro Pop
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#F43F5E] text-[#FFF0F5] border-4 border-cyan-300 shadow-md hover:scale-110 transform active:scale-95 transition-all"
          >
            <Heart size={18} fill="#FFF0F5" />
          </button>
        );

      case 33: // Botanical Garden
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#166534] text-white shadow-md hover:bg-[#0f4d26] transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 34: // Industrial Craft
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2.5 bg-stone-900 border border-stone-700 text-[#E85D04] font-mono text-xs uppercase tracking-widest shadow-md hover:bg-stone-800 transform active:scale-95 transition-all"
          >
            CALL-STAFF
          </button>
        );

      case 35: // Pastels Kawaii
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF6B9D] text-[#FFF5F7] shadow-md border-2 border-white hover:scale-105 transform active:scale-95 transition-all"
          >
            <Smile size={18} />
          </button>
        );

      case 36: // Bakehouse Warm
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#C4714A] text-[#FBF7F4] border border-[#A13670]/20 shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 37: // Diwali Glow
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#D4930A] text-[#8B2500] border-2 border-[#8B2500] shadow-lg hover:scale-105 transform active:scale-95 transition-all"
          >
            <Flame size={18} fill="#8B2500" />
          </button>
        );

      case 38: // Holi Splash
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#D946EF] text-white border-2 border-[#F59E0B] shadow-md hover:scale-110 transform active:scale-95 transition-all"
          >
            <Sparkles size={18} />
          </button>
        );

      case 39: // Christmas Cosy
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#B91C1C] text-white border-2 border-[#166534] shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Gift size={18} />
          </button>
        );

      case 40: // Eid Crescent
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#047857] text-[#C9A84C] border border-[#C9A84C]/50 shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Moon size={18} fill="#C9A84C" />
          </button>
        );

      case 41: // Monsoon Cafe
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#2563EB] text-white shadow-md hover:bg-[#1d4ed8] transform active:scale-95 transition-all"
          >
            <Umbrella size={18} />
          </button>
        );

      case 42: // Summer Burst
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#F59E0B] text-white border-2 border-[#EA580C] shadow-md hover:rotate-12 transform active:scale-95 transition-all"
          >
            <Sun size={18} className="animate-spin-slow" />
          </button>
        );

      case 43: // Valentine Blush
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#9F1239] text-[#FDA4AF] shadow-md border-2 border-[#FDA4AF] hover:scale-105 transform active:scale-95 transition-all"
          >
            <Heart size={18} fill="#9F1239" />
          </button>
        );

      case 44: // New Year Noir
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1C1C1C] text-[#D4AF37] border-2 border-[#D4AF37] shadow-lg hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} className="animate-bounce" />
          </button>
        );

      case 45: // Dark Mode Espresso
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#5C3310] text-[#EADCC8] border border-[#EADCC8]/20 shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Coffee size={18} />
          </button>
        );

      case 46: // High Contrast
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-3 bg-black text-yellow-400 border-4 border-yellow-400 font-extrabold text-sm uppercase hover:bg-stone-900 transform active:scale-95 transition-all"
          >
            CALL STAFF
          </button>
        );

      case 47: // Print-Ready Menu
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2 bg-white text-black border border-black font-semibold text-xs tracking-wider uppercase hover:bg-stone-50 transform active:scale-95 transition-all"
          >
            Call Waiter
          </button>
        );

      case 48: // Kiosk Display
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-[#2563EB] text-white border-4 border-white shadow-2xl hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={24} />
          </button>
        );

      case 49: // Delivery-First
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-3 bg-[#EA580C] text-white font-black text-xs uppercase rounded-xl shadow-md hover:bg-[#d94e01] transform active:scale-95 transition-all"
          >
            Call Agent
          </button>
        );

      case 50: // Catering Corporate
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2.5 bg-[#1E3A8A] text-white font-medium text-xs tracking-wider rounded-lg shadow-sm hover:bg-[#1e3070] transform active:scale-95 transition-all"
          >
            Call Coordinator
          </button>
        );

      case 51: // Wedding & Events
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#C29F6F] text-[#FFFBFA] border border-[#FFFBFA]/20 shadow-md hover:scale-105 transform active:scale-95 transition-all"
          >
            <Bell size={18} />
          </button>
        );

      case 52: // Kids & Family
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#EC4899] text-white border-2 border-dashed border-white shadow-md hover:scale-110 transform active:scale-95 transition-all"
          >
            <Smile size={18} />
          </button>
        );

      default: // Fallback for any invalid inputs
        return (
          <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-3 rounded-full flex items-center gap-2 bg-brand text-white font-extrabold text-xs tracking-wider shadow-md transform active:scale-95 transition-all hover:opacity-90"
          >
            <Bell size={14} />
            <span>Call Staff</span>
          </button>
        );
    }
  };

  return {
    id: themeId,
    name: `Theme ${themeNumber}`,
    isDark,
    cardClass,
    buttonClass,
    renderBackground,
    renderCallStaffButton
  };
};
