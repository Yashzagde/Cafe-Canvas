"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const [showScrollCue, setShowScrollCue] = useState(false);
  const [hideScrollCue, setHideScrollCue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowScrollCue(true), 2500);
    const handleScroll = () => {
      if (window.scrollY > 20) setHideScrollCue(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-12 z-10">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Animated CafeCanvas Logo Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto mb-8 relative"
        >
          {/* Logo glow effect */}
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-orange-500/10 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-green-500/8 rounded-full blur-[60px]" />
          </motion.div>

          {/* Logo Image */}
          <motion.div
            whileHover={{ scale: 1.03, rotate: -1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] mx-auto relative"
          >
            <Image
              src="/images/logo-banner.png"
              alt="Cafe Canvas — Coffee · Creativity · Community"
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="(min-width: 768px) 320px, (min-width: 640px) 280px, 220px"
            />
          </motion.div>
        </motion.div>

        {/* Coming-soon pill badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-medium text-white/70 tracking-widest uppercase mb-8"
        >
          <span className="text-green-400">✦</span>
          Coming Soon · Pre-register for Early Access
        </motion.div>

        {/* H1 — Staggered fadeUp */}
        <div className="space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif"
          >
            Your restaurant.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif"
          >
            Your customers.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif"
          >
            Your revenue.
          </motion.p>
        </div>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-base sm:text-lg md:text-xl text-white/70 max-w-xl mx-auto mt-6 leading-relaxed font-sans font-light"
        >
          The first platform built to give Indian restaurants a fully branded
          online store — with zero commission, zero tech team, and everything
          you need to grow.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10"
        >
          <a
            href="#preregister"
            className="inline-flex items-center gap-2 px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold text-base md:text-lg rounded-full shadow-2xl shadow-green-900/40 hover:shadow-green-800/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            Pre-register Now — Be First to Go Live
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Micro trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.7 }}
          className="mt-4 text-sm text-white/40 font-sans"
        >
          No credit card · Takes 30 seconds · Join 500+ restaurants on the
          waitlist
        </motion.p>
      </div>

      {/* Scroll Cue */}
      <AnimatePresence>
        {showScrollCue && !hideScrollCue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          >
            <ChevronDown className="w-5 h-5 animate-bounce-slow" />
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Scroll to explore
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
