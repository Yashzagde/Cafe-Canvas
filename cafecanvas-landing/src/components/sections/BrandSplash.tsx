"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BrandSplashProps {
  onComplete: () => void;
}

// Floating particles for the reveal
function Particles() {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 50 + Math.random() * 30,
    size: Math.random() * 4 + 1.5,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 4 === 0
                ? "rgba(34, 197, 94, 0.7)"
                : p.id % 4 === 1
                ? "rgba(249, 115, 22, 0.6)"
                : p.id % 4 === 2
                ? "rgba(14, 165, 165, 0.5)"
                : "rgba(255, 255, 255, 0.35)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.8, 0],
            y: [0, -80 - Math.random() * 60],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: p.duration,
            delay: 0.8 + p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function BrandSplash({ onComplete }: BrandSplashProps) {
  const [phase, setPhase] = useState<"reveal" | "exit">("reveal");

  useEffect(() => {
    // Exit transition starts at 4.2s
    const exitTimer = setTimeout(() => setPhase("exit"), 4200);
    // Complete at 5s
    const completeTimer = setTimeout(() => onComplete(), 5000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0F1C] overflow-hidden"
          exit={{
            opacity: 0,
            scale: 1.15,
            transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          {/* Ambient background glows */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.2 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/[0.06] rounded-full blur-[150px]" />
            <div className="absolute top-[38%] left-[58%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/[0.05] rounded-full blur-[120px]" />
            <div className="absolute top-[58%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-600/[0.04] rounded-full blur-[100px]" />
          </motion.div>

          {/* Particles */}
          <Particles />

          {/* Radial light burst behind logo */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.2, 0.1], scale: [0.4, 1.3, 1.1] }}
            transition={{ duration: 3, delay: 0.3, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(249,115,22,0.05) 35%, transparent 70%)",
            }}
          />

          {/* Rotating orbit rings */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full border border-white/[0.04]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 1, delay: 0.5 },
              scale: { duration: 1, delay: 0.5 },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[620px] sm:h-[620px] rounded-full border border-green-500/[0.06]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: -360 }}
            transition={{
              opacity: { duration: 1, delay: 0.7 },
              scale: { duration: 1, delay: 0.7 },
              rotate: { duration: 35, repeat: Infinity, ease: "linear" },
            }}
          />

          {/* Main Logo — the hero of the splash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 1.4,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10"
          >
            {/* Logo glow pulse */}
            <motion.div
              className="absolute inset-0 -z-10"
              animate={{
                opacity: [0, 0.6, 0.3],
                scale: [0.8, 1.1, 1],
              }}
              transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[60px]" />
            </motion.div>

            {/* The full logo image (with text included in the image) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px] relative"
            >
              <Image
                src="/images/logo-full.png"
                alt="Cafe Canvas — Coffee · Creativity · Community"
                fill
                className="object-contain mix-blend-screen brightness-110"
                priority
                sizes="(min-width: 1024px) 520px, (min-width: 768px) 450px, (min-width: 640px) 380px, 280px"
              />
            </motion.div>
          </motion.div>

          {/* Bottom gradient loading bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-green-500 via-teal-400 to-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.2, ease: "easeInOut" }}
          />

          {/* Bottom text hint */}
          <motion.p
            className="absolute bottom-6 text-[10px] tracking-[0.3em] uppercase text-white/20 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            The Shopify for Restaurants & Cafes
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
