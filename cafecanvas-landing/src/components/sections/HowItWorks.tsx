"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    desc: "Create your account. Tell us your restaurant name, location, and cuisine footprint in minutes.",
    color: "from-green-400 to-green-600",
    shadow: "shadow-green-500/10",
  },
  {
    number: "02",
    title: "Pick a Theme",
    desc: "Select from 52 premium layout styles. Instant live preview with your branding colors.",
    color: "from-orange-400 to-orange-600",
    shadow: "shadow-orange-500/10",
  },
  {
    number: "03",
    title: "Load Your Menu",
    desc: "Upload your dishes, prices, and high-quality food shots. Takes less than 20 minutes.",
    color: "from-pink-400 to-pink-600",
    shadow: "shadow-pink-500/10",
  },
  {
    number: "04",
    title: "Go Live",
    desc: "Share your brand QR tables codes, direct orders web link, and start earning instantly with zero commission.",
    color: "from-emerald-400 to-emerald-600",
    shadow: "shadow-emerald-500/10",
    isFinal: true,
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function HowItWorks() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  // Custom confetti burst for Step 4
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (isInView) {
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 220, // horizontal spread
        y: -Math.random() * 160 - 60,   // vertical shoot
        color: ["#16A34A", "#F97316", "#3B82F6", "#EC4899", "#EAB308", "#10B981"][
          Math.floor(Math.random() * 6)
        ],
        size: Math.random() * 7 + 4,
      }));
      setParticles(newParticles);
    }
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/40 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <SectionHeading
            tag="Process"
            title="From signup to first order in under 24 hours."
            subtitle="Follow four straightforward steps to digitize your restaurant operations and eliminate middleman aggregators."
          />

          <div className="relative grid md:grid-cols-4 gap-8 md:gap-6 mt-16">
            
            {/* Desktop SVG Connecting Line */}
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] z-0 pointer-events-none">
              <svg className="w-full h-full" fill="none">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="rgba(22, 163, 74, 0.15)"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                />
              </svg>
            </div>

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Number Medallion */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${step.color} ${step.shadow} flex items-center justify-center font-bold text-white text-xl shadow-md border border-white/20 select-none mb-6 relative z-10`}
                >
                  {step.number}
                </div>

                {/* Glass card content */}
                <GlassCard className="p-6 flex-1 w-full relative">
                  <h3 className="text-lg font-bold text-stone-900 mb-3 font-sans">
                    {step.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    {step.desc}
                  </p>

                  {/* Confetti Explosion on Step 4 */}
                  {step.isFinal && particles.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {particles.map((p) => (
                        <motion.div
                          key={p.id}
                          className="absolute rounded-full"
                          style={{
                            backgroundColor: p.color,
                            width: p.size,
                            height: p.size,
                            top: "30%",
                            left: "50%",
                          }}
                          animate={{
                            x: p.x,
                            y: p.y,
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.2, 1, 0.4],
                          }}
                          transition={{
                            duration: 1.8,
                            ease: "easeOut",
                            delay: 0.6,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
