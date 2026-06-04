'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  ShoppingBag, 
  TrendingUp, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DownloadsAppPage() {
  const applications = [
    {
      id: 'store-admin-desktop',
      name: 'Store Admin (Windows Desktop)',
      version: 'v1.0.0',
      size: '78.3 MB',
      type: 'Desktop Application (.exe)',
      description: 'Complete management dashboard for restaurant owners and managers. Control billing, floor tables, kitchen workflows, and detailed store analytics.',
      icon: Laptop,
      color: 'from-amber-400 to-orange-500',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      downloadUrl: 'https://store3.gofile.io/download/web/1a5d5118-1ead-491a-83ab-58d1542a9799/CafeCanvas%20Store%20Admin%20Setup%201.0.0.exe',
      badge: 'Owner / Manager'
    },
    {
      id: 'staff-pos-mobile',
      name: 'Staff POS Mobile App',
      version: 'v1.0.0',
      size: '59.1 KB',
      type: 'Android Package (.apk)',
      description: 'Handheld fast billing and tables order dispatcher designed for cashiers, waitstaff, and floor operators. Features offline support and automatic sync.',
      icon: Smartphone,
      color: 'from-amber-500 to-amber-600',
      glowColor: 'rgba(217, 119, 6, 0.3)',
      downloadUrl: 'https://cafecanvas.bar/download/staff_pos.apk',
      badge: 'Waiters / Cashiers'
    },
    {
      id: 'kitchen-display-system',
      name: 'Kitchen Display System (KDS)',
      version: 'v1.0.0',
      size: '12.4 MB',
      type: 'Android Package (.apk)',
      description: 'Smart order status screen for chef counters and cooking staff. Replaces paper receipts with real-time status alerts and cooking duration tracking.',
      icon: Tv,
      color: 'from-yellow-400 to-amber-500',
      glowColor: 'rgba(234, 179, 8, 0.3)',
      downloadUrl: 'https://cafecanvas.bar/download/kitchen_display.apk',
      badge: 'Kitchen Staff'
    },
    {
      id: 'customer-storefront',
      name: 'Customer Storefront App',
      version: 'v1.0.2',
      size: '9.8 MB',
      type: 'Android Package (.apk)',
      description: 'Self-ordering guest storefront wrapper. Allows diners to scan table QRs, browse menus, customize modifiers, place orders, and pay with Razorpay.',
      icon: ShoppingBag,
      color: 'from-amber-600 to-red-500',
      glowColor: 'rgba(180, 83, 9, 0.3)',
      downloadUrl: 'https://cafecanvas.bar/download/customer_storefront.apk',
      badge: 'Self-Service Diner'
    },
    {
      id: 'store-admin-mobile',
      name: 'Store Admin Mobile',
      version: 'v1.0.0',
      size: '10.5 MB',
      type: 'Android Package (.apk)',
      description: 'Real-time mobile business companion. Check sales reports, monitor attendance, edit menu prices instantly, and dispatch SMS alerts on the go.',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-700',
      glowColor: 'rgba(234, 88, 12, 0.3)',
      downloadUrl: 'https://cafecanvas.bar/download/store_admin_mobile.apk',
      badge: 'Business Companion'
    }
  ];

  return (
    <main className="min-h-screen relative text-white font-sans overflow-x-hidden bg-zinc-950 flex flex-col justify-between">
      
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-25 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop')` 
        }}
      />
      
      {/* Liquid background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-[120px]"
        />
        <motion.div 
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 50, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[100px]"
        />
        <motion.div 
          animate={{
            x: [0, 50, -30, 0],
            y: [0, 40, 60, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 -right-20 w-[550px] h-[550px] rounded-full bg-amber-500/10 blur-[130px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex-grow flex flex-col justify-between">
        
        {/* Navigation & Logo */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8 mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
            id="btn-back-home"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Cafe Canvas Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-extrabold tracking-tighter">
              Cafe<span className="text-amber-500">Canva</span>
            </span>
            <span className="text-[10px] bg-white/10 border border-white/10 text-amber-500 font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Download Hub
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-stone-200 to-amber-400 bg-clip-text text-transparent"
          >
            Powering Your Restaurant Operations Everywhere
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base text-stone-400 max-w-2xl mx-auto font-medium"
          >
            Download CafeCanvas standalone applications for Windows terminals, waiter handhelds, chef screens, and guest tables. Simple, high-speed, and secure.
          </motion.p>
        </section>

        {/* Applications Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {applications.map((app, index) => {
            const IconComponent = app.icon;
            return (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', stiffness: 80 }}
                className="group relative rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/[0.03] overflow-hidden"
              >
                
                {/* Subtle dynamic glow behind card */}
                <div 
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: app.glowColor }}
                />

                <div className="space-y-6 relative z-10">
                  {/* Card Header (Icon & Badge) */}
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-lg shadow-black/20`}>
                      <IconComponent size={24} />
                    </div>
                    <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                      {app.badge}
                    </span>
                  </div>

                  {/* Title & Stats */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                      {app.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold">
                      <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{app.version}</span>
                      <span>•</span>
                      <span>{app.size}</span>
                      <span>•</span>
                      <span>{app.type}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-400 leading-relaxed font-medium min-h-[60px]">
                    {app.description}
                  </p>
                </div>

                {/* Download CTA Button */}
                <div className="pt-8 relative z-10">
                  <a
                    href={app.downloadUrl}
                    download
                    id={`btn-download-${app.id}`}
                    className={`inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r ${app.color} hover:brightness-110 text-white font-black text-xs py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer`}
                  >
                    <Download size={14} /> Download Application
                  </a>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* Security / Signature Info Block */}
        <section className="max-w-4xl mx-auto rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/25">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2 flex-grow text-center md:text-left">
            <h4 className="font-extrabold text-sm text-stone-100 flex items-center justify-center md:justify-start gap-1.5">
              <Info size={16} className="text-amber-500" /> Secure Standalone Distribution
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
              CafeCanvas applications are standalone builds. Because they run offline databases (Hive for mobile, SQLite/Electron sync for desktop), your operating system might trigger warnings about unsigned publishers. You can proceed with safety: choose <strong>"Run Anyway"</strong> on Windows or authorize package permissions on Android.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link 
              href="/comingsoon"
              className="inline-flex items-center justify-center gap-1.5 w-full md:w-auto text-xs text-stone-300 hover:text-white font-bold bg-white/5 border border-white/10 py-3 px-5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Layers size={14} /> System Requirements <ChevronRight size={14} />
            </Link>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 bg-black/20 backdrop-blur-md text-center text-[10px] text-stone-500 font-bold z-10">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} CafeCanvas SaaS Platform. All rights reserved. CGST + SGST Split Receipt Billing Compliant.
        </div>
      </footer>
    </main>
  );
}
