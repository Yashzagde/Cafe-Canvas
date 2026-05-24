"use client";

import React from "react";

const restaurants = [
  { name: "Brew District", city: "Bangalore", icon: "☕" },
  { name: "The Malabar House", city: "Kochi", icon: "🍽" },
  { name: "The Spice Route", city: "Chennai", icon: "🌶" },
  { name: "Sunset Bar & Grill", city: "Mumbai", icon: "🥂" },
  { name: "Noodle Nook", city: "Delhi", icon: "🍜" },
  { name: "Saffron Stories", city: "Hyderabad", icon: "🫖" },
  { name: "Burger Junction", city: "Pune", icon: "🍔" },
  { name: "Olive & Basil", city: "Goa", icon: "🍕" },
  { name: "Chai Point", city: "Indore", icon: "🍵" },
  { name: "The Biryani Co.", city: "Lucknow", icon: "🍛" },
];

export default function MarqueeTicker() {
  const items = [...restaurants, ...restaurants, ...restaurants];

  return (
    <div className="overflow-hidden select-none mt-8">
      <div className="animate-marquee flex gap-4 items-center whitespace-nowrap">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.15] transition hover:bg-white/[0.12] cursor-default"
          >
            <span className="text-sm">{item.icon}</span>
            <span className="text-xs font-medium text-white/70">{item.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-white/40 font-medium">{item.city}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
