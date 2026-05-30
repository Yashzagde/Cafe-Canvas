"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Tag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getBlogs, formatDate, readingTime } from "@/utils/api";
import Skeleton, { BlogCardSkeleton } from "@/components/ui/Skeleton";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getBlogs();
      setBlogs(data);
      setLoading(false);
    }
    load();
  }, []);

  // Classify categories based on content (e.g. coffee, recipes, stories)
  const classifiedBlogs = useMemo(() => {
    return blogs.map((blog) => {
      const title = blog.title.toLowerCase();
      let category = "stories";
      if (title.includes("coffee") || title.includes("pour") || title.includes("brew")) {
        category = "coffee";
      } else if (title.includes("recipe") || title.includes("bowl") || title.includes("breakfast")) {
        category = "recipes";
      }
      return { ...blog, category };
    });
  }, [blogs]);

  // Categories list
  const categories = [
    { id: "all", name: "All Stories" },
    { id: "coffee", name: "Coffee Culture" },
    { id: "recipes", name: "Kitchen Recipes" },
    { id: "stories", name: "Behind the Menu" },
  ];

  // Pinned/Featured post (usually the most recent one)
  const featuredPost = useMemo(() => {
    if (classifiedBlogs.length === 0) return null;
    return classifiedBlogs[0]; // First post is pinned/featured
  }, [classifiedBlogs]);

  // Filtered posts (excluding the featured one if showing "all" or according to category)
  const filteredBlogs = useMemo(() => {
    let list = classifiedBlogs;
    
    // In "all" category, we can render the remaining posts in the grid
    if (activeCategory === "all") {
      return list.slice(1); // exclude featured
    }
    
    // In specific category, filter list
    return list.filter((b) => b.category === activeCategory);
  }, [classifiedBlogs, activeCategory]);

  // Motion config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 min-h-screen bg-surface-50">
        
        {/* Editor Banner Gradient Header */}
        <div className="bg-white border-b border-surface-100">
          <div className="max-w-5xl mx-auto px-4 py-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] text-[var(--color-terracotta)] text-[10px] font-extrabold tracking-widest uppercase mb-4 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Cafe Journal
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-surface-900 leading-tight">
              Stories, Recipes & Specialty Craft
            </h1>
            <p className="text-xs sm:text-sm text-surface-500 mt-3 max-w-lg mx-auto leading-relaxed">
              Explore the rich cultural origin behind our specialty organic coffee beans, learn artisanal recipes, and keep up with seasonal news.
            </p>

            {/* Stagger Animated Category Tabs */}
            <div className="flex gap-2 justify-center overflow-x-auto hide-scrollbar pb-1 mt-8">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1 whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                      isActive
                        ? "bg-[#1C1917] text-white border-[#1C1917] shadow-sm"
                        : "bg-surface-50 border-surface-200 text-surface-650 hover:bg-surface-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Blog Content Layout */}
        <div className="max-w-5xl mx-auto px-4 py-10">
          {loading ? (
            <div className="space-y-10">
              <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : classifiedBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-surface-100 shadow-sm">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-display font-extrabold text-lg text-surface-700">No Journal Entries Yet</h3>
              <p className="text-xs text-surface-450 mt-1">Check back soon for stories, brew guides and chef diaries!</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* FEATURED / PINNED BANNER CARD */}
              {activeCategory === "all" && featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group block relative bg-white rounded-[32px] border border-surface-100 overflow-hidden shadow-[0_4px_25px_-5px_rgba(28,25,23,0.03)] hover:shadow-[0_15px_40px_-10px_rgba(28,25,23,0.08)] transition-all duration-300"
                >
                  <Link href={`/blog/${featuredPost.slug}`} className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Image Cover */}
                    <div className="lg:col-span-7 aspect-video lg:aspect-auto min-h-[280px] bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl opacity-20 group-hover:scale-105 transition-transform duration-700">{getBlogEmoji(featuredPost.title)}</span>
                      </div>
                      {featuredPost.heroImageUrl && (
                        <img
                          src={featuredPost.heroImageUrl}
                          alt={featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                        />
                      )}
                      
                      {/* Pinned Tag */}
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-sm text-[var(--color-terracotta)] font-extrabold text-[9px] tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Featured Post
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-terracotta)]">
                          <Tag className="w-3 h-3" />
                          {featuredPost.category}
                        </span>

                        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-surface-900 group-hover:text-[var(--color-terracotta)] transition-colors leading-tight line-clamp-3">
                          {featuredPost.title}
                        </h2>

                        <p className="text-xs text-surface-500 leading-relaxed line-clamp-4">
                          {featuredPost.content?.split("\n").filter(l => l.trim() && !l.startsWith("#"))[0] || "Explore this editorial journal entry from the kitchen team at Cafe Canvas."}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-surface-450 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{readingTime(featuredPost.content)} min read</span>
                          <span>·</span>
                          <span>{formatDate(featuredPost.publishedAt)}</span>
                        </div>

                        <span className="text-xs font-bold text-[#1C1917] group-hover:text-[var(--color-terracotta)] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                          Read Story <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* POSTS GRID */}
              <div>
                {activeCategory === "all" && filteredBlogs.length > 0 && (
                  <h3 className="font-display font-extrabold text-lg text-surface-950 mb-5">Latest Entries</h3>
                )}

                {filteredBlogs.length === 0 ? (
                  activeCategory !== "all" && (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-surface-100 shadow-sm animate-scale-in">
                      <div className="text-4xl mb-3">📖</div>
                      <h4 className="font-display font-bold text-sm text-surface-700">No entries in this category yet</h4>
                      <p className="text-[11px] text-surface-450">Check back soon for upcoming specialty posts!</p>
                    </div>
                  )
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {filteredBlogs.map((blog) => (
                      <motion.div key={blog.id} variants={itemVariants}>
                        <Link
                          href={`/blog/${blog.slug}`}
                          id={`blog-card-${blog.slug}`}
                          className="group block bg-white rounded-[32px] border border-surface-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(28,25,23,0.02)] hover:shadow-[0_12px_30px_-6px_rgba(28,25,23,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
                        >
                          {/* Card Image */}
                          <div className="aspect-[16/9] w-full bg-gradient-to-br from-stone-100 to-amber-50 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl opacity-20 group-hover:scale-105 transition-transform duration-700">{getBlogEmoji(blog.title)}</span>
                            </div>
                            {blog.heroImageUrl && (
                              <img
                                src={blog.heroImageUrl}
                                alt={blog.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                                loading="lazy"
                              />
                            )}

                            {/* Reading duration info badge */}
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm shadow-sm text-surface-650 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {readingTime(blog.content)} min
                            </span>
                          </div>

                          {/* Content Details */}
                          <div className="p-6 flex flex-col flex-1 justify-between">
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-terracotta)]">
                                <Tag className="w-3 h-3" />
                                {blog.category}
                              </span>

                              <h4 className="font-display font-bold text-base text-surface-900 group-hover:text-[var(--color-terracotta)] transition-colors leading-tight line-clamp-2">
                                {blog.title}
                              </h4>

                              <p className="text-xs text-surface-500 leading-relaxed line-clamp-2">
                                {blog.content?.split("\n").filter(l => l.trim() && !l.startsWith("#"))[0] || "Explore this organic kitchen journal entry."}
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-surface-50 flex items-center justify-between text-xs font-semibold">
                              <span className="text-surface-450 text-[10px]">{formatDate(blog.publishedAt)}</span>
                              
                              <span className="text-xs font-bold text-[#1C1917] group-hover:text-[var(--color-terracotta)] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                                Read Story <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function getBlogEmoji(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("coffee") || t.includes("pour") || t.includes("brew")) return "☕";
  if (t.includes("breakfast") || t.includes("bowl")) return "🥣";
  if (t.includes("seasonal") || t.includes("special")) return "🌿";
  if (t.includes("recipe")) return "👨‍🍳";
  return "📖";
}
