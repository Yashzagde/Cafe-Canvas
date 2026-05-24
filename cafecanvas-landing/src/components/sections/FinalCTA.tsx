"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import GlassCard from "@/components/ui/GlassCard";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="cta"
      className="relative py-24 md:py-32 overflow-hidden z-10"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <GlassCard
            className="glass-dark p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center justify-center gap-8 shadow-2xl"
            hoverEffect={false}
          >
            {/* Ambient glows behind the card content */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
              <div className="absolute top-[20%] left-[20%] w-[250px] h-[250px] bg-green-500/10 rounded-full filter blur-[60px]" />
              <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] bg-orange-500/10 rounded-full filter blur-[60px]" />
            </div>

            <div className="relative z-10 space-y-6 flex flex-col items-center">
              {/* Tag Badge */}
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" /> Be First to Go Live
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-serif max-w-2xl"
              >
                Your restaurant deserves its own brand.
              </motion.h2>

              {/* Subhead */}
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-white/70 font-sans font-light max-w-xl"
              >
                Launch your fully branded storefront on your custom domain. Keep 100% of your customer relationships and revenue.
              </motion.p>

              {/* Actions */}
              <motion.div
                variants={fadeInUp}
                className="pt-4"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-base transition-all hover:shadow-lg hover:shadow-green-900/30 hover:-translate-y-0.5 shadow-md shadow-green-600/15 cursor-pointer"
                >
                  Pre-register Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* Trust signal footer */}
              <motion.div
                variants={fadeInUp}
                className="text-[10px] text-white/40 font-semibold uppercase tracking-wider pt-2"
              >
                ★ 4.9 · Joining 500+ Indian outlets · No credit card required
              </motion.div>
            </div>

          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
