"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[100svh] flex items-end overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2D1B0E 0%, #1C1917 40%, #292524 100%)" }}
    >
      {/* Decorative food photography overlay feel */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-[var(--color-primary-500)]/8 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[25rem] h-[25rem] rounded-full bg-[var(--color-secondary-600)]/6 blur-[100px]" />
        <div className="absolute top-1/3 right-[10%] text-6xl animate-float opacity-15">☕</div>
        <div className="absolute bottom-[30%] left-[8%] text-5xl animate-float opacity-10" style={{ animationDelay: "1.5s" }}>🥐</div>
        <div className="absolute top-[55%] right-[30%] text-4xl animate-float opacity-8" style={{ animationDelay: "2.5s" }}>🌿</div>
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Content — bottom-aligned as per spec */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 pt-32">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[var(--color-primary-400)] text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            Open Now · ⭐ 4.8
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-5 text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-display font-900 text-white leading-[1.08] tracking-tight"
          style={{ textWrap: "balance" }}
        >
          Crafted with{" "}
          <span className="gradient-text-warm">passion</span>,{" "}
          served with{" "}
          <span className="italic">love</span>.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed max-w-lg"
        >
          Explore our artisanal menu of specialty coffees, gourmet dishes, and seasonal creations — freshly prepared, beautifully presented.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/items" className="btn btn-primary btn-lg group" id="hero-view-menu">
            View Menu
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/cart" className="btn btn-outline btn-lg" id="hero-order-now">
            Order Now
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="mt-12 flex gap-8 sm:gap-12"
        >
          {[
            { value: "50+", label: "Menu Items" },
            { value: "4.8", label: "Rating" },
            { value: "2K+", label: "Happy Guests" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: "swipe-hint 2s ease-in-out infinite" }}>
        <ChevronDown className="w-5 h-5 text-white/30" />
      </div>
    </section>
  );
}
