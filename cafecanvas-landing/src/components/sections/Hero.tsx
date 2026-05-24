"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Smartphone, Check, ShieldCheck } from "lucide-react";
import { fadeInUp, staggerContainer, slideRight } from "@/lib/animations";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-gradient-to-tr from-green-50/30 via-orange-50/20 to-slate-50/50 animate-mesh-gradient">
      {/* Background noise and parallax orbs */}
      <div className="noise-overlay" />
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Drift Orb 1 */}
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-green-200/25 rounded-full filter blur-[100px] animate-drift-slow-1" />
        {/* Drift Orb 2 */}
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-orange-200/20 rounded-full filter blur-[90px] animate-drift-slow-2" />
        {/* Drift Orb 3 */}
        <div className="absolute bottom-[-10%] left-[15%] w-[50vw] h-[50vw] bg-pink-200/20 rounded-full filter blur-[110px] animate-drift-slow-3" />
        {/* Drift Orb 4 */}
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-emerald-200/20 rounded-full filter blur-[80px] animate-drift-slow-4" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column - Copy & CTA */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="lg:col-span-7 text-left space-y-6 max-w-2xl"
        >
          {/* Trust micro-badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm text-stone-700 text-xs font-semibold"
          >
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span>4.9 · Trusted by 500+ restaurants across India</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1] font-serif"
          >
            Your restaurant. <br />
            Your customers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-orange-550 to-pink-500 font-black">
              Your revenue.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-stone-600 leading-relaxed font-light font-sans max-w-xl"
          >
            Launch your branded ordering store in under 24 hours. <br className="hidden sm:block" />
            No commissions. No tech team. No compromise.
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Link
              href="/auth?mode=signup"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-base transition-all hover:scale-105 shadow-md shadow-green-600/15 flex items-center gap-2 cursor-pointer"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#platform"
              className="px-8 py-4 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/80 text-stone-850 font-bold rounded-full text-base transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-stone-700 text-stone-700" />
              Watch Demo
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column - Mockup Stack */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="lg:col-span-5 relative h-[500px] flex items-center justify-center lg:justify-end"
        >
          {/* Phone Mockup 1: Branded Store (Nordic Minimal) */}
          <motion.div
            variants={slideRight}
            className="absolute z-20 w-56 h-[380px] rounded-[30px] border border-white/40 shadow-xl bg-white/70 backdrop-blur-xl p-3 flex flex-col justify-between -rotate-[4deg] translate-x-[-110px] translate-y-[-30px] hover:rotate-0 hover:scale-105 transition-all duration-300"
          >
            {/* Top Speaker/Camera notch */}
            <div className="w-20 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-800" />
            </div>
            
            {/* Mock Screen Content */}
            <div className="flex-1 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-stone-900 tracking-wider uppercase">MALABAR CAFE</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100">
                  <Image
                    src="/images/cafe_interior.jpg"
                    alt="Malabar Cafe Interior mockup"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-[11px] font-black text-stone-950 font-serif leading-tight">Fresh Brews & Coastal Spices</h4>
                <p className="text-[9px] text-stone-500 font-light">Order freshly ground Nilgiri coffee directly to your table.</p>
              </div>

              <div className="py-2 border-t border-stone-200/60 flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-green-700">100% Zero Commission</span>
                <span className="text-[8px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold">MENU</span>
              </div>
            </div>
          </motion.div>

          {/* Phone Mockup 2: QR Table Ordering Screen */}
          <motion.div
            variants={slideRight}
            className="absolute z-30 w-56 h-[380px] rounded-[30px] border border-white/45 shadow-2xl bg-white/80 backdrop-blur-xl p-3 flex flex-col justify-between translate-x-0 translate-y-20 hover:scale-105 transition-all duration-300"
          >
            <div className="w-20 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center" />

            <div className="flex-1 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                  <ShieldCheck className="w-3 h-3" /> Secure UPI Check
                </div>
                <div className="border border-stone-200/50 p-2.5 rounded-xl space-y-2.5 bg-stone-50/40">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-stone-600">Table 05 Order</span>
                    <span className="font-black text-stone-900">₹450.00</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-500">
                    <span>1x Cappuccino</span>
                    <span>₹180</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-500">
                    <span>1x Saffron Pancake</span>
                    <span>₹270</span>
                  </div>
                </div>
                <div className="bg-stone-950 text-white rounded-xl p-2 flex items-center justify-between text-[9px] font-bold">
                  <span>Settle Bill via UPI</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
                </div>
              </div>
              <div className="text-center pb-1">
                <span className="text-[8px] text-stone-400">Powered by Razorpay</span>
              </div>
            </div>
          </motion.div>

          {/* Phone Mockup 3: WhatsApp OTP Login Screen */}
          <motion.div
            variants={slideRight}
            className="absolute z-10 w-56 h-[380px] rounded-[30px] border border-white/40 shadow-xl bg-white/70 backdrop-blur-xl p-3 flex flex-col justify-between rotate-[4deg] translate-x-[110px] translate-y-[-20px] hover:rotate-0 hover:scale-105 transition-all duration-300"
          >
            <div className="w-20 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center" />

            <div className="flex-1 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 text-lg">
                  💬
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-stone-900">WhatsApp OTP</h4>
                  <p className="text-[8px] text-stone-500">Fast customer verification. No password, no friction.</p>
                </div>

                <div className="space-y-2">
                  <div className="border border-stone-250 rounded-lg p-1.5 bg-stone-50 text-[9px] font-bold text-stone-800 flex justify-between items-center">
                    <span>+91 98765 43210</span>
                    <span className="text-green-600 text-[8px]">✓ Ready</span>
                  </div>
                  <button className="w-full py-2 bg-green-600 text-white font-bold rounded-lg text-[9px] flex items-center justify-center gap-1.5">
                    Send OTP via WhatsApp
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[8px] text-stone-400">
                <span>3x More Conversions</span>
                <span>Frictionless Login</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
