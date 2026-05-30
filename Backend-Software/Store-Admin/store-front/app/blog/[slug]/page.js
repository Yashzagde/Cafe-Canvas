"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Share2, Coffee, Copy, CheckCircle, Flame, Users, Sparkles, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getBlogBySlug, getBlogs, formatDate, readingTime } from "@/utils/api";
import Skeleton from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";

export default function BlogPostPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  
  const [blog, setBlog] = useState(null);
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [toast, setToast] = useState(null);

  // Fetch blogs on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [post, list] = await Promise.all([
          getBlogBySlug(slug),
          getBlogs()
        ]);
        setBlog(post);
        setBlogsList(list);
      } catch (err) {
        setBlog(null);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Window scroll event to calculate reading progress bar width
  useEffect(() => {
    if (loading || !blog) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = (scrollY / docHeight) * 100;
        setScrollPercent(pct);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, blog]);

  // Related posts list (excluding current)
  const relatedPosts = useMemo(() => {
    return blogsList.filter((b) => b.slug !== slug).slice(0, 2);
  }, [blogsList, slug]);

  // Check if current post is a recipe/guide
  const recipeData = useMemo(() => {
    if (!blog) return null;
    const titleLower = blog.title.toLowerCase();
    
    if (titleLower.includes("pour-over")) {
      return {
        title: "Artisanal Drip Brew Recipe",
        prepTime: "5 min",
        cookTime: "3 min",
        servings: "1 cup",
        difficulty: "Medium",
        calories: "2 kcal",
        ingredients: [
          "15g freshly roasted coffee beans (medium-coarse)",
          "250ml filtered water (heated to 93°C)",
          "Paper drip filter",
          "Gooseneck kettle (recommended)"
        ],
        equipment: "Hario V60 or Chemex"
      };
    } else if (titleLower.includes("bowls")) {
      return {
        title: "Signature Acai & Grain Prep",
        prepTime: "10 min",
        cookTime: "0 min",
        servings: "1 bowl",
        difficulty: "Easy",
        calories: "320 kcal",
        ingredients: [
          "1 frozen Acai packet",
          "1/2 ripe banana",
          "50ml organic oat milk",
          "Gluten-free granola",
          "Handful of fresh seasonal berries",
          "1 tsp raw wildflower honey"
        ],
        equipment: "High-speed blender"
      };
    }
    return null;
  }, [blog]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          url: window.location.href,
        });
      } catch (err) {
        // Silently ignore aborts
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: "Link copied to clipboard!", type: "success" });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setToast({ message: "Post link copied!", type: "success" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-12 min-h-screen bg-white">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Skeleton className="w-32 h-4 mb-4" />
            <Skeleton variant="title" className="w-3/4 h-8 mb-3 animate-pulse" />
            <Skeleton className="w-full aspect-video rounded-3xl mb-8" />
            <Skeleton variant="text" className="mb-2" />
            <Skeleton variant="text" className="mb-2" />
          </div>
        </main>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-surface-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="font-display font-extrabold text-xl text-surface-800">Article not found</h2>
            <p className="text-xs text-surface-500 mt-2">The requested journal post could not be retrieved.</p>
            <Link href="/blog" className="btn btn-primary mt-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Journal
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Simple custom markdown-like renderer with classes
  const renderContent = (content) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="font-display font-extrabold text-xl text-surface-900 mt-8 mb-4 border-b border-surface-50 pb-2">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="text-surface-650 ml-5 mb-2 list-disc text-sm leading-relaxed">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="text-surface-650 ml-5 mb-2 list-decimal text-sm leading-relaxed">
            {line.replace(/^\d+\.\s/, "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={i} className="h-4" />;
      }
      return (
        <p key={i} className="text-surface-650 text-sm leading-relaxed mb-4 text-justify">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      {/* Dynamic Scroll Linked Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-600)] z-60 transition-all duration-75"
        style={{ width: `${scrollPercent}%` }}
      />
      
      <Navbar />
      
      <main className="pt-20 pb-16 min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-8">
          
          {/* Back button */}
          <Link href="/blog" className="btn btn-ghost text-surface-500 -ml-3 mb-6 flex items-center gap-1.5 text-xs font-bold" id="blog-back">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Journal
          </Link>

          {/* Meta Header */}
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center gap-3 text-xs text-surface-450 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(blog.publishedAt)}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-surface-200" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime(blog.content)} min read
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-surface-900 leading-tight">
              {blog.title}
            </h1>

            {/* Author info & Actions bar */}
            <div className="flex items-center gap-3 mt-5 py-5 border-t border-b border-surface-100">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-terracotta)]">
                <Coffee className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-surface-850">Cafe Canvas Editorial</p>
                <p className="text-[10px] text-surface-450 font-semibold uppercase tracking-wider">Kitchen & Coffee Guides</p>
              </div>

              {/* Share triggers */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleCopyLink}
                  className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 text-surface-600 flex items-center justify-center transition-all active:scale-90"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 text-surface-600 flex items-center justify-center transition-all active:scale-90"
                  id="blog-share"
                  title="Share article"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Banner Cover Image */}
          <div className="mt-8 rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 aspect-video relative shadow-[0_15px_35px_-12px_rgba(28,25,23,0.08)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-15">{getBlogEmoji(blog.title)}</span>
            </div>
            {blog.heroImageUrl && (
              <img src={blog.heroImageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>

          {/* Specialized Recipe Card Component (If recipe guide exists) */}
          {recipeData && (
            <div className="mt-8 p-6 rounded-[32px] bg-[#FAFAF7] border border-surface-150 shadow-sm space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-[var(--color-primary-500)]" />
                  <h3 className="font-display font-extrabold text-sm text-surface-900">{recipeData.title}</h3>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--color-primary-100)] text-[var(--color-primary-900)]">Kitchen Prep</span>
              </div>

              {/* Recipe attributes */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-2xl border border-surface-100">
                  <p className="text-[9px] font-bold text-surface-450 uppercase">Prep</p>
                  <p className="text-xs font-bold text-surface-850 mt-0.5">{recipeData.prepTime}</p>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-surface-100">
                  <p className="text-[9px] font-bold text-surface-450 uppercase">Brew/Cook</p>
                  <p className="text-xs font-bold text-surface-850 mt-0.5">{recipeData.cookTime}</p>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-surface-100">
                  <p className="text-[9px] font-bold text-surface-450 uppercase">Yields</p>
                  <p className="text-xs font-bold text-surface-850 mt-0.5">{recipeData.servings}</p>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-surface-100">
                  <p className="text-[9px] font-bold text-surface-450 uppercase">Difficulty</p>
                  <p className="text-xs font-bold text-surface-850 mt-0.5">{recipeData.difficulty}</p>
                </div>
              </div>

              {/* Recipe Ingredients */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Ingredients List
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1.5">
                  {recipeData.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-surface-650">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {recipeData.equipment && (
                <div className="text-[10px] bg-white border border-surface-100 p-2.5 rounded-2xl flex items-center gap-2">
                  <span className="font-bold uppercase text-surface-450">Required Gear:</span>
                  <span className="font-bold text-surface-800">{recipeData.equipment}</span>
                </div>
              )}
            </div>
          )}

          {/* Article Main Markdown Content */}
          <div className="mt-8 prose-cafe max-w-none text-surface-650">
            {renderContent(blog.content)}
          </div>

          {/* CTA order card */}
          <div className="mt-12 p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#1C1917] to-surface-900 text-white text-center relative overflow-hidden shadow-xl border border-white/5">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
            <h3 className="font-display font-extrabold text-xl mb-2">Feeling Appetite Rising?</h3>
            <p className="text-xs text-surface-300 mb-6 max-w-sm mx-auto leading-relaxed">
              Order fresh artisanal coffees, breakfast bowls, and paninis directly to your table or counter online.
            </p>
            <Link href="/items" className="btn btn-primary" id="blog-cta-menu">
              Explore Our Menu
            </Link>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-surface-100">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4.5 h-4.5 text-[var(--color-primary-500)]" />
                <h3 className="font-display font-extrabold text-lg text-surface-950">Keep Reading</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group block bg-white rounded-3xl p-3 border border-surface-100 hover:shadow-md transition-all h-full"
                  >
                    <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center overflow-hidden relative">
                      <span className="text-3xl opacity-20 group-hover:scale-105 transition-transform duration-500">{getBlogEmoji(rel.title)}</span>
                      {rel.heroImageUrl && (
                        <img src={rel.heroImageUrl} alt={rel.title} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] text-surface-450 font-bold uppercase tracking-wider">{formatDate(rel.publishedAt)}</p>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-surface-900 leading-tight truncate group-hover:text-[var(--color-terracotta)] mt-1 transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
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
