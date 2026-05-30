"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Coffee, Leaf, GlassWater, Egg, Sandwich, CakeSlice, Soup, Cherry } from "lucide-react";

const ICONS = { "Signature Coffee": Coffee, "Specialty Tea": Leaf, "Fresh Juices": GlassWater, "Breakfast": Egg, "Sandwiches": Sandwich, "Desserts": CakeSlice, "Pasta & Bowls": Soup, "Smoothies": Cherry };
const COLORS = ["from-amber-400 to-orange-500","from-emerald-400 to-teal-500","from-yellow-400 to-amber-500","from-rose-400 to-pink-500","from-sky-400 to-blue-500","from-violet-400 to-purple-500","from-lime-400 to-green-500","from-fuchsia-400 to-pink-500"];

export default function Categories({ categories = [], loading = false }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });

  if (loading) return (
    <section className="py-12 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="skeleton w-40 h-6 mb-6" />
        <div className="flex gap-4 overflow-hidden">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton w-28 h-28 rounded-2xl flex-shrink-0" />)}</div>
      </div>
    </section>
  );

  return (
    <section id="categories" className="py-14 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)] mb-1 block">Explore</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Browse by Category</h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll("left")} className="btn btn-icon btn-secondary" aria-label="Scroll left"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => scroll("right")} className="btn btn-icon btn-secondary" aria-label="Scroll right"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div ref={ref} className="flex gap-5 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat.name] || Coffee;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/items?category=${cat.id}`} className="flex-shrink-0 snap-start group text-center w-28 sm:w-32" id={`cat-${cat.id}`}>
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 group-hover:-translate-y-1`}>
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
                  </div>
                  <p className="mt-2.5 text-sm font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-700)] transition-colors leading-tight">{cat.name}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
