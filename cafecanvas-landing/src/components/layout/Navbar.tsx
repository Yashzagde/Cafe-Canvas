"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar only after scrolling past the main hero area (300px)
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed top-0 w-full z-50 glass-dark-nav-scrolled py-3"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-end">
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
      )}
    </AnimatePresence>
  );
}
