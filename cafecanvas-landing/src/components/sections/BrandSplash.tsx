"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BrandSplashProps {
  onComplete: () => void;
}

// Particle system for the reveal
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 2,
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
              p.id % 3 === 0
                ? "rgba(34, 197, 94, 0.6)"
                : p.id % 3 === 1
                ? "rgba(249, 115, 22, 0.5)"
                : "rgba(255, 255, 255, 0.3)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [0, -60 - Math.random() * 40],
          }}
          transition={{
            duration: p.duration,
            delay: 1.2 + p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function BrandSplash({ onComplete }: BrandSplashProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    // Phase 1: Logo appears (0-1.5s)
    // Phase 2: Text reveals (1.5s-3.5s)
    const textTimer = setTimeout(() => setPhase("text"), 1200);
    // Phase 3: Exit transition (4s)
    const exitTimer = setTimeout(() => setPhase("exit"), 4000);
    // Complete (4.8s)
    const completeTimer = setTimeout(() => onComplete(), 4800);

    return () => {
      clearTimeout(textTimer);
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
            scale: 1.1,
            transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          {/* Ambient background glows */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
          >
            {/* Center green glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/[0.08] rounded-full blur-[120px]" />
            {/* Orange accent glow */}
            <div className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-orange-500/[0.06] rounded-full blur-[100px]" />
            {/* Teal accent */}
            <div className="absolute top-[55%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-teal-500/[0.05] rounded-full blur-[80px]" />
          </motion.div>

          {/* Particles */}
          <Particles />

          {/* Radial light burst behind logo */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.15, 0.08], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 30%, transparent 70%)",
            }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Logo Image — dramatic scale in */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 1.2,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] lg:w-[400px] lg:h-[400px]"
            >
              {/* Rotating ring behind logo */}
              <motion.div
                className="absolute inset-[-20px] rounded-full border border-white/[0.06]"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-[-40px] rounded-full border border-green-500/[0.08]"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Logo with glow pulse */}
              <motion.div
                className="relative w-full h-full"
                animate={{
                  filter: [
                    "drop-shadow(0 0 0px rgba(34,197,94,0))",
                    "drop-shadow(0 0 30px rgba(34,197,94,0.3))",
                    "drop-shadow(0 0 15px rgba(34,197,94,0.15))",
                  ],
                }}
                transition={{
                  duration: 2,
                  delay: 0.8,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/images/logo-dark.png"
                  alt="Cafe Canvas"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Brand Name — appears after logo */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={phase === "text" ? { opacity: 1 } : {}}
            >
              {/* CAFE CANVAS text */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] text-white font-sans"
                initial={{ opacity: 0, y: 20, letterSpacing: "0.4em" }}
                animate={
                  phase === "text"
                    ? { opacity: 1, y: 0, letterSpacing: "0.15em" }
                    : {}
                }
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                CAFE{" "}
                <span className="text-green-500">CANVAS</span>
              </motion.h1>

              {/* Tagline with line reveal */}
              <motion.div
                className="flex items-center justify-center gap-3 mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  phase === "text" ? { opacity: 1, y: 0 } : {}
                }
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  className="h-[1px] bg-gradient-to-r from-transparent to-white/30"
                  initial={{ width: 0 }}
                  animate={phase === "text" ? { width: 40 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
                <span className="text-[11px] sm:text-xs tracking-[0.3em] text-white/50 font-medium uppercase">
                  Coffee • Creativity • Community
                </span>
                <motion.div
                  className="h-[1px] bg-gradient-to-l from-transparent to-white/30"
                  initial={{ width: 0 }}
                  animate={phase === "text" ? { width: 40 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom loading line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-green-500 via-teal-400 to-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
