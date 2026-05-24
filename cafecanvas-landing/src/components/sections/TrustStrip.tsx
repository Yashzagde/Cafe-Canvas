"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import CounterNumber from "@/components/ui/CounterNumber";
import MarqueeTicker from "@/components/ui/MarqueeTicker";

const stats = [
  { value: 500, suffix: "+", label: "Restaurants on Waitlist" },
  { value: 2, prefix: "₹", suffix: "Cr+", label: "Orders Monthly", decimals: 0 },
  { value: 24, suffix: " hrs", label: "Go-Live Time" },
  { value: 0, prefix: "₹", suffix: "", label: "Commission Per Order" },
];

export default function TrustStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      ref={ref}
      className="relative py-12 z-10 bg-[rgba(10,15,28,0.82)]"
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="glass-dark p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
                <CounterNumber
                  target={stat.value}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-sans font-medium mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scrolling ticker */}
        <MarqueeTicker />
      </div>
    </section>
  );
}
