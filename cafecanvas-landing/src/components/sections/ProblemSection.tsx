"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const problems = [
  {
    icon: "📉",
    title: "Commission Drain",
    stat: "₹30 out of every ₹100",
    description:
      "Aggregators take 20–30% on every order you earn. That's ₹3–9L/year gone down the drain for an average mid-size restaurant.",
  },
  {
    icon: "🔒",
    title: "No Customer Ownership",
    stat: "They own the list. Not you.",
    description:
      "Zomato and Swiggy keep customer details hidden. You can't reach your diners directly, launch custom campaigns, or drive organic repeat orders.",
  },
  {
    icon: "🎭",
    title: "Loss of Brand Identity",
    stat: "You look like everyone else.",
    description:
      "A simple listing on an aggregator app is not a brand. You deserve a digital storefront that looks and feels authentic to your restaurant's soul.",
  },
];

export default function ProblemSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={containerRef}
      id="problems"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/40 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <SectionHeading
            tag="The Threat"
            title="The aggregator trap is costing you more than you think."
            subtitle="Middlemen cut your profits, hijack your customer relationships, and control your restaurant's digital face. There is a better way."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((prob, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <GlassCard className="p-8 h-full flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(239,68,68,0.06)] hover:border-red-200/50">
                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 select-none">
                      {prob.icon}
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-widest font-black text-red-500/80">
                        {prob.title}
                      </span>
                      <h3 className="text-xl font-bold text-stone-900 leading-snug">
                        {prob.stat}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">
                      {prob.description}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
