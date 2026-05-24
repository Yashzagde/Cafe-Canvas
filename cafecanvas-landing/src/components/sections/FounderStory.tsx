"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { slideRight, fadeInUp, staggerContainer } from "@/lib/animations";
import GlassCard from "@/components/ui/GlassCard";

export default function FounderStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="founder-story"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/20 border-t border-stone-200/50"
    >
      {/* Subtle green bokeh glow behind founder image */}
      <div className="absolute top-[20%] left-[-5%] w-[35vw] h-[35vw] bg-green-200/15 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          {/* Left Column: Image in Glass Frame */}
          <motion.div
            variants={slideRight}
            className="md:col-span-5 relative flex justify-center"
          >
            <div className="relative p-3.5 bg-white/45 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl max-w-sm w-full group transition-all duration-300 hover:scale-[1.02]">
              <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-stone-100">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=750&auto=format&fit=crop"
                  alt="Yash Zagade - Founder, Cafe Canvas"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  unoptimized={true}
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-6 right-6">
                <GlassCard
                  className="px-4 py-2 bg-white/80 backdrop-blur-md border border-white/60 shadow-md text-[10px] font-black text-green-700 uppercase tracking-widest"
                  hoverEffect={false}
                >
                  Founder, Cafe Canvas
                </GlassCard>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-7 space-y-6 text-left relative"
          >
            {/* Background quote mark */}
            <Quote className="absolute top-[-30px] left-[-20px] w-24 h-24 text-green-200/40 pointer-events-none -scale-y-100 select-none" />

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200/50 uppercase tracking-wider">
              Our Vision
            </span>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight font-serif">
              Built by someone who sat on your side of the counter.
            </h2>

            <div className="space-y-5 text-stone-700 font-serif italic text-base md:text-lg leading-relaxed pt-2 pl-4 border-l-2 border-green-500/30">
              <p>
                "I've watched restaurant owners pour their soul into their food, only to hand 30% of every single rupee to an aggregator app they have absolutely no control over."
              </p>
              <p>
                "I watched them watch customers leave through a platform — customers who had been dining with them for years — and have no way to reach out, invite them back, or say thank you."
              </p>
              <p className="font-bold text-stone-850 not-italic font-sans text-sm uppercase tracking-wider text-green-600">
                That felt wrong.
              </p>
              <p>
                "Cafe Canvas exists so that every restaurant owner — whether you run a 3-table chai shop in Pune or a 15-branch QSR chain in Mumbai — has access to the exact same enterprise digital power that global fast food giants do."
              </p>
              <p className="font-bold text-stone-900 not-italic font-sans">
                Your food. Your brand. Your customers. Your revenue.
              </p>
            </div>

            <div className="pt-4">
              <div className="font-bold text-stone-900 font-sans text-base">
                Yash Zagade
              </div>
              <div className="text-xs text-stone-500 font-light font-sans mt-0.5">
                Founder, Cafe Canvas · +91 8408060787
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
