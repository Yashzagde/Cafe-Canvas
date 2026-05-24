"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import GlassCard from "@/components/ui/GlassCard";

export default function RestaurantImage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="restaurant-showcase"
      className="relative w-full h-[540px] md:h-[600px] overflow-hidden border-y border-stone-200/50 bg-stone-150"
    >
      {/* Ken Burns zooming container */}
      <motion.div
        animate={isInView ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="/images/restaurant_fine_dining.png"
          alt="Premium restaurant running Cafe Canvas digital ordering store"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-stone-950/20" />
      </motion.div>

      {/* Floating Glass Pull-quote Card */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex items-end justify-start pb-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.75, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <GlassCard
            className="p-8 bg-white/75 backdrop-blur-[20px] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-6"
            hoverEffect={false}
          >
            {/* Tag Pills row */}
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/15 text-green-700 text-[10px] font-black uppercase tracking-wider">
                Real Customer
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-655 text-[10px] font-black uppercase tracking-wider">
                QR Table Ordering
              </span>
              <span className="px-3 py-1 rounded-full bg-stone-900/10 border border-stone-900/15 text-stone-750 text-[10px] font-black uppercase tracking-wider">
                ₹0 Commission
              </span>
            </div>

            {/* Quote details */}
            <div className="relative pl-6 space-y-4">
              <Quote className="absolute top-0 left-0 w-4 h-4 text-green-600 rotate-180 opacity-50" />
              <blockquote className="text-stone-850 font-serif italic text-base leading-relaxed pl-1">
                "We were paying aggregators over ₹40,000 every month in hard commissions. Switching to Cafe Canvas put that money straight back into our registers. Our clients scanned, ordered, and paid instantly via UPI."
              </blockquote>
              <div>
                <cite className="not-italic font-bold text-xs text-stone-900 block">
                  Priya Nair
                </cite>
                <span className="text-[10px] text-stone-500 font-light">
                  Managing Partner, The Malabar House, Kochi
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
