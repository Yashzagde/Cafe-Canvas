"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Minus, Plus, ShoppingBag, Star, Clock,
  Check, Heart, AlertTriangle, Sparkles, BookOpen
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageSlider from "@/components/product/ImageSlider";
import useCartStore from "@/stores/cartStore";
import { getMenuItem, getItemModifiers, formatPrice, getMenuItems } from "@/utils/api";
import Toast from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [item, setItem] = useState(null);
  const [modifiers, setModifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular"); // S/M/L sized customisation
  const [selectedAddons, setSelectedAddons] = useState([]); // checkbox customisation
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [toast, setToast] = useState(null);
  const [liked, setLiked] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);

  // Fetch data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const menuItem = await getMenuItem(id);
        setItem(menuItem);

        if (menuItem?.allowsModifiers) {
          const mods = await getItemModifiers(id);
          setModifiers(mods);
        }

        // Fetch related items from same category
        if (menuItem?.categoryId) {
          const allItems = await getMenuItems(menuItem.categoryId);
          setRelatedItems(allItems.filter((i) => i.id !== id).slice(0, 4));
        }
      } catch {
        setItem(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Size Options Mock (For visual elegance, present sizes for drinks/meals)
  const sizeOptions = useMemo(() => {
    if (!item) return [];
    const isDrink = item.categoryId === "cat-1" || item.categoryId === "cat-2" || item.categoryId === "cat-3" || item.categoryId === "cat-8";
    if (isDrink) {
      return [
        { name: "Small", extraPrice: 0, desc: "250ml" },
        { name: "Regular", extraPrice: 40, desc: "350ml" },
        { name: "Large", extraPrice: 70, desc: "450ml" },
      ];
    } else {
      return [
        { name: "Regular", extraPrice: 0, desc: "Standard portion" },
        { name: "Premium Shareable", extraPrice: 120, desc: "Larger portion + premium plating" },
      ];
    }
  }, [item]);

  // Addons Options Mock (For visual elegance and detail customisation)
  const addonOptions = useMemo(() => {
    if (!item) return [];
    const isDrink = item.categoryId === "cat-1" || item.categoryId === "cat-2" || item.categoryId === "cat-3" || item.categoryId === "cat-8";
    if (isDrink) {
      return [
        { id: "ao-1", name: "Extra Espresso Shot", price: 40 },
        { id: "ao-2", name: "Whipped Cream", price: 30 },
        { id: "ao-3", name: "Oat Milk Swap", price: 50 },
        { id: "ao-4", name: "Caramel Drizzle", price: 25 },
      ];
    } else {
      return [
        { id: "ao-5", name: "Extra Egg", price: 30 },
        { id: "ao-6", name: "Artisanal Cheese", price: 45 },
        { id: "ao-7", name: "Gluten-Free Bread", price: 40 },
        { id: "ao-8", name: "Avocado Scoop", price: 60 },
      ];
    }
  }, [item]);

  // Allergens Mock
  const allergens = useMemo(() => {
    if (!item) return [];
    const nameLower = item.name.toLowerCase();
    const list = [];
    if (nameLower.includes("latte") || nameLower.includes("cappuccino") || nameLower.includes("mocha") || nameLower.includes("cake") || nameLower.includes("tiramisu") || nameLower.includes("panini")) {
      list.push("Dairy");
    }
    if (nameLower.includes("toast") || nameLower.includes("sandwich") || nameLower.includes("panini") || nameLower.includes("pasta") || nameLower.includes("cake") || nameLower.includes("tiramisu")) {
      list.push("Gluten");
    }
    if (nameLower.includes("hazelnut") || nameLower.includes("almond") || nameLower.includes("tiramisu")) {
      list.push("Nuts");
    }
    return list;
  }, [item]);

  // Toggle addons
  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Collate all customisation options
    const customisation = {
      size: sizeOptions.find((s) => s.name === selectedSize) || sizeOptions[0],
      addOns: selectedAddons,
      specialInstructions: specialInstructions.trim() || null,
    };

    const sizeCost = customisation.size ? customisation.size.extraPrice : 0;
    const addonsCost = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl || null,
      quantity: qty,
      customisation,
      // Modifiers map to standard modifiers array
      modifiers: [
        ...(customisation.size && customisation.size.extraPrice > 0 ? [{ id: `size-${customisation.size.name}`, name: `Size: ${customisation.size.name}`, extraPrice: sizeCost }] : []),
        ...selectedAddons.map((a) => ({ id: a.id, name: a.name, extraPrice: a.price })),
      ],
    });

    setToast({ message: `${qty}x ${item.name} added to cart!`, type: "success" });

    // Reset parameters
    setQty(1);
    setSelectedSize("Regular");
    setSelectedAddons([]);
    setSpecialInstructions("");
  };

  // Price calculations
  const totalCustomisationPrice = useMemo(() => {
    const sizeCost = sizeOptions.find((s) => s.name === selectedSize)?.extraPrice || 0;
    const addonsCost = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return sizeCost + addonsCost;
  }, [selectedSize, selectedAddons, sizeOptions]);

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    return item.price + totalCustomisationPrice;
  }, [item, totalCustomisationPrice]);

  const totalPrice = useMemo(() => {
    return unitPrice * qty;
  }, [unitPrice, qty]);

  const isVeg = useMemo(() => {
    if (!item) return true;
    if (item.isVeg !== undefined) return item.isVeg;
    const nameLower = item.name.toLowerCase();
    return !(nameLower.includes("chicken") || nameLower.includes("bacon") || nameLower.includes("pepperoni") || nameLower.includes("meat"));
  }, [item]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-32 min-h-screen bg-surface-50">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Skeleton className="w-full aspect-[4/3] rounded-3xl mb-6 animate-pulse" />
            <Skeleton variant="title" className="w-2/3 mb-3" />
            <Skeleton variant="text" className="w-full mb-2" />
            <Skeleton variant="text" className="w-3/4 mb-6" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-surface-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="font-display font-extrabold text-xl text-surface-800">Dish not found</h2>
            <p className="text-xs text-surface-500 mt-2">This culinary item may have been removed from our seasonal list.</p>
            <Link href="/items" className="btn btn-primary mt-6" id="product-back-menu">
              <ArrowLeft className="w-4 h-4" />
              Explore Menu
            </Link>
          </div>
        </main>
      </>
    );
  }

  const sliderImages = item.imageUrl ? [item.imageUrl] : [];

  return (
    <>
      <Navbar />
      <main className="pt-16 pb-32 min-h-screen bg-surface-50">
        {/* Back navigation */}
        <div className="max-w-3xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost text-surface-500 -ml-3 flex items-center gap-1.5 text-xs font-bold"
            id="product-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Menu
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Top Level Images Carousel */}
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-surface-100 to-surface-200 aspect-[4/3] sm:aspect-[16/10] shadow-[0_15px_40px_-15px_rgba(28,25,23,0.12)]">
            <ImageSlider images={sliderImages} fallbackEmoji={getEmoji(item.name)} />

            {/* Favourites heart button */}
            <button
              onClick={() => setLiked(!liked)}
              className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 ${
                liked
                  ? "bg-red-500 text-white shadow-[0_8px_20px_-4px_rgba(239,68,68,0.4)] scale-110"
                  : "bg-white/90 backdrop-blur-sm text-surface-500 shadow-md hover:scale-105 active:scale-95"
              }`}
              id="product-like"
            >
              <Heart className={`w-4.5 h-4.5 ${liked ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Premium Overlapped Float Card */}
          <div className="relative z-10 -mt-8 sm:-mt-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(28,25,23,0.08)] border border-surface-100 animate-slide-up">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm ${
                    isVeg ? "bg-emerald-50 text-emerald-700" : "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-emerald-500" : "bg-[var(--color-terracotta)]"}`} />
                    {isVeg ? "Vegetarian" : "Non-Vegetarian"}
                  </span>
                  
                  {allergens.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold tracking-wide uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      Allergens
                    </span>
                  )}
                </div>

                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-surface-900 leading-tight">
                  {item.name}
                </h1>

                <div className="flex items-center gap-4 mt-3 text-xs text-surface-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {(4.2 + (parseInt(item.id.replace(/\D/g, "")) % 8) * 0.1).toFixed(1)} (128 reviews)
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-200" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    10-15 mins Prep
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start">
                <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Base Price</span>
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--color-terracotta)]">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-5 border-t border-surface-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Description</h3>
              <p className="text-sm text-surface-650 leading-relaxed">
                {item.description || "Indulge in a premium recipe prepared by our expert chefs using fresh organic produce and artisanal dressings, crafted for balanced nutrition and exceptional taste."}
              </p>
            </div>

            {/* Allergens Warn List */}
            {allergens.length > 0 && (
              <div className="mt-5 p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Allergen Notice</p>
                  <p className="text-[11px] text-amber-700 leading-tight mt-0.5">
                    This recipe contains <span className="font-bold">{allergens.join(", ")}</span>. Prepared in a workspace that handles wheat, nuts, and dairy products.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Size Modifier Section (S/M/L) */}
          <div className="bg-white rounded-[32px] p-6 mt-4 shadow-[0_12px_30px_-10px_rgba(28,25,23,0.04)] border border-surface-100 animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-surface-900">Select Portion Size</h3>
                <p className="text-[11px] text-surface-450 mt-0.5">Pick the quantity that suits your appetite</p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-100 text-surface-500">Required</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sizeOptions.map((opt) => {
                const isSelected = selectedSize === opt.name;
                return (
                  <button
                    key={opt.name}
                    onClick={() => setSelectedSize(opt.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all hover:scale-[1.01] active:scale-[0.98] ${
                      isSelected
                        ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5 text-[var(--color-terracotta)] shadow-sm"
                        : "border-surface-200 text-surface-700 bg-white hover:border-surface-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.name}</span>
                    <span className="text-[9px] opacity-75 mt-0.5">{opt.desc}</span>
                    {opt.extraPrice > 0 && (
                      <span className="text-[10px] font-extrabold mt-1">
                        +{formatPrice(opt.extraPrice)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons Selector Section */}
          <div className="bg-white rounded-[32px] p-6 mt-4 shadow-[0_12px_30px_-10px_rgba(28,25,23,0.04)] border border-surface-100 animate-slide-up stagger-3">
            <div>
              <h3 className="font-display font-bold text-sm text-surface-900">Customise Add-ons</h3>
              <p className="text-[11px] text-surface-450 mt-0.5">Enhance your taste with extra ingredients</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {addonOptions.map((opt) => {
                const isSelected = selectedAddons.some((a) => a.id === opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAddonToggle(opt)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5 text-[var(--color-terracotta)]"
                        : "border-surface-200 text-surface-700 bg-white hover:border-surface-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]" : "border-surface-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                      <span className="text-xs font-bold">{opt.name}</span>
                    </div>
                    <span className="text-xs font-bold opacity-75">+{formatPrice(opt.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-[32px] p-6 mt-4 shadow-[0_12px_30px_-10px_rgba(28,25,23,0.04)] border border-surface-100 animate-slide-up stagger-[4]">
            <h3 className="font-display font-bold text-sm text-surface-900 mb-2">Special Instructions</h3>
            <textarea
              placeholder="e.g. Make it spicy, no sugar, extra hot, milk on the side..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full h-20 p-3 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)] transition-all resize-none"
            />
          </div>

          {/* Related Items Carousel */}
          {relatedItems.length > 0 && (
            <div className="mt-10 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <h3 className="font-display font-bold text-lg text-surface-900">You Might Also Like</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3">
                {relatedItems.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/item/${rel.id}`}
                    className="flex-shrink-0 w-44 bg-white rounded-3xl p-3 border border-surface-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    id={`related-${rel.id}`}
                  >
                    <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center overflow-hidden relative">
                      <span className="text-3xl opacity-20 group-hover:scale-105 transition-transform duration-500">{getEmoji(rel.name)}</span>
                      {rel.imageUrl && (
                        <img src={rel.imageUrl} alt={rel.name} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-1 mt-2.5">
                      <p className="text-xs font-bold text-surface-850 truncate group-hover:text-[var(--color-terracotta)] transition-colors">
                        {rel.name}
                      </p>
                      <p className="text-xs font-display font-extrabold text-[var(--color-terracotta)] mt-0.5">
                        {formatPrice(rel.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Add-to-Cart Bottom Bar */}
        <div className="cart-bar glass shadow-float z-50 print:hidden" id="product-add-bar">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            {/* Quantity Selector Stepper */}
            <div className="flex items-center gap-0.5 bg-surface-100 rounded-full p-1 border border-surface-200 shadow-inner">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-surface-650 hover:bg-white active:scale-90 transition-all shadow-sm"
                id="product-qty-minus"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-extrabold text-sm text-surface-900">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-surface-650 hover:bg-white active:scale-90 transition-all shadow-sm"
                id="product-qty-plus"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Premium Action */}
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg flex-1 bg-[#1C1917] hover:bg-[var(--color-terracotta)] font-extrabold text-sm text-white py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-md transition-all"
              id="product-add-to-cart"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              Add to Cart · {formatPrice(totalPrice)}
            </button>
          </div>
        </div>
      </main>

      <Footer />

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
