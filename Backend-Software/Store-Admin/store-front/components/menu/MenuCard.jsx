"use client";

import Link from "next/link";
import { Plus, Minus, Star, Heart } from "lucide-react";
import useCartStore from "@/stores/cartStore";
import { formatPrice } from "@/utils/api";
import { useState, useMemo } from "react";
import Toast from "@/components/ui/Toast";
import { motion } from "framer-motion";

export default function MenuCard({ item }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [toast, setToast] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // 1. Veg / Non-Veg detection
  const isVeg = useMemo(() => {
    if (item.isVeg !== undefined) return item.isVeg;
    const nameLower = item.name.toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    // Simple checks for common non-veg words
    return !(
      nameLower.includes("chicken") ||
      nameLower.includes("bacon") ||
      nameLower.includes("pepperoni") ||
      nameLower.includes("meat") ||
      nameLower.includes("fish") ||
      nameLower.includes("ham") ||
      descLower.includes("chicken") ||
      descLower.includes("bacon")
    );
  }, [item.name, item.description, item.isVeg]);

  // 2. Original Price / Discount
  const originalPrice = useMemo(() => {
    if (item.originalPrice) return item.originalPrice;
    // Highlight a few items with a simulated original price (discount)
    if (item.id === "item-1" || item.id === "item-7" || item.id === "item-11") {
      return Math.round(item.price * 1.2);
    }
    return null;
  }, [item.price, item.id, item.originalPrice]);

  const discountPercentage = useMemo(() => {
    if (!originalPrice) return null;
    return Math.round(((originalPrice - item.price) / originalPrice) * 100);
  }, [originalPrice, item.price]);

  // 3. Cart index & qty lookup for UNCUSTOMISED version
  const cartItemIndex = useMemo(() => {
    return cartItems.findIndex(
      (i) => i.id === item.id && (!i.customisation || Object.keys(i.customisation).length === 0)
    );
  }, [cartItems, item.id]);

  const quantityInCart = useMemo(() => {
    if (cartItemIndex >= 0) {
      return cartItems[cartItemIndex].quantity;
    }
    return 0;
  }, [cartItems, cartItemIndex]);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl || item.image || null,
      isVeg,
    });
    setToast({ message: `${item.name} added to cart!`, type: "success" });
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItemIndex >= 0) {
      updateQuantity(cartItemIndex, quantityInCart + 1);
    } else {
      handleAdd(e);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItemIndex >= 0) {
      updateQuantity(cartItemIndex, quantityInCart - 1);
      if (quantityInCart - 1 === 0) {
        setToast({ message: `${item.name} removed from cart.`, type: "info" });
      }
    }
  };

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <>
      <div
        id={`menu-card-${item.id}`}
        className="group relative bg-white rounded-3xl border border-surface-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)] hover:shadow-[0_12px_30px_-6px_rgba(194,65,12,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
      >
        <Link href={`/item/${item.id}`} className="block flex-1">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-surface-50 to-surface-100">
            {/* Visual Icon Shimmer Shading */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                {getEmoji(item.name)}
              </span>
            </div>
            
            {/* Image */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            )}

            {/* Sold Out Overlay */}
            {item.status === "unavailable" && (
              <div className="absolute inset-0 bg-[#1C1917]/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="bg-white text-surface-900 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                  Sold Out
                </span>
              </div>
            )}

            {/* Top Bar inside Image */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              {/* Veg / Non-Veg Badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase backdrop-blur-md shadow-sm ${
                isVeg 
                  ? "bg-emerald-500/90 text-white" 
                  : "bg-[var(--color-terracotta)]/90 text-white"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {isVeg ? "Veg" : "Non-Veg"}
              </span>

              {/* Wishlist Button */}
              <button
                onClick={toggleLike}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-90 ${
                  isLiked ? "text-red-500" : "text-surface-400 hover:text-red-500"
                }`}
                aria-label="Add to favourites"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Discount Badge */}
            {discountPercentage && item.status !== "unavailable" && (
              <div className="absolute bottom-3 left-3 z-10 bg-[var(--color-terracotta)] text-white text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-md shadow-sm">
                Save {discountPercentage}%
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-surface-700 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {(4.2 + (parseInt(item.id.replace(/\D/g, "")) % 8) * 0.1).toFixed(1)}
            </div>
          </div>

          {/* Content details */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-display font-bold text-sm text-surface-900 group-hover:text-[var(--color-terracotta)] transition-colors leading-tight line-clamp-1">
              {item.name}
            </h3>
            <p className="text-xs text-surface-500 mt-1 line-clamp-2 leading-relaxed flex-1">
              {item.description || "Freshly made to order using premium artisanal ingredients."}
            </p>
          </div>
        </Link>

        {/* Pricing and Action row */}
        <div className="px-4 pb-4 pt-0 mt-auto flex items-center justify-between z-10">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-[10px] text-surface-400 line-through leading-none">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="font-display font-extrabold text-base text-[var(--color-terracotta)]">
              {formatPrice(item.price)}
            </span>
          </div>

          {item.status !== "unavailable" && (
            <div className="flex items-center">
              {quantityInCart > 0 ? (
                /* Stepper state */
                <div className="flex items-center bg-surface-100 rounded-full border border-surface-200 p-0.5 shadow-sm">
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-surface-600 hover:bg-white active:scale-90 transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-surface-850">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-surface-600 hover:bg-white active:scale-90 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                /* Add to Cart button state */
                <button
                  onClick={handleAdd}
                  className="h-8 px-3.5 bg-[#1C1917] hover:bg-[var(--color-terracotta)] text-white font-bold text-xs rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1"
                  aria-label={`Add ${item.name} to cart`}
                  id={`add-card-${item.id}`}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}

function getEmoji(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("coffee") || n.includes("latte") || n.includes("cappuccino") || n.includes("mocha")) return "☕";
  if (n.includes("tea") || n.includes("chai") || n.includes("matcha")) return "🍵";
  if (n.includes("juice") || n.includes("smoothie") || n.includes("detox") || n.includes("sunrise")) return "🥤";
  if (n.includes("toast") || n.includes("bowl") || n.includes("breakfast") || n.includes("acai")) return "🥑";
  if (n.includes("sandwich") || n.includes("panini") || n.includes("club")) return "🥪";
  if (n.includes("tiramisu") || n.includes("cake") || n.includes("dessert")) return "🍰";
  if (n.includes("pasta") || n.includes("penne")) return "🍝";
  if (n.includes("buddha") || n.includes("salad")) return "🥗";
  if (n.includes("berry") || n.includes("bliss")) return "🫐";
  return "🍽️";
}
