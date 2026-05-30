"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Minus, Star } from "lucide-react";
import useCartStore from "@/stores/cartStore";
import { formatPrice, getItemEmoji } from "@/utils/api";
import { useState } from "react";
import Toast from "@/components/ui/Toast";

export default function FeaturedItems({ items = [] }) {
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const getItemQty = useCartStore((s) => s.getItemQty);
  const [toast, setToast] = useState(null);
  const featured = items.slice(0, 8);

  const handleAdd = (item, e) => {
    e.preventDefault(); e.stopPropagation();
    addItem({ id: item.id, name: item.name, price: item.price, image: item.imageUrl, quantity: 1 });
    setToast({ message: `${item.name} added!`, type: "cart" });
  };

  return (
    <section id="featured" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)] mb-1 block">⭐ Fan Favourites</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Famous Items</h2>
          </div>
          <Link href="/items" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] group" id="featured-see-all">
            See All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((item, i) => {
            const inCart = isInCart(item.id);
            const qty = getItemQty(item.id);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/item/${item.id}`} className="card group" id={`featured-${item.id}`}>
                  <div className="img-cover aspect-square bg-gradient-to-br from-[var(--color-surface-warm)] to-[var(--color-border-light)] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-25 group-hover:scale-110 transition-transform duration-500">{getItemEmoji(item.name)}</span>
                    </div>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="absolute inset-0" loading="lazy" />}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {i < 3 && <span className="badge badge-bestseller text-[10px]">⭐ Bestseller</span>}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`w-4 h-4 rounded-full border-2 inline-block ${item.isVeg !== false ? "border-[var(--color-veg)] bg-[var(--color-veg)]/20" : "border-[var(--color-nonveg)] bg-[var(--color-nonveg)]/20"}`} />
                    </div>
                    {/* Rating */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />{(4 + Math.random() * 0.9).toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-[13px] text-[var(--color-text)] group-hover:text-[var(--color-primary-700)] transition-colors leading-tight truncate">{item.name}</h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="price text-base">{formatPrice(item.price)}</span>
                      {!inCart ? (
                        <button onClick={(e) => handleAdd(item, e)} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow active:scale-90 transition-transform" aria-label="Add" id={`add-${item.id}`}>
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-[var(--color-primary-700)] bg-[var(--color-primary-100)] px-2 py-0.5 rounded-full">{qty} in cart</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/items" className="btn btn-secondary" id="featured-see-all-m">See Full Menu <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
