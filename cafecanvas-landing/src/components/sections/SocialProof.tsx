"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import CounterNumber from "@/components/ui/CounterNumber";
import GlassCard from "@/components/ui/GlassCard";

const stats = [
  {
    target: 500,
    suffix: "+",
    label: "Restaurants",
    sublabel: "on Platform",
  },
  {
    target: 2,
    prefix: "₹",
    suffix: "Cr+",
    label: "Orders Monthly",
    sublabel: "Processed",
  },
  {
    target: 3.2,
    decimals: 1,
    suffix: "x",
    label: "Avg Revenue",
    sublabel: "Increase",
  },
  {
    target: 24,
    suffix: " hrs",
    label: "Go-Live Time",
    sublabel: "Setup Duration",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="stats"
      className="relative py-16 md:py-24 overflow-hidden bg-stone-50/20 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <GlassCard className="p-10 md:p-14 text-center grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 hover:shadow-[0_20px_60px_rgba(22,163,74,0.05)] hover:border-green-200/30">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="space-y-2 flex flex-col justify-center items-center"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 font-sans tracking-tight">
                  <CounterNumber
                    target={stat.target}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-650"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-stone-850 font-sans">
                    {stat.label}
                  </p>
                  <p className="text-xs text-stone-500 font-light">
                    {stat.sublabel}
                  </p>
                </div>
              </motion.div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
