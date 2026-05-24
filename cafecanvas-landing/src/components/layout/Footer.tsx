"use client";

import React from "react";
import { Coffee } from "lucide-react";

const socialLinks = [
  { name: "Twitter / X", href: "#", icon: "𝕏" },
  { name: "Instagram", href: "#", icon: "📷" },
  { name: "LinkedIn", href: "#", icon: "💼" },
  { name: "WhatsApp", href: "https://wa.me/918408060787", icon: "💬" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[rgba(10,15,28,0.96)] border-t border-white/[0.06] py-12 z-10">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Coffee className="w-5 h-5 text-green-500" />
          <span className="text-lg font-semibold text-white font-sans">
            Cafe<span className="text-green-500">Canvas</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-white/40 text-sm font-sans">
          The Shopify for restaurants and cafes.
        </p>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/[0.12] transition-all duration-200 text-sm"
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.05] pt-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <p>© {new Date().getFullYear()} CafeCanvas · Made in India 🇮🇳</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="mailto:help@cafecanvas.bar" className="hover:text-white/60 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
