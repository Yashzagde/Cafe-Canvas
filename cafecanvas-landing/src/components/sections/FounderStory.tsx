"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Coffee } from "lucide-react";
import { staggerContainer, fadeInUp, slideLeft } from "@/lib/animations";

export default function FounderStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 z-10"
    >
      {/* Subtle dark overlay so bg imagery shows through softly */}
      <div className="absolute inset-0 bg-[rgba(10,15,28,0.70)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left — Founder Image */}
          <motion.div
            variants={slideLeft}
            className="relative max-w-sm mx-auto lg:mx-0"
          >
            {/* Green bokeh glow behind image */}
            <div className="absolute -z-10 top-8 left-8 w-[280px] h-[280px] bg-green-500/12 rounded-full blur-[80px]" />

            {/* Image container */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden ring-1 ring-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/images/founder.jpg"
                  alt="Yash Zagade — Founder, Cafe Canvas"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </motion.div>

            {/* Floating founder badge */}
            <div className="absolute -bottom-4 -right-4 glass-dark px-4 py-3 rounded-2xl flex items-center gap-2">
              <Coffee className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white/85 font-medium font-sans">
                Founder, Cafe Canvas
              </span>
            </div>
          </motion.div>

          {/* Right — Narrative */}
          <motion.div variants={fadeInUp} className="space-y-6 relative">
            {/* Label */}
            <span className="text-xs text-green-400 uppercase tracking-[0.2em] font-bold font-sans">
              Founder{"'"}s Note
            </span>

            {/* Large decorative open-quote */}
            <svg
              className="w-16 h-16 text-green-500/60 -mb-4"
              viewBox="0 0 48 48"
              fill="currentColor"
            >
              <path d="M12 34c-2.2 0-4-0.8-5.4-2.4C5.2 30 4.4 28 4.4 25.6c0-3.6 1-6.8 3-9.6 2-2.8 5-5.2 9-7.2l2.4 3.6c-2.8 1.6-4.8 3.2-6 4.8-1.2 1.6-1.8 3.4-1.8 5.4 0.4-0.4 1.2-0.6 2.4-0.6 1.6 0 3 0.6 4 1.8 1 1.2 1.6 2.6 1.6 4.4 0 1.8-0.6 3.2-1.8 4.4C16 33.4 14.2 34 12 34zm22 0c-2.2 0-4-0.8-5.4-2.4-1.4-1.6-2.2-3.6-2.2-6 0-3.6 1-6.8 3-9.6 2-2.8 5-5.2 9-7.2l2.4 3.6c-2.8 1.6-4.8 3.2-6 4.8-1.2 1.6-1.8 3.4-1.8 5.4 0.4-0.4 1.2-0.6 2.4-0.6 1.6 0 3 0.6 4 1.8 1 1.2 1.6 2.6 1.6 4.4 0 1.8-0.6 3.2-1.8 4.4C38 33.4 36.2 34 34 34z" />
            </svg>

            {/* Narrative text */}
            <div className="space-y-5 text-lg md:text-xl text-white/[0.88] font-serif italic leading-[1.75] max-w-lg">
              <p>
                I{"'"}ve sat across the table from restaurant owners who{"'"}ve been
                running their families{"'"} food for 20 years — only to watch a
                platform take 30 rupees of every 100 they earn.
              </p>
              <p className="text-white/60 not-italic font-sans text-base font-medium">
                That{"'"}s not a technology problem. That{"'"}s a power problem.
              </p>
              <p>
                Cafe Canvas gives that power back. Your store. Your customers.
                Your data. No middleman. No commission tax. No compromise.
              </p>
              <p>
                We{"'"}re not building another food app. We{"'"}re building the
                infrastructure that makes every restaurant owner as powerful as
                their food deserves.
              </p>
            </div>

            {/* Founder attribution */}
            <div className="pt-4">
              <p className="text-base font-semibold text-white font-sans">
                — Yash Zagade, Founder & CEO
              </p>
              <div className="w-12 h-0.5 bg-green-500 mt-3" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
