"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import GlassCard from "@/components/ui/GlassCard";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="cta"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/20 border-t border-stone-200/50"
    >
      {/* Mesh background effects for CTA card */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-green-200/20 rounded-full filter blur-[120px] animate-drift-slow-1" />
        <div className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] bg-orange-100/25 rounded-full filter blur-[100px] animate-drift-slow-3" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <GlassCard
            className="glass-cta p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center justify-center gap-8 shadow-xl"
            hoverEffect={false}
          >
            {/* Tag Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/10 border border-green-500/20 text-green-700 text-xs font-black uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" /> Take Back Control
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 leading-tight font-serif max-w-4xl"
            >
              Your restaurant deserves better <br className="hidden sm:block" />
              than a listing on someone else's platform.
            </h2>

            {/* Subhead */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-stone-600 font-sans font-light max-w-2xl"
            >
              Launch your fully branded ordering storefront on your own domain in under 24 hours. Zero commissions. No tech team required.
            </motion.p>

            {/* Actions */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 justify-center pt-2"
            >
              <Link
                href="/auth?mode=signup"
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-base transition-all hover:scale-105 shadow-md shadow-green-600/15 flex items-center gap-2 cursor-pointer"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth?mode=signup"
                className="px-8 py-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-850 font-bold rounded-full text-base transition-all hover:scale-105 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-green-600 fill-green-600/20" />
                Book a Demo
              </Link>
            </motion.div>

            {/* Trust signal footer */}
            <motion.div
              variants={fadeInUp}
              className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-4"
            >
              ★ 4.9 · Trusted by 500+ outlets across India · No Credit Card Needed
            </motion.div>

          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
