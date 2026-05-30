"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Coffee } from "lucide-react";
import useCartStore from "@/stores/cartStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/items", label: "Menu" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <motion.nav
        id="main-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass py-2" : "bg-transparent py-3"
        }`}
        style={{ height: scrolled ? 56 : 64 }}
      >
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className={`font-display font-bold text-lg tracking-tight transition-colors ${
              scrolled ? "text-[var(--color-text)]" : "text-white"
            }`}>
              Cafe Canvas
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} id={`nav-${link.label.toLowerCase()}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scrolled
                    ? "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >{link.label}</Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link href="/cart" id="nav-cart"
              className={`relative btn-icon flex items-center justify-center transition-all ${
                scrolled ? "text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]" : "text-white hover:bg-white/10"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="cart-count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-error)] text-white text-[10px] font-bold flex items-center justify-center shadow-md"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button id="nav-mobile-toggle"
              className={`md:hidden btn-icon flex items-center justify-center transition-all ${
                scrolled ? "text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" id="mobile-menu">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 w-72 h-full bg-white shadow-float"
            >
              <div className="pt-20 px-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-warm)] transition-colors"
                  >{link.label}</Link>
                ))}
                <hr className="my-2 border-[var(--color-border-light)]" />
                <Link href="/cart" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-warm)] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> Cart
                  {itemCount > 0 && <span className="ml-auto badge badge-primary">{itemCount}</span>}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
