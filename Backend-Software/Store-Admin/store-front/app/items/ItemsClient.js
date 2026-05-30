"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MenuCard from "@/components/menu/MenuCard";
import { MenuCardSkeleton } from "@/components/ui/Skeleton";
import { getCategories, getMenuItems, formatPrice } from "@/utils/api";
import useCartStore from "@/stores/cartStore";

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || null;

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const subtotal = getSubtotal();
  const cartCount = getItemCount();

  const sectionRefs = useRef({});

  // Fetch data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cats, menuItems] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);
        setCategories(cats);
        setItems(menuItems);
      } catch {
        setCategories([]);
        setItems([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Set up intersection observer for scroll sync
  useEffect(() => {
    if (loading || searchQuery.trim() || isScrolling) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // triggers when section occupies the sweet middle spot
      threshold: 0,
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.dataset.categoryId;
          setActiveCategory(categoryId);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each category section
    categories.forEach((cat) => {
      const el = document.getElementById(`category-section-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, categories, searchQuery, isScrolling]);

  // Click handler for category tab
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setIsScrolling(true);

    if (categoryId === null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setIsScrolling(false), 800);
      return;
    }

    const element = document.getElementById(`category-section-${categoryId}`);
    if (element) {
      const offset = 140; // compensate for sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Allow IntersectionObserver to take over again after scroll finishes
      setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    } else {
      setIsScrolling(false);
    }
  };

  // Filtered + searched items (used when searching)
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Get item counts per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Motion config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-24 min-h-screen bg-surface-50">
        {/* Page Header */}
        <div className="bg-white border-b border-surface-100 sticky top-[72px] z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900">
                  Our Menu
                </h1>
                <p className="text-xs text-surface-500 mt-0.5">
                  Artisanal delights prepared with love
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search dishes, drinks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="menu-search"
                  className="w-full pl-10 pr-10 py-2 bg-surface-50 border border-surface-200 rounded-full text-xs text-surface-850 placeholder:text-surface-450 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs with Badges */}
          <div className="max-w-6xl mx-auto px-4 pb-3 border-t border-surface-50 pt-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`category-pill flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                  !activeCategory && !searchQuery.trim()
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                    : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                }`}
                id="category-all"
              >
                All
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  !activeCategory && !searchQuery.trim()
                    ? "bg-white/20 text-white"
                    : "bg-surface-200 text-surface-600"
                }`}>
                  {items.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                const isActive = activeCategory === cat.id && !searchQuery.trim();
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`category-pill flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                        : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                    }`}
                    id={`category-tab-${cat.id}`}
                  >
                    {cat.name}
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-surface-200 text-surface-600"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <MenuCardSkeleton key={i} />
              ))}
            </div>
          ) : searchQuery.trim() ? (
            /* Search Results mode */
            <div>
              <p className="text-xs text-surface-450 mb-4">
                {searchedItems.length} item{searchedItems.length !== 1 ? "s" : ""} found matching &ldquo;
                <span className="text-surface-700 font-semibold">{searchQuery}</span>
                &rdquo;
              </p>

              {searchedItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-surface-100 shadow-sm">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-lg text-surface-700">No items found</h3>
                  <p className="text-xs text-surface-450 mt-1">Try a different keyword</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn btn-secondary mt-4 btn-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {searchedItems.map((item) => (
                    <motion.div key={item.id} variants={itemVariants}>
                      <MenuCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            /* Standard Sections mode */
            <div className="flex flex-col gap-8">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.categoryId === cat.id);
                if (catItems.length === 0) return null;

                return (
                  <section
                    key={cat.id}
                    id={`category-section-${cat.id}`}
                    data-category-id={cat.id}
                    className="scroll-mt-40 border-b border-surface-100/60 pb-8 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-display font-extrabold text-xl text-surface-900">
                        {cat.name}
                      </h2>
                      <span className="text-xs font-semibold text-surface-500 bg-surface-150 px-2 py-0.5 rounded-full">
                        {catItems.length}
                      </span>
                    </div>

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-100px" }}
                      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {catItems.map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                          <MenuCard item={item} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-55 print:hidden"
          >
            <div className="bg-[#1C1917]/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 text-white flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center relative shadow-md">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-[var(--color-terracotta)] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-surface-300 font-semibold tracking-wider uppercase">View Order</p>
                  <p className="text-sm font-bold">{formatPrice(subtotal)}</p>
                </div>
              </div>

              <Link
                href="/cart"
                className="bg-white hover:bg-surface-50 text-[#1C1917] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.03] active:scale-[0.97]"
                id="floating-cart-btn"
              >
                Go to Cart
                <span className="text-[var(--color-terracotta)] font-extrabold">→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
