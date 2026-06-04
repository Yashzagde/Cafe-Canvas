'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ArrowRight, BarChart3, ChefHat, Smartphone, X, Check, 
  Building2, ShieldCheck, Mail, Phone, MapPin, Award, Store,
  Layers, Users, TrendingUp, HelpCircle, FileText, Lock, Globe,
  MessageSquare, Calendar, Sparkles, ChevronDown, ChevronRight, Play,
  Zap, Heart, Eye, ArrowUpRight, DollarSign, Clock, ShieldAlert,
  Activity, Laptop, RefreshCw, CheckCircle2, AlertOctagon
} from 'lucide-react';

// Pricing Plans
const pricingPlans = [
  {
    key: 'starter',
    name: 'Starter Suite',
    price: '2,900',
    description: 'Perfect for boutique cafes, independent bakeries, and cloud kitchens.',
    features: [
      'Single Location Support',
      'Up to 5 Staff User Accounts',
      'Dynamic Web QR Menu',
      'Standard KDS Integration',
      'Paise-Precision Cashier POS',
      'Direct WhatsApp Bill Sharing',
      'Standard Daily CSV Reports'
    ]
  },
  {
    key: 'growth',
    name: 'Growth Suite',
    price: '8,900',
    description: 'The optimal choice for growing restaurants, busy bars, and lounges.',
    features: [
      'Up to 5 Branch Locations',
      'Up to 50 Staff User Accounts',
      'Custom Domain Mapping (SSL)',
      'Multi-Terminal Real-time POS',
      'Advanced KDS with Waiter App',
      'Razorpay Payment Gateway API',
      'Automated SMS & WhatsApp Alerts',
      'Dynamic Inventory tracking',
      'Monthly PDF Billing & Reports',
      'Priority 24/7 Slack Support'
    ],
    popular: true
  },
  {
    key: 'professional',
    name: 'Professional Hub',
    price: '19,900',
    description: 'Designed for high-volume multi-chain brands and elite hospitality groups.',
    features: [
      'Up to 15 Branch Locations',
      'Up to 200 Staff User Accounts',
      'Fully Branded Storefront Theme',
      'Dedicated Customer Accounts',
      'Advance CRM & Loyalty Rewards',
      'Staff Attendance with GPS Selfie',
      'Hourly Heatmaps & Revenue Charts',
      'Supplier Integration & PO Builder',
      'Dedicated Account Manager'
    ]
  },
  {
    key: 'enterprise',
    name: 'Enterprise Custom',
    price: 'Custom',
    description: 'Bespoke solutions for restaurant conglomerates and global franchises.',
    features: [
      'Unlimited Branch Locations',
      'Unlimited Staff Accounts',
      'Complete White-label App Build',
      'Custom API Webhook integrations',
      'Custom Database Replication',
      '99.99% SLA Performance Contract',
      'Dedicated DevOps Engineer Node'
    ]
  }
];

// Themes List
const luxuryThemes = [
  { id: 'liquid-glass', name: 'Liquid Glass', primary: '#FFFFFF', accent: '#E8A598', desc: 'Minimalist frosted overlays with soft rose glow.' },
  { id: 'luxury-gold', name: 'Luxury Gold', primary: '#D4854A', accent: '#C9A84C', desc: 'Warm amber tones and rich brushed gold accents.' },
  { id: 'matcha-zen', name: 'Matcha Zen', primary: '#86EFAC', accent: '#15803D', desc: 'Organic sage greens and tranquil bamboo textures.' },
  { id: 'rajasthani-royal', name: 'Rajasthani Royal', primary: '#FDBA74', accent: '#C2410C', desc: 'Saffron orange, deep marigold, and copper patterns.' },
  { id: 'maharashtrian-heritage', name: 'Maharashtrian Heritage', primary: '#FDA4AF', accent: '#BE123C', desc: 'Rich saffron reds and royal blue borders.' },
  { id: 'italian-trattoria', name: 'Italian Trattoria', primary: '#EF4444', accent: '#15803D', desc: 'Tuscan olive and rich sun-dried tomato accents.' },
  { id: 'japanese-sakura', name: 'Japanese Sakura', primary: '#FBCFE8', accent: '#DB2777', desc: 'Soft cherry blossom pink and dark slate stone.' },
  { id: 'mughal-garden', name: 'Mughal Garden', primary: '#A7F3D0', accent: '#047857', desc: 'Deep emerald greens and delicate white marble.' },
  { id: 'classic-cafe', name: 'Classic Cafe', primary: '#F5EFE6', accent: '#78350F', desc: 'Warm cream foundations and dark espresso brown.' },
  { id: 'modern-bistro', name: 'Modern Bistro', primary: '#E2E8F0', accent: '#0F172A', desc: 'Monochrome charcoal, cool steel, and cobalt lines.' }
];

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carousel & Selector States
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'orders' | 'revenue' | 'tables' | 'inventory' | 'staff'>('orders');

  // Real-time simulated metrics
  const [liveOrders, setLiveOrders] = useState([
    { id: '#1024', item: 'Cold Brew Espresso', status: 'preparing', time: '1m ago', table: 'T-04' },
    { id: '#1023', item: 'Avocado Toast + CGST', status: 'ready', time: '3m ago', table: 'T-08' },
    { id: '#1022', item: 'Truffle Mushroom Risotto', status: 'served', time: '8m ago', table: 'T-02' }
  ]);
  const [liveRevenue, setLiveRevenue] = useState(842400); // 8424.00 INR stored in paise
  const [activeTables, setActiveTables] = useState(12);

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    gstin: '',
    fssaiNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    businessType: 'cafe',
    expectedStaffCount: '5',
    expectedBranchCount: '1',
    planKey: 'starter',
  });

  // Simulated live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment orders / change states
      setLiveOrders(prev => {
        const updated = [...prev];
        // randomly update status
        const idx = Math.floor(Math.random() * updated.length);
        if (updated[idx].status === 'preparing') {
          updated[idx].status = 'ready';
        } else if (updated[idx].status === 'ready') {
          updated[idx].status = 'served';
        } else {
          updated[idx].status = 'preparing';
          updated[idx].id = '#' + (parseInt(updated[idx].id.replace('#', '')) + 3).toString();
          updated[idx].time = 'Just now';
        }
        return updated;
      });

      // Increment revenue randomly (in paise, around 20-50 INR increments)
      setLiveRevenue(r => r + Math.floor(Math.random() * 3000 + 2000));
      // fluctuate tables
      setActiveTables(t => {
        const val = t + (Math.random() > 0.5 ? 1 : -1);
        return val >= 4 && val <= 25 ? val : 12;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.businessName) {
        setErrorMsg('Please enter your business name.');
        return;
      }
    } else if (currentStep === 2) {
      if (form.gstin && form.gstin.trim().length !== 15) {
        setErrorMsg('GSTIN must be exactly 15 characters if provided.');
        return;
      }
    }
    setErrorMsg(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName || !form.email || !form.phone) {
      setErrorMsg('Owner name, email, and phone contact details are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to submit registration request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please check network/credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setSuccess(false);
    setErrorMsg(null);
    setForm({
      businessName: '',
      ownerName: '',
      phone: '',
      email: '',
      gstin: '',
      fssaiNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      businessType: 'cafe',
      expectedStaffCount: '5',
      expectedBranchCount: '1',
      planKey: 'starter',
    });
  };

  const handleOpenRegistration = (planKey: string) => {
    setForm(prev => ({ ...prev, planKey }));
    setShowModal(true);
  };

  return (
    <main className="min-h-screen bg-[#0F0E0D] text-[#FDF6EC] font-sans antialiased overflow-x-hidden relative">
      
      {/* 1. STICKY PREMIUM HEADER */}
      <nav className="sticky top-0 w-full backdrop-blur-lg bg-[#0F0E0D]/80 border-b border-[#D4854A]/10 p-5 flex justify-between items-center z-40 max-w-7xl mx-auto rounded-b-2xl">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] flex items-center justify-center shadow-lg shadow-[#D4854A]/25 border border-white/10">
            <Coffee className="text-[#0F0E0D] w-5 h-5" />
          </div>
          <span className="font-extrabold text-[#FDF6EC] tracking-tight">Cafe<span className="text-[#D4854A]">Canva</span></span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-stone-300">
          <a href="#problem" className="hover:text-[#D4854A] transition-colors">Solutions</a>
          <a href="#features" className="hover:text-[#D4854A] transition-colors">Features</a>
          <a href="#storefront" className="hover:text-[#D4854A] transition-colors">Storefront</a>
          <a href="#themes" className="hover:text-[#D4854A] transition-colors">Themes</a>
          <a href="#pricing" className="hover:text-[#D4854A] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#D4854A] transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-block px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-stone-300 hover:bg-white/5 transition-all">
            Console Sign In
          </Link>
          <button 
            onClick={() => handleOpenRegistration('growth')}
            className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0D] shadow-lg shadow-[#D4854A]/20 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            Start Free Trial
          </button>
        </div>
      </nav>

      {/* 2. SECTION 1: FULL SCREEN HERO */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden z-10 px-6">
        {/* Background Ambient Video */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0D]/30 via-[#0F0E0D]/75 to-[#0F0E0D] z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-35"
          >
            <source src="/assets/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Liquid Glass Overlay Content */}
        <div className="relative z-20 max-w-5xl text-center mx-auto space-y-8 py-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black tracking-widest text-[#C9A84C] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D4854A] animate-pulse"></span>
            Restaurant Operating System · Live
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#FDF6EC] leading-tight">
            Run Your Entire Restaurant <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4854A] via-[#C9A84C] to-[#E8A598]">From One Platform</span>
          </h1>

          <p className="text-base md:text-lg text-stone-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Manage billing, staff, live inventory, subdomains storefronts, hourly analytics, and table sessions from a single unified operating center. Tailored specifically for hospitality groups.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => handleOpenRegistration('growth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0D] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D4854A]/10 hover:scale-[1.02] transition-all cursor-pointer"
            >
              Start Free Trial <ArrowRight size={16} />
            </button>
            <a 
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-center"
            >
              See Pricing
            </a>
          </div>

          {/* Quick Statistics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
            {[
              { val: '10,000+', desc: 'Tables Managed Daily' },
              { val: '50 Limit', desc: 'Staff Accounts/Store' },
              { val: 'Multi-Branch', desc: 'Central Control Ready' },
              { val: '< 9ms', desc: 'DB Sync Latency' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl text-center space-y-1">
                <div className="text-lg md:text-xl font-black text-[#D4854A]">{stat.val}</div>
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: THE PROBLEM */}
      <section id="problem" className="relative max-w-6xl mx-auto px-6 py-24 border-t border-[#D4854A]/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC]">Restaurant Owners Deserve Better Tools</h2>
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">The friction of legacy setups vs CafeCanvas OS</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Old Way */}
          <div className="bg-[#1C1A17]/60 border border-red-900/10 p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex px-3 py-1 bg-red-950/40 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-950">
                The Disconnected Old Way
              </div>
              <p className="text-xs text-stone-400 leading-normal">
                Running a modern hospitality workspace requires stitching together multiple applications that never talk to each other.
              </p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-stone-850">
              {[
                'Multiple software subscriptions for POS, QR menu, and rosters',
                'Manual paper-based billing prone to float rounding errors',
                'Stock/ingredient leakage due to delayed inventory counts',
                'Staff tracking problems with shift check-ins and attendance logs',
                'No unified online brand storefront mapped to custom domains'
              ].map((p, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-stone-300 font-semibold items-start">
                  <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Way: CafeCanvas */}
          <div className="bg-gradient-to-br from-[#1C1A17] to-[#25221F] border border-[#D4854A]/25 p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-2xl shadow-[#D4854A]/5">
            <div className="space-y-4">
              <div className="inline-flex px-3 py-1 bg-[#D4854A]/10 text-[#C9A84C] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#D4854A]/25">
                The Unified CafeCanvas Way
              </div>
              <p className="text-xs text-[#FDF6EC] leading-normal font-semibold">
                An all-in-one unified restaurant operating platform. Everything synchronizes instantly using direct database triggers and real-time sockets.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-[#D4854A]/10">
              {[
                'Single integrated platform covering POS, KDS, staff, and themes',
                'Paise-precision transactions split automatically by CGST & SGST',
                'Deducts stock metrics automatically on order preparing states',
                'Staff attendance app using secure GPS boundaries and selfie check-ins',
                'Instant dynamic storefronts mapped to custom domains out-of-the-box'
              ].map((p, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-[#FDF6EC] font-semibold items-start">
                  <Check size={16} className="text-[#C9A84C] shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3: WHAT IS CAFECANVAS */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#D4854A]/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold">The Operating System For Modern Hospitality</h2>
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Feature-complete ecosystem ready for deployment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Store className="text-[#D4854A]" />, title: 'Restaurant POS', desc: 'Paise-precision checkouts, split tax reporting, table reservations, and discount code hooks.' },
            { icon: <Layers className="text-[#C9A84C]" />, title: 'Inventory Control', desc: 'Automatic stock deductions upon order state transition, PO creations, and supplier registers.' },
            { icon: <Users className="text-[#E8A598]" />, title: 'Staff App Integration', desc: 'Mobile/Tablet clock-in, geofence barriers, shift history logs, and roles access checks.' },
            { icon: <Globe className="text-[#D4854A]" />, title: 'Subdomain Storefront', desc: 'Instant theme-rendered menus mapped to your custom domain nodes without restarts.' },
            { icon: <ChefHat className="text-[#C9A84C]" />, title: 'Kitchen Display (KDS)', desc: 'Websocket-fueled order preparation status updates reflecting instantly across nodes.' },
            { icon: <BarChart3 className="text-[#E8A598]" />, title: 'Analytical Insights', desc: 'Hourly revenue trackers, top-performing product charts, and attendance ledgers.' }
          ].map((item, i) => (
            <div key={i} className="bg-[#1C1A17]/80 border border-[#D4854A]/10 p-6 rounded-3xl space-y-4 hover:border-[#D4854A]/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-black text-[#FDF6EC] uppercase tracking-wider">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION 4: RESTAURANT OS SHOWCASE */}
      <section className="bg-[#151311] border-y border-[#D4854A]/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#D4854A] tracking-widest">Real-time Terminal Showcase</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC] leading-tight">Live Operation Monitoring Panel</h2>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                Watch orders, tables, and revenues adjust live as customer checkouts occur. The simulation shows exact database metrics computed in paise.
              </p>

              {/* Showcase Tab Nav */}
              <div className="flex flex-wrap gap-2 pt-4">
                {(['orders', 'revenue', 'tables'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveShowcaseTab(tab)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      activeShowcaseTab === tab 
                        ? 'bg-[#D4854A]/10 border-[#D4854A] text-[#C9A84C]' 
                        : 'bg-white/5 border-transparent text-stone-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Panel screen */}
            <div className="lg:col-span-7 bg-[#1C1A17] border border-[#D4854A]/15 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-850 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[9px] uppercase tracking-widest font-black text-stone-400">Live POS Monitor Node</span>
                </div>
                <div className="text-[9px] font-mono text-stone-500">Auto Sync Sockets active</div>
              </div>

              {activeShowcaseTab === 'orders' && (
                <div className="space-y-3 min-h-[220px] flex flex-col justify-center">
                  <div className="text-[10px] font-black uppercase text-stone-400 mb-1">Active Kitchen Queue</div>
                  {liveOrders.map(o => (
                    <div key={o.id} className="p-3.5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#FDF6EC]">{o.item}</div>
                        <span className="text-[9px] text-stone-500 font-mono font-bold">{o.id} · Table {o.table}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        o.status === 'served' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : o.status === 'ready'
                          ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25'
                          : 'bg-[#D4854A]/10 text-[#D4854A] border border-[#D4854A]/25'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeShowcaseTab === 'revenue' && (
                <div className="space-y-4 min-h-[220px] flex flex-col justify-center text-center">
                  <div className="text-[10px] font-black uppercase text-stone-400">Simulated Store Volume</div>
                  <div className="text-4xl font-extrabold text-[#FDF6EC] tracking-tight">
                    ₹{(liveRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    CGST (2.5%): ₹{((liveRevenue * 0.025) / 100).toFixed(2)} | SGST (2.5%): ₹{((liveRevenue * 0.025) / 100).toFixed(2)}
                  </p>
                </div>
              )}

              {activeShowcaseTab === 'tables' && (
                <div className="space-y-4 min-h-[220px] flex flex-col justify-center text-center">
                  <div className="text-[10px] font-black uppercase text-stone-400">Store Capacity Monitoring</div>
                  <div className="text-5xl font-black text-[#D4854A]">{activeTables} <span className="text-xs text-stone-500 uppercase font-black tracking-widest">Active Tables</span></div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    Available seats: {40 - activeTables} / 40 total locations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 5: DIGITAL MENU & STOREFRONT */}
      <section id="storefront" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#D4854A]/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase text-[#D4854A] tracking-widest">Brand Storefront Builder</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC] leading-tight">Instant Deployment to Custom Subdomains</h2>
            <p className="text-xs text-stone-400 font-semibold leading-relaxed">
              Every edit to pricing, item descriptions, and photos in your admin console compiles instantly to your public storefront menu. 
            </p>

            <div className="space-y-3 pt-4">
              {[
                { title: 'Custom Domains', desc: 'Secure connection mapping with Vercel SSL alias routing.' },
                { title: 'Interactive Reservations', desc: 'Table bookings route directly into the cashier monitor panel.' },
                { title: 'Branding Theme Customization', desc: 'Choose from 10 high-end layout styles matching your pub or cafe.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 text-xs font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4854A] shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-stone-300 font-bold">{item.title}</h4>
                    <p className="text-stone-500 text-[11px] mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1A17] border border-[#D4854A]/10 p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-850 pb-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-stone-400">Live Customer Portal</span>
              <span className="text-[9px] font-mono text-[#D4854A] font-bold">brewhouse.cafecanvas.bar</span>
            </div>
            
            <div className="space-y-4">
              <div className="text-xs text-[#FDF6EC] font-bold uppercase tracking-wider">Tuscan Gourmet Menu</div>
              <div className="space-y-2">
                {[
                  { name: 'Artisanal Latte Macchiato', desc: 'Brushed organic oat milk, microfoam', price: '₹220' },
                  { name: 'Pecan Butter Croissant', desc: 'Freshly baked flaky pastry layers', price: '₹180' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs font-bold text-stone-300">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-[9px] text-stone-500 font-medium mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[#C9A84C]">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-[10px] text-stone-400 font-bold">
              <span>✓ Tableside Order Active</span>
              <span className="px-3 py-1 bg-[#D4854A]/10 text-[#C9A84C] border border-[#D4854A]/20 rounded-lg">Pay tableside</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 6: STAFF APP */}
      <section className="bg-[#151311] border-y border-[#D4854A]/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 bg-[#1C1A17] border border-[#D4854A]/10 p-6 rounded-3xl shadow-xl space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-stone-850 pb-4">
                <span className="text-[9px] font-black uppercase text-stone-400">Staff POS Mobile App</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[8px] font-black">ONLINE</span>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-300">Shift Clock-In Verification</span>
                  <span className="text-[10px] text-[#C9A84C] font-bold">GPS Checked</span>
                </div>
                <div className="p-3 bg-[#131210] border border-[#D4854A]/10 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#FDF6EC]">Amit Patel</div>
                    <div className="text-[9px] text-stone-500 font-mono mt-0.5">Role: Manager</div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                    Selfie Verified
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-xs">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Table Sessions</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase">
                  <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-500">T-01 (Empty)</div>
                  <div className="p-2.5 bg-[#D4854A]/10 border border-[#D4854A]/25 rounded-lg text-[#D4854A]">T-02 (Ordered)</div>
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">T-03 (Billed)</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase text-[#D4854A] tracking-widest">Mobile operations app</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC] leading-tight">Empower Waiters & Floor Staff</h2>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                Provide waiters and kitchen personnel with mobile POS controls. Enable geofence attendance logs, instant stock availability updates, table layouts, and automated digital receipts split by taxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 7: HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#D4854A]/5 text-center">
        <div className="max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold">How CafeCanvas Operations Deploy</h2>
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">From initial sandbox setup to dynamic live storefront</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Submit Onboarding', desc: 'Complete the self-onboarding wizard from our landing page CTA.' },
            { step: '02', title: 'Live Node Verification', desc: 'Super Admins verify credentials, approve subdomain configurations, and dispatch access keys.' },
            { step: '03', title: 'Launch Operations', desc: 'Roster staff users under the 50 cap, upload menu matrices, generate table QR codes, and go live.' }
          ].map((item, i) => (
            <div key={i} className="bg-[#1C1A17]/60 border border-[#D4854A]/5 p-8 rounded-3xl space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-4 right-6 text-5xl font-black text-[#D4854A]/10 font-mono">
                {item.step}
              </div>
              <h3 className="text-base font-black text-[#FDF6EC] uppercase tracking-wider mt-4">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. SECTION 8: INDUSTRIES */}
      <section className="bg-[#151311] border-y border-[#D4854A]/5 py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold">Built For The Entire Industry</h2>
            <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Specialized features for every branch style</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Specialty Cafes', 'Fine Dining Restaurants', 'Cocktail Bars', 'Gastropubs',
              'Cloud Kitchens', 'Gourmet Bakeries', 'Food Courts', 'Restaurant Chains'
            ].map((ind, i) => (
              <div key={i} className="bg-[#1C1A17] border border-[#D4854A]/10 p-5 rounded-2xl font-bold text-xs uppercase tracking-wider text-[#FDF6EC] hover:border-[#D4854A]/35 transition-all text-center">
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SECTION 9: WHY CAFECANVAS (STORYTELLING) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
        <span className="text-[10px] font-black uppercase text-[#D4854A] tracking-widest">Our core philosophy</span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC] leading-tight">Giving Brand Ownership Back to Restaurateurs</h2>
        <p className="text-xs md:text-sm text-stone-400 leading-relaxed max-w-2xl mx-auto font-medium">
          CafeCanvas is built with a single goal: removing intermediate platforms. We believe restaurant and pub owners deserve to own their digital menus, client relationships, and domains directly, rather than relying on bloated aggregator frameworks. That’s why we engineered a complete restaurant operating engine, not just a checkout script.
        </p>
      </section>

      {/* 11. SECTION 10: THEME SHOWCASE CAROUSEL */}
      <section id="themes" className="bg-[#151311] border-y border-[#D4854A]/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold">Elegantly Tailored Storefront Themes</h2>
            <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Select from 10 premium layouts to match your brand style</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Theme navigation list */}
            <div className="bg-[#1C1A17] border border-[#D4854A]/10 rounded-3xl p-6 space-y-1 max-h-[400px] overflow-y-auto">
              {luxuryThemes.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveThemeIdx(i)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeThemeIdx === i 
                      ? 'bg-[#D4854A]/10 border border-[#D4854A] text-[#C9A84C]' 
                      : 'text-stone-400 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{theme.name}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>

            {/* Selected theme visual mockup */}
            <div className="lg:col-span-2 bg-[#1C1A17] border border-[#D4854A]/25 p-8 rounded-3xl flex flex-col justify-between min-h-[400px] relative overflow-hidden shadow-2xl">
              {/* Colored ambient glow */}
              <div 
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: luxuryThemes[activeThemeIdx].primary }}
              />

              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-stone-400">Live Preview: {luxuryThemes[activeThemeIdx].name}</span>
                <h3 className="text-xl font-bold text-[#FDF6EC] leading-tight">{luxuryThemes[activeThemeIdx].desc}</h3>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-stone-300">
                  <span>Theme Variable Accent</span>
                  <span 
                    className="w-4 h-4 rounded-full border border-white/20 transition-all duration-500" 
                    style={{ backgroundColor: luxuryThemes[activeThemeIdx].accent }}
                  />
                </div>
                <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ backgroundColor: luxuryThemes[activeThemeIdx].accent, width: '65%' }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => handleOpenRegistration('growth')}
                  className="px-5 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0D] rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Deploy with this Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SECTION 11: PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#D4854A]/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold">Honest, Predictable Pricing</h2>
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Choose a suite matching your operational volume</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.key} 
              className={`bg-[#1C1A17] border rounded-3xl p-6 flex flex-col justify-between h-[520px] relative transition-all ${
                plan.popular 
                  ? 'border-[#D4854A] shadow-xl shadow-[#D4854A]/5 scale-[1.02]' 
                  : 'border-[#D4854A]/10'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0D] text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase text-[#C9A84C] tracking-widest">{plan.name}</div>
                <div className="text-3xl font-black text-[#FDF6EC]">
                  {plan.price === 'Custom' ? 'Custom' : `₹${plan.price}`}
                  {plan.price !== 'Custom' && <span className="text-[10px] text-stone-500 font-bold uppercase ml-1">/mo</span>}
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-semibold">{plan.description}</p>
                
                <hr className="border-stone-850" />

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] text-stone-300 font-bold">
                      <Check size={12} className="text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleOpenRegistration(plan.key)}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
                  plan.popular 
                    ? 'bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0D]' 
                    : 'bg-white/5 hover:bg-white/10 text-[#FDF6EC]'
                }`}
              >
                Select this suite
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 13. SECTION 12: TESTIMONIALS */}
      <section className="bg-[#151311] border-y border-[#D4854A]/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDF6EC]">SaaS Validation From the Floor</h2>
            <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Real restaurant growth stories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: 'CafeCanvas allowed us to ditch three software subscriptions. We map our tableside orders directly to our custom subdomain, saving thousands of rupees in aggregator commission fees.', author: 'Amit Patel', store: 'Bandra Brews Coffeehouse' },
              { text: 'The paise-precision POS handles CGST & SGST configurations automatically. Roster allocations for our 45 staff members are geofence-protected. Autoplay KDS updates are extremely clean.', author: 'Preeti Sharma', store: 'AETHER Café & Lounge' },
              { text: 'Impersonating storefront configurations and editing menu structures instantly without application builds is a game changer. Customer accounts manage their loyalty rewards directly.', author: 'Yash Zagde', store: 'Tuscan Food Hall' }
            ].map((test, i) => (
              <div key={i} className="bg-[#1C1A17] border border-[#D4854A]/15 p-8 rounded-3xl space-y-4 relative flex flex-col justify-between">
                <p className="text-xs text-stone-400 leading-relaxed font-semibold italic">"{test.text}"</p>
                <div>
                  <div className="font-bold text-[#FDF6EC] text-xs uppercase tracking-wider">{test.author}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">{test.store}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. SECTION 13: FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-[#D4854A]/5">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold">Frequently Asked Questions</h2>
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Got questions? We have the answers</p>
        </div>

        <div className="space-y-4">
          {[
            { q: 'Is CafeCanvas a POS or a QR menu?', a: 'CafeCanvas is a complete Multi-Tenant Restaurant Operating System. It covers everything from POS checkout registers and geofenced staff attendance to automated custom subdomain storefronts.' },
            { q: 'How does the staff limit work?', a: 'Every tenant is allowed to register up to 50 active staff profiles in their public.users database records. This is enforced directly at the Postgres trigger layer.' },
            { q: 'Do you charge transaction commissions?', a: 'No, we do not charge commissions on checkout transactions. Payments are routed directly to your integrated Razorpay credentials without intermediary cuts.' },
            { q: 'What is the tax configuration?', a: 'The platform enforces Indian tax split configurations (CGST 2.5% + SGST 2.5% default) computed in paise (integers) to prevent float value rounding issues.' },
            { q: 'Can I map my own custom domain?', a: 'Yes! Growth, Professional, and Enterprise tiers allow you to link custom domains (e.g. order.mybrand.com) mapped using Vercel DNS alias certificates.' },
            { q: 'What happens when I edit menu items?', a: 'All mutations to menu descriptions, prices, or photos in the admin console are automatically synchronized with public storefronts instantly using Supabase WebSocket channels.' },
            { q: 'Is geofence selfie check-in mandatory?', a: 'Attendance logs can be geofenced to physical outlet coordinates with selfie checks enabled/disabled from the store settings dashboard.' },
            { q: 'How do I get approved as a tenant?', a: 'After completing the self-onboarding request form, our Super Admins verify your GSTIN/FSSAI registration credentials and activate your database node within 24 hours.' },
            { q: 'What themes are available for storefronts?', a: 'We provide 10 luxury theme layouts (Matcha Zen, Rajasthani Royal, Mughal Garden, Matcha Zen, Rajasthani Royal, Mughal Garden,Rajasthani Royal, Italian Trattoria, etc.) customized easily via CSS variables.' },
            { q: 'Can I change my plan later?', a: 'Yes, subscription tiers can be modified, upgraded, or downgraded at any time directly through the tenant admin settings drawer.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#1C1A17] border border-[#D4854A]/10 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setActiveFaqIdx(activeFaqIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-[#FDF6EC] cursor-pointer"
              >
                <span>{item.q}</span>
                {activeFaqIdx === idx ? <ChevronDown size={14} className="text-[#D4854A]" /> : <ChevronRight size={14} className="text-stone-400" />}
              </button>
              {activeFaqIdx === idx && (
                <div className="p-5 pt-0 text-[11px] text-stone-400 font-semibold leading-relaxed border-t border-stone-850">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 15. SECTION 14: FINAL CTA */}
      <section className="bg-[#151311] border-t border-[#D4854A]/5 py-24 relative overflow-hidden z-10 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#FDF6EC]">
            Ready To Run Your Restaurant <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4854A] to-[#C9A84C]">Smarter?</span>
          </h2>
          
          <p className="text-xs md:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed font-semibold">
            Join elite hospitality brands managing their POS checkouts, geofenced staff attendance, and custom subdomains storefronts through CafeCanvas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => handleOpenRegistration('growth')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D4854A]/10 hover:scale-[1.02] cursor-pointer"
            >
              Start Free Trial
            </button>
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest text-stone-300 hover:bg-white/10 transition-all text-center"
            >
              Access Command Console
            </Link>
          </div>
        </div>
      </section>

      {/* 16. SECTION 15: FOOTER */}
      <footer className="w-full bg-[#0A0908] py-16 border-t border-[#D4854A]/10 relative z-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs font-semibold text-stone-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#FDF6EC]">
              <div className="w-8 h-8 rounded-xl bg-[#D4854A] flex items-center justify-center">
                <Coffee className="text-[#0F0E0D] w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-[#FDF6EC]">Cafe<span className="text-[#D4854A]">Canva</span></span>
            </div>
            <p className="text-[10px] text-stone-600 leading-relaxed font-semibold">
              The next-generation unified Operating System built for luxury hospitality. CGST + SGST tax split compliant.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Solutions</h4>
            <div className="flex flex-col gap-2">
              <a href="#features" className="hover:text-stone-300 transition-colors">Restaurant POS</a>
              <a href="#features" className="hover:text-stone-300 transition-colors">Waiter Mobile App</a>
              <a href="#storefront" className="hover:text-stone-300 transition-colors">Interactive QR Menu</a>
              <a href="#themes" className="hover:text-stone-300 transition-colors">Theme Engine</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">System Details</h4>
            <div className="flex flex-col gap-2">
              <a href="#pricing" className="hover:text-stone-300 transition-colors">Plan Pricing</a>
              <a href="#faq" className="hover:text-stone-300 transition-colors">FAQ</a>
              <Link href="/superadmin" className="hover:text-stone-300 transition-colors">Platform Admin Login</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Compliance</h4>
            <div className="text-[10px] leading-relaxed text-stone-600">
              CafeCanvas complies with FSSAI regulations and standard GST splits. All financial data is compiled in paise.
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-stone-900 text-center text-[10px] text-stone-600 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} CafeCanvas OS. Built for modern food and beverage businesses.
        </div>
      </footer>

      {/* ONBOARDING FORM MODAL WIZARD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="bg-[#14120F] border border-[#D4854A]/20 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-stone-400 hover:text-[#FDF6EC] p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {!success ? (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4854A]/10 text-[#D4854A] flex items-center justify-center border border-[#D4854A]/20">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#FDF6EC] uppercase tracking-wider">Create Tenant Account</h3>
                    <p className="text-xs text-stone-400 mt-1">Step {currentStep} of 3: Enter details</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-stone-850 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4854A] to-[#C9A84C] transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-xl mb-4 font-semibold text-left">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  {/* STEP 1: BUSINESS BASE INFO */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Business / Brand Name</label>
                        <input 
                          type="text" 
                          name="businessName"
                          required
                          placeholder="e.g. Bandra Brews"
                          value={form.businessName}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Business Type</label>
                          <select 
                            name="businessType"
                            value={form.businessType}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-[#D4854A]/50"
                          >
                            <option value="cafe">Cafe / Roastery</option>
                            <option value="restaurant">Restaurant / Dining</option>
                            <option value="bar">Bar / Pub / Lounge</option>
                            <option value="bakery">Bakery / Patisserie</option>
                            <option value="cloud_kitchen">Cloud Kitchen</option>
                            <option value="other">Other Operations</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Plan Tier</label>
                          <select 
                            name="planKey"
                            value={form.planKey}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none"
                          >
                            <option value="starter">Starter Suite (1 Outlet)</option>
                            <option value="growth">Growth Suite (5 Outlets)</option>
                            <option value="professional">Professional Hub (15 Outlets)</option>
                            <option value="enterprise">Enterprise Custom</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Expected Staff Limit</label>
                          <input 
                            type="number" 
                            name="expectedStaffCount"
                            min="1"
                            max="50"
                            value={form.expectedStaffCount}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Expected Branch Count</label>
                          <input 
                            type="number" 
                            name="expectedBranchCount"
                            min="1"
                            value={form.expectedBranchCount}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                          type="button"
                          onClick={handleNextStep}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CREDENTIALS & LOCATION INFO */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">GSTIN (Optional)</label>
                          <input 
                            type="text" 
                            name="gstin"
                            placeholder="15-character ID"
                            maxLength={15}
                            value={form.gstin}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">FSSAI Number (Optional)</label>
                          <input 
                            type="text" 
                            name="fssaiNumber"
                            placeholder="FSSAI Registration"
                            value={form.fssaiNumber}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Street Address</label>
                        <input 
                          type="text" 
                          name="address"
                          placeholder="Registered Address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">City</label>
                          <input 
                            type="text" 
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">State</label>
                          <input 
                            type="text" 
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Country</label>
                          <input 
                            type="text" 
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button 
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-stone-300"
                        >
                          Back
                        </button>
                        <button 
                          type="button"
                          onClick={handleNextStep}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: OWNER INFO */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Owner / Administrator Full Name</label>
                        <input 
                          type="text" 
                          name="ownerName"
                          required
                          placeholder="e.g. Yash Zagde"
                          value={form.ownerName}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="owner@cafebrand.com"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Contact Number</label>
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            placeholder="Mobile with country code"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-stone-900/50 border border-stone-850 rounded-2xl flex gap-2 text-[10px] text-stone-400 font-semibold leading-relaxed">
                        <ShieldCheck size={18} className="text-[#D4854A] flex-shrink-0" />
                        <span>Security: All submitted registrations undergo Super Admin verification. You will receive an onboarding confirmation email with access details within 24 hours.</span>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button 
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-stone-300"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#D4854A]/10"
                        >
                          {loading ? 'Submitting...' : 'Complete Self-Onboarding'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* Success Panel */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#C9A84C] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  <Award size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black text-[#FDF6EC] uppercase tracking-wider">Registration Completed</h3>
                  <p className="text-xs text-stone-400 leading-relaxed px-4">
                    Your self-onboarding details for <strong className="text-[#FDF6EC]">{form.businessName}</strong> have been successfully registered in the platform system.
                  </p>
                </div>

                <div className="p-4 bg-[#1A1814] border border-[#D4854A]/10 rounded-2xl text-left space-y-3">
                  <div className="flex gap-2 text-xs">
                    <Building2 size={16} className="text-[#D4854A] shrink-0" />
                    <div>
                      <div className="font-bold text-stone-300">Approval Queue Pending</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Verification details & FSSAI are being audited.</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Mail size={16} className="text-[#C9A84C] shrink-0" />
                    <div>
                      <div className="font-bold text-stone-300">Onboarding Email Dispatch</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Access details will be routed to {form.email}.</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Close & Return Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
