"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Coffee, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "glass-dark-nav-scrolled py-3" : "glass-dark-nav py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo with small icon */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 relative">
            <Image
              src="/images/logo-dark.png"
              alt="Cafe Canvas"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            Cafe<span className="text-green-500">Canvas</span>
          </span>
        </div>

        {/* Single CTA */}
        <a
          href="#preregister"
          className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-green-900/30 hover:shadow-green-800/40 hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
        >
          Pre-register Now
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.nav>
  );
}
