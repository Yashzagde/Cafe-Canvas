"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-350 ${
          isScrolled ? "glass-nav py-4 shadow-sm" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-stone-200 shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="CafeCanvas logo - coffee cup paint brush"
                fill
                className="object-cover group-hover:scale-105 transition"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-sans">
              Cafe<span className="text-green-600">Canvas</span>
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a href="#platform" className="hover:text-green-650 transition-colors">
              Platform
            </a>
            <a href="#industries" className="hover:text-orange-655 transition-colors">
              Industries
            </a>
            <a href="#story" className="hover:text-green-650 transition-colors">
              Our Story
            </a>
            <a href="#testimonials" className="hover:text-green-650 transition-colors">
              Stories
            </a>
          </div>

          {/* CTA Right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-bold transition shadow-sm hover:shadow-green-600/10 cursor-pointer"
            >
              Book a Demo →
            </Link>
          </div>

          {/* Hamburger Menu */}
          <button
            className="md:hidden text-stone-700 hover:text-stone-950 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Glass Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-[68px] left-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 p-6 flex flex-col gap-4 text-sm font-bold shadow-lg"
          >
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="text-stone-750 hover:text-green-600 py-2 border-b border-stone-100"
            >
              Platform
            </a>
            <a
              href="#industries"
              onClick={() => setMobileMenuOpen(false)}
              className="text-stone-750 hover:text-orange-500 py-2 border-b border-stone-100"
            >
              Industries
            </a>
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="text-stone-750 hover:text-green-600 py-2 border-b border-stone-100"
            >
              Our Story
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="text-stone-750 hover:text-green-600 py-2 border-b border-stone-100"
            >
              Stories
            </a>
            <Link
              href="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-green-600 text-white rounded-xl mt-2 font-bold cursor-pointer"
            >
              Book a Demo
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
