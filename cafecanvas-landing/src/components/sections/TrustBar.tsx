"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

const restaurants = [
  { name: "The Malabar House", city: "Kochi", icon: "🍽" },
  { name: "Brew District", city: "Bangalore", icon: "☕" },
  { name: "The Spice Route", city: "Chennai", icon: "🌶" },
  { name: "Sunset Bar & Grill", city: "Mumbai", icon: "🥂" },
  { name: "Noodle Nook", city: "Delhi", icon: "🍜" },
  { name: "Saffron Stories", city: "Hyderabad", icon: "🫖" },
  { name: "Burger Junction", city: "Pune", icon: "🍔" },
  { name: "Olive & Basil", city: "Goa", icon: "🍕" },
];

export default function TrustBar() {
  // Duplicate restaurants array to ensure seamless looping marquee
  const marqueeItems = [...restaurants, ...restaurants, ...restaurants];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeIn}
      className="relative z-20 py-8 overflow-hidden bg-white/20 backdrop-blur-sm border-y border-stone-200/50"
    >
      <div className="flex select-none overflow-hidden max-w-full">
        <div className="animate-marquee flex gap-6 items-center whitespace-nowrap">
          {marqueeItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-6 py-3 rounded-full bg-white/50 backdrop-blur-md border border-white/70 shadow-sm transition hover:shadow-md cursor-default group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="text-sm font-bold text-stone-850">
                {item.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-stone-500 font-medium">
                {item.city}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
