"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";

const themes = [
  {
    name: "Nordic Minimal",
    tagline: "Clean whites & slate typography",
    cuisine: "Coffee & Brunch",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200/80",
    accentClass: "text-slate-800",
    fontClass: "font-sans",
    image: "/images/cafe_interior.jpg",
    details: "Light backgrounds, high contrast, elegant letter-spacing.",
  },
  {
    name: "Ethnic Gold",
    tagline: "Serif headers & gold details",
    cuisine: "Mughlai & Fine Dine",
    bgClass: "bg-[#1C100B]",
    borderClass: "border-amber-500/30",
    accentClass: "text-amber-400",
    fontClass: "font-serif",
    image: "/images/restaurant_fine_dining.png",
    details: "Deep royal shades, serif titles, gold call-to-actions.",
  },
  {
    name: "Indian Vibrant",
    tagline: "Turmeric & coral spice contrast",
    cuisine: "Indian Regional",
    bgClass: "bg-amber-50/60",
    borderClass: "border-orange-200",
    accentClass: "text-orange-600",
    fontClass: "font-sans",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    details: "Bright warm colors, rounded buttons, playful visuals.",
  },
  {
    name: "Dark Luxe",
    tagline: "Obsidian canvas & amber glow",
    cuisine: "Cocktail Lounges",
    bgClass: "bg-[#09090B]",
    borderClass: "border-stone-800",
    accentClass: "text-amber-500",
    fontClass: "font-sans",
    image: "/images/bar_interior.jpg",
    details: "Ultra-dark, glowing borders, high-end photography focus.",
  },
  {
    name: "Coastal Fresh",
    tagline: "Seafoam blue & clean lines",
    cuisine: "Seafood & Cafes",
    bgClass: "bg-cyan-50/50",
    borderClass: "border-cyan-150",
    accentClass: "text-cyan-600",
    fontClass: "font-sans",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80",
    details: "Soft teal palettes, round borders, breezy atmosphere.",
  },
  {
    name: "Modern Bistro",
    tagline: "Charcoal gray & clean alignment",
    cuisine: "Italian & Pizzeria",
    bgClass: "bg-stone-900",
    borderClass: "border-stone-800",
    accentClass: "text-stone-100",
    fontClass: "font-sans",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    details: "Clean structure, sleek modern layouts, medium serif accents.",
  },
];

export default function ThemeShowcase() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={containerRef}
      id="themes-showcase"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/40 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-12"
        >
          <SectionHeading
            tag="Style Catalog"
            title="52 premium themes. One is yours."
            subtitle="From Nordic minimal to Mughal gold — every single theme is a complete, white-labeled restaurant digital brand identity, not just a color change."
          />

          {/* Slider Container */}
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-none -mx-6 px-6">
            {themes.map((theme, idx) => (
              <div
                key={idx}
                className="w-72 sm:w-80 shrink-0 snap-start flex flex-col"
              >
                <GlassCard className="p-4 flex-1 flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
                  {/* Phone Mockup Frame */}
                  <div
                    className={`relative aspect-[9/16] w-full rounded-2xl overflow-hidden border ${theme.borderClass} ${theme.bgClass} p-2 flex flex-col justify-between`}
                  >
                    {/* Top Speaker Speaker/Camera notch */}
                    <div className="w-16 h-3 bg-stone-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-stone-850" />
                    </div>

                    {/* Styled Mockup Screen */}
                    <div className="flex-1 flex flex-col justify-between text-left p-1 text-xs select-none">
                      <div className="space-y-2">
                        {/* Mock Brand Header */}
                        <div className="flex justify-between items-center border-b border-stone-200/10 pb-1.5">
                          <span
                            className={`font-black tracking-wider uppercase text-[8px] ${
                              theme.bgClass.includes("bg-[#") ||
                              theme.bgClass.includes("bg-stone-9")
                                ? "text-stone-200"
                                : "text-stone-800"
                            } ${theme.fontClass}`}
                          >
                            {theme.name}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>

                        {/* Mock Hero Image */}
                        <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-stone-800/20">
                          <Image
                            src={theme.image}
                            alt={`${theme.name} layout preview`}
                            fill
                            className="object-cover group-hover:scale-102 transition duration-500"
                            unoptimized={theme.image.startsWith("http")}
                          />
                        </div>

                        {/* Mock Menu Headline */}
                        <h4
                          className={`text-[10px] font-black leading-tight ${
                            theme.bgClass.includes("bg-[#") ||
                            theme.bgClass.includes("bg-stone-9")
                              ? "text-white"
                              : "text-stone-950"
                          } ${theme.fontClass}`}
                        >
                          {theme.tagline}
                        </h4>

                        {/* Mini-details */}
                        <p className="text-[7.5px] text-stone-500 leading-normal font-light">
                          {theme.details}
                        </p>
                      </div>

                      {/* Mock Footer button */}
                      <div className="border-t border-stone-250/20 pt-1.5 mt-2 flex justify-between items-center text-[7.5px] font-bold text-stone-400">
                        <span>{theme.cuisine}</span>
                        <div
                          className={`px-2 py-0.5 rounded-full bg-white/10 border border-white/20 uppercase tracking-widest ${theme.accentClass}`}
                        >
                          Order
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Info under mockup */}
                  <div className="mt-4 text-left space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-stone-900">
                        {theme.name}
                      </span>
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-bold">
                        {theme.cuisine}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light">
                      {theme.tagline}
                    </p>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* Carousel footer CTA */}
          <div className="text-center pt-4">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2 group text-green-600 hover:text-green-700 font-bold transition-all text-sm cursor-pointer"
            >
              <span>Explore All 52 Live Themes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
