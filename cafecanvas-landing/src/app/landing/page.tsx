"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Utensils,
  Wine,
  Beer,
  Music,
  Truck,
  ArrowRight,
  BarChart3,
  Users,
  QrCode,
  CreditCard,
  Laptop,
  TrendingUp,
  Bell,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
} as const;

// --- DATA ARRAYS ---
const industries = [
  { name: "Cafes", icon: Coffee, color: "text-orange-500", border: "hover:border-orange-300", glow: "group-hover:bg-orange-100/30" },
  { name: "Restaurants", icon: Utensils, color: "text-rose-500", border: "hover:border-rose-300", glow: "group-hover:bg-rose-100/30" },
  { name: "Bars", icon: Wine, color: "text-amber-500", border: "hover:border-amber-300", glow: "group-hover:bg-amber-100/30" },
  { name: "Pubs", icon: Beer, color: "text-yellow-650", border: "hover:border-yellow-300", glow: "group-hover:bg-yellow-100/30" },
  { name: "Clubs", icon: Music, color: "text-pink-500", border: "hover:border-pink-300", glow: "group-hover:bg-pink-100/30" },
  { name: "Cloud Kitchens", icon: Truck, color: "text-teal-500", border: "hover:border-teal-300", glow: "group-hover:bg-teal-100/30" },
];

const bentoFeatures = [
  {
    title: "Smart Billing",
    desc: "Lightning-fast POS, GST-ready invoices, split payments, and digital receipts.",
    icon: CreditCard,
    colSpan: "md:col-span-2",
    theme: "teal",
  },
  {
    title: "QR Ordering",
    desc: "Scan-to-order, mobile menus, and contactless dining experiences.",
    icon: QrCode,
    colSpan: "md:col-span-1",
    theme: "orange",
  },
  {
    title: "Staff & Payroll",
    desc: "Automated attendance, shift management, permissions, and payroll.",
    icon: Users,
    colSpan: "md:col-span-1",
    theme: "pink",
  },
  {
    title: "Analytics Dashboard",
    desc: "Live revenue insights, top-selling items, and customer trends.",
    icon: BarChart3,
    colSpan: "md:col-span-2",
    theme: "emerald",
  },
  {
    title: "Multi-Outlet Control",
    desc: "Centralized management and franchise support for growing chains.",
    icon: Laptop,
    colSpan: "md:col-span-3",
    theme: "rose",
  },
];

const themeStyles: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  teal: { text: "text-teal-600", border: "group-hover:border-teal-300", bg: "group-hover:bg-teal-100/40", glow: "group-hover:from-teal-200/30" },
  orange: { text: "text-orange-600", border: "group-hover:border-orange-300", bg: "group-hover:bg-orange-100/40", glow: "group-hover:from-orange-200/30" },
  pink: { text: "text-pink-600", border: "group-hover:border-pink-300", bg: "group-hover:bg-pink-100/40", glow: "group-hover:from-pink-200/30" },
  emerald: { text: "text-emerald-600", border: "group-hover:border-emerald-300", bg: "group-hover:bg-emerald-100/40", glow: "group-hover:from-emerald-200/30" },
  rose: { text: "text-rose-600", border: "group-hover:border-rose-300", bg: "group-hover:bg-rose-100/40", glow: "group-hover:from-rose-200/30" },
};


const galleryFormats = [
  {
    title: "Fine Dining Restaurants",
    tag: "Restaurants",
    image: "/images/restaurant_fine_dining.png",
    desc: "Manage table courses sequencing, dynamic menus, and inventory logs.",
  },
  {
    title: "Cozy Espresso Cafes",
    tag: "Cafes",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=85",
    desc: "Optimize queue speeds, checkouts, and barista ticket completions.",
  },
  {
    title: "Premium Cocktail Bars",
    tag: "Bars & Lounges",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=85",
    desc: "Coordinate table orders, split billing totals, and tab allocations.",
  },
  {
    title: "Upscale Gastropubs",
    tag: "Pubs & Breweries",
    image: "https://images.unsplash.com/photo-1574096079513-d8259312b7a3?auto=format&fit=crop&w=800&q=85",
    desc: "Monitor raw drafts stocks and waiter performance matrices.",
  },
];

const testimonials = [
  {
    name: "Rajesh Patel",
    role: "Managing Director",
    business: "Mumbai Bistro House, Mumbai",
    quote: "CafeCanvas saved us over ₹3.4 Lakhs in billing leaks and manual errors in just 3 months. The real-time reconciliation matches cash, card, and UPI perfectly.",
    rating: 5,
    impact: "14% Profit Margins ↑",
  },
  {
    name: "Priya Deshmukh",
    role: "Founder",
    business: "The Herb Garden Cafe, Pune",
    quote: "Our staff loves using the system. Shift coordination is fully transparent and payroll calculations take minutes instead of days. Having POS and QR ordering connected saves hours daily.",
    rating: 5,
    impact: "Zero Staff Turnover",
  },
  {
    name: "Arjun Singh",
    role: "Owner",
    business: "Brew & Barrel Brewery, Bangalore",
    quote: "Introducing QR ordering increased our table turnaround speed by 28%. Guests spend more when they can reorder drinks instantly. An absolute game changer for busy weekend rushes.",
    rating: 5,
    impact: "+32% Check Average ↑",
  },
];

// --- MAIN COMPONENT ---
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-stone-850 bg-stone-50 font-sans selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden relative">
      
      {/* --- LIQUID BACKGROUND --- */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-200/50 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -150, 100, 0],
            y: [0, 150, -50, 0],
            scale: [1, 1.1, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-orange-200/50 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 50, -100, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.4, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-pink-200/50 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 80, -100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-emerald-200/40 rounded-full blur-[100px]"
        />
      </div>

      {/* --- NAVIGATION --- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/40 backdrop-blur-xl border-b border-white/60 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-orange-400 flex items-center justify-center font-bold text-white text-xl italic shadow-[0_2px_10px_rgba(249,115,22,0.3)]">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">
              Cafe<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Canvas</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <a href="#platform" className="hover:text-teal-600 transition-colors">
              Platform
            </a>
            <a href="#industries" className="hover:text-orange-600 transition-colors">
              Industries
            </a>
            <a href="#story" className="hover:text-pink-600 transition-colors">
              Our Story
            </a>
            <Link href="/auth?mode=login" className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-full text-xs font-bold transition">
              Sign In
            </Link>
          </div>

          <button
            className="md:hidden text-stone-700 hover:text-stone-950"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-250 p-6 flex flex-col gap-4 text-sm font-bold shadow-lg"
            >
              <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="text-stone-750 hover:text-teal-600">Platform</a>
              <a href="#industries" onClick={() => setMobileMenuOpen(false)} className="text-stone-750 hover:text-orange-600">Industries</a>
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="text-stone-750 hover:text-pink-600">Our Story</a>
              <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-stone-900 text-white rounded-lg">
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm text-stone-700 text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
              The Operating System for Modern Hospitality
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1] text-stone-900"
            >
              Run Your Hospitality <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-orange-500 to-pink-500">
                Business Smarter.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl mb-10 leading-relaxed font-light"
            >
              CafeCanvas helps restaurants, cafes, bars, pubs, and clubs manage billing, analytics, inventory, staff, and customer operations through one connected platform.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth?mode=signup"
                className="px-8 py-4 bg-white/70 backdrop-blur-xl border border-white/80 text-stone-900 font-bold rounded-full text-base shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.15)] hover:bg-white/90 hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-orange-655">
                  Get Started
                </span>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth?mode=login"
                className="px-8 py-4 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-full text-base transition-all hover:scale-105 shadow-md shadow-stone-950/10 cursor-pointer"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- INDUSTRIES SECTION --- */}
      <section id="industries" className="py-24 relative z-10 border-t border-white/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-stone-900">
              Built for Modern Hospitality
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Powering operations across all formats of the food & beverage industry.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {industries.map((industry, index) => {
              const IndustryIcon = industry.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 ${industry.border} hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all cursor-pointer`}
                >
                  <div className={`absolute inset-0 opacity-0 transition-opacity ${industry.glow}`}></div>
                  <IndustryIcon className={`w-10 h-10 transition-transform group-hover:scale-110 ${industry.color}`} />
                  <span className="font-bold text-sm text-stone-700 group-hover:text-stone-900 relative z-10">
                    {industry.name}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- WHY CAFECANVAS EXISTS --- */}
      <section id="story" className="py-32 relative border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center bg-white/30 backdrop-blur-2xl border border-white/50 p-12 md:p-16 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight text-stone-900">
              Most hospitality software was built like{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                accounting tools.
              </span>
            </h2>
            <p className="text-xl text-stone-600 mb-8 font-light italic">Cold. Slow. Complicated.</p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-pink-400 mx-auto mb-8 rounded-full opacity-70"></div>
            <p className="text-base sm:text-lg text-stone-755 mb-8 leading-relaxed font-light">
              Hospitality businesses lose significant revenue due to disconnected legacy systems, manual billing leakage, stock inventory confusion, shift disputes, and opaque reporting. CafeCanvas solves these problems through one unified operating system.
            </p>
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              We are building a business command center. Not just software.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FOUNDER STORY --- */}
      <section className="py-24 relative border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative p-4 bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&grayscale=true"
                alt="Yash Zagade - Founder of CafeCanvas"
                className="relative rounded-[1.5rem] w-full max-w-md mx-auto hover:grayscale-0 transition-all duration-700 object-cover aspect-[4/5]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900">
                The Vision Behind <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  CafeCanvas
                </span>
              </h2>
              <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed font-light">
                <p>
                  Yash Zagade founded CafeCanvas to help hospitality businesses modernize operations with better technology and connected systems.
                </p>
                <p>
                  Many restaurants and cafes still rely on outdated tools that create operational challenges and limit growth. Disconnected POS billing, siloed inventory sheets, and shift roster disputes drag down performance.
                </p>
                <p>
                  CafeCanvas is designed to simplify operations, automate menu transfers, plug billing leakage, and help businesses scale more efficiently.
                </p>
              </div>

              <div className="relative pl-8 py-4 border border-white/40 bg-white/20 backdrop-blur-md rounded-r-2xl border-l-2">
                <div className="absolute top-0 left-[-2px] w-[3px] h-full bg-gradient-to-b from-teal-400 to-pink-400 rounded-full"></div>
                <p className="text-xl md:text-2xl font-serif italic text-stone-800 leading-snug">
                  "Restaurants deserve software that feels as modern as the experiences they create."
                </p>
                <p className="mt-4 text-pink-600 font-bold tracking-widest uppercase text-xs">
                  — Yash Zagade, Founder
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section id="platform" className="py-32 relative border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-stone-900">
              Everything you need.
              <br />
              <span className="text-stone-500/80">Nothing you don't.</span>
            </h2>
            <p className="text-lg md:text-xl text-stone-600 font-light">
              A complete operating system designed exclusively for modern F&B.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {bentoFeatures.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              const styles = themeStyles[feature.theme];

              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className={`group relative overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-3xl p-8 transition-all duration-500 ${styles.border} ${feature.colSpan} hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]`}
                >
                  <div
                    className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/85 to-transparent rounded-full blur-3xl transition-colors duration-500 ${styles.glow}`}
                  ></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div
                        className={`w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${styles.bg} ${styles.border} ${styles.text}`}
                      >
                        <FeatureIcon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-stone-900">{feature.title}</h3>
                      <p className="text-stone-600 text-base leading-relaxed font-light">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- FORMATS GALLERY SECTION --- */}
      <section className="py-24 relative border-t border-white/30 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16 space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              Operating Systems Tailored for Hospitality
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Explore dynamic frameworks built for your exact operational footprint.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryFormats.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white/45 backdrop-blur-xl border border-white/60 hover:border-orange-200/50 rounded-2xl overflow-hidden shadow-sm flex flex-col group transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-102 transition duration-500"
                    unoptimized={item.image.startsWith("http")}
                  />
                  <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-orange-500 transition duration-200">
                      {item.title}
                    </h3>
                    <p className="text-stone-500 text-xs mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE DASHBOARD MOCKUP --- */}
      <section className="py-24 relative border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-stone-900">
            More Than Software.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 font-extrabold">
              Built for Hospitality.
            </span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl mx-auto px-6"
        >
          {/* Dashboard Glass Container */}
          <div className="relative rounded-t-[2.5rem] border-t border-l border-r border-white/80 bg-white/30 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-[550px]">
            {/* Top Bar */}
            <div className="h-16 border-b border-white/40 bg-white/40 flex items-center px-8 justify-between">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-rose-500/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-amber-500/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-green-500/20"></div>
              </div>
              <div className="flex items-center gap-5 text-stone-500">
                <div className="relative">
                  <Bell className="w-5 h-5 hover:text-stone-800 transition-colors cursor-pointer" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 border-[2px] border-white shadow-sm cursor-pointer"></div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 grid grid-cols-3 gap-8 relative bg-white/10">
              {/* Sidebar */}
              <div className="col-span-1 space-y-4">
                <div className="h-12 bg-white/60 backdrop-blur-md rounded-2xl w-full flex items-center px-5 border border-white/80 text-teal-700 font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <TrendingUp className="w-5 h-5 mr-3 text-teal-600" /> Live Overview
                </div>
                <div className="h-12 bg-white/20 backdrop-blur-md rounded-2xl w-full border border-white/40"></div>
                <div className="h-12 bg-white/20 backdrop-blur-md rounded-2xl w-full border border-white/40"></div>

                {/* Floating Notification */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="mt-10 p-4 rounded-[1.5rem] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-start gap-4"
                >
                  <div className="p-2.5 rounded-2xl bg-green-100 shadow-inner">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-stone-850 mb-0.5 text-left">Table 12 Paid</p>
                    <p className="text-xs text-green-700 font-medium tracking-wide">Via QR Scan • ₹4,250</p>
                  </div>
                </motion.div>
              </div>

              {/* Main Graph/Data Area */}
              <div className="col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-32 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.5rem] p-6 flex flex-col justify-between hover:border-teal-300 transition-colors">
                    <span className="text-sm font-semibold text-stone-600 uppercase tracking-wider text-left">Today's Revenue</span>
                    <span className="text-4xl font-bold text-stone-900 text-left">₹1.42L</span>
                  </div>
                  <div className="h-32 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.5rem] p-6 flex flex-col justify-between hover:border-orange-300 transition-colors">
                    <span className="text-sm font-semibold text-stone-600 uppercase tracking-wider text-left">Active Orders</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 text-4xl font-bold text-left">
                      24
                    </span>
                  </div>
                </div>

                {/* Glass Graph mockup */}
                <div className="h-52 bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.5rem] p-6 relative overflow-hidden flex items-end gap-3 pt-12">
                  <div className="absolute top-6 left-6 text-sm font-bold text-stone-600">Hourly Volume</div>
                  {[40, 60, 30, 80, 100, 60, 70, 90, 50, 80].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-orange-400/80 via-pink-400/80 to-emerald-400/80 rounded-t-lg backdrop-blur-md border-t border-white/50 opacity-90 hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
                    ></motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white/60 to-transparent pointer-events-none backdrop-blur-[2px]"></div>
          </div>
        </motion.div>
      </section>

      {/* --- PRICING SECTION REMOVED --- */}

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 relative border-t border-white/30 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16 space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              Loved by Hospitality Operators
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              See how CafeCanvas helps restaurants, cafes, and bars control their margins and scale operations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 bg-white/45 backdrop-blur-xl border border-white/60 rounded-2xl flex flex-col justify-between hover:shadow-sm transition"
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, idx) => (
                      <span key={idx} className="text-amber-400 text-base">★</span>
                    ))}
                  </div>
                  <blockquote className="text-stone-600 text-sm italic leading-relaxed">
                    "{t.quote}"
                  </blockquote>
                </div>
                <div className="pt-6 border-t border-white/40 mt-6 flex justify-between items-end">
                  <div>
                    <h4 className="font-extrabold text-stone-950 text-sm">{t.name}</h4>
                    <p className="text-[10px] text-stone-500 font-semibold">{t.role}</p>
                    <p className="text-[10px] text-orange-500 font-semibold mt-0.5">{t.business}</p>
                  </div>
                  <span className="text-[11px] bg-green-500/10 text-green-700 border border-green-500/15 font-bold px-2.5 py-0.5 rounded-full">
                    {t.impact}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 relative text-center px-6 border-t border-white/30">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-900 leading-tight">
            One Platform For Modern <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500">
              Hospitality Businesses.
            </span>
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            Consolidate your billing POS, tableside QR ordering, staff schedules, and real-time inventory management. Start scaling your operations today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link
              href="/auth?mode=signup"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-655 text-white font-bold rounded-full text-base transition-all hover:scale-105 shadow-md shadow-orange-550/15 cursor-pointer"
            >
              Get Started
            </Link>
            <Link
              href="/auth?mode=login"
              className="px-8 py-4 bg-white/70 backdrop-blur-xl border border-white/80 text-stone-900 font-bold rounded-full text-base shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:bg-white/90 hover:scale-105 transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative bg-white/30 backdrop-blur-xl pt-20 pb-10 border-t border-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-orange-550 flex items-center justify-center font-bold text-white text-xl italic shadow-sm">
                C
              </div>
              <span className="text-2xl font-bold tracking-tight text-stone-900">
                Cafe<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Canvas</span>
              </span>
            </div>
            <p className="text-stone-600 max-w-sm mb-6 text-base font-light leading-relaxed">
              The premium restaurant operating system built for modern hospitality brands.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-6 tracking-wider uppercase text-sm">Contact</h4>
            <ul className="space-y-4 text-stone-600 text-sm">
              <li>
                <a href="tel:+918408060787" className="hover:text-teal-600 transition-colors">
                  +91 8408060787
                </a>
              </li>
              <li>
                <a href="mailto:help@cafecanvas.bar" className="hover:text-orange-600 transition-colors">
                  help@cafecanvas.bar
                </a>
              </li>
              <li>
                <a href="https://cafecanvas.bar" className="hover:text-pink-600 transition-colors">
                  cafecanvas.bar
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-6 tracking-wider uppercase text-sm">Legal</h4>
            <ul className="space-y-4 text-stone-600 text-sm">
              <li>
                <a href="#" className="hover:text-teal-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/50 text-sm text-stone-500 relative z-10">
          <p>© {new Date().getFullYear()} CafeCanvas. All rights reserved.</p>
          <p className="mt-2 md:mt-0 font-medium text-stone-650">Built for Hospitality by Yash Zagade.</p>
        </div>
      </footer>
    </div>
  );
}
