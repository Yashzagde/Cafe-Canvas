"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { formatDate, readingTime } from "@/utils/api";

export default function BlogsPreview({ blogs = [] }) {
  const latest = blogs.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section id="blogs-preview" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)] mb-1 block">📖 From Our Kitchen</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Stories & Recipes</h2>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] group">
            View All Posts <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {latest.map((blog, i) => (
            <motion.div key={blog.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={`/blog/${blog.slug}`} className="card group" id={`blog-preview-${blog.slug}`}>
                <div className="img-cover aspect-video bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] relative">
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl opacity-15">{getBlogEmoji(blog.title)}</span></div>
                  {blog.heroImageUrl && <img src={blog.heroImageUrl} alt={blog.title} className="absolute inset-0" loading="lazy" />}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[var(--color-text-muted)]">
                    <Clock className="w-3 h-3" />{readingTime(blog.content)} min
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-[var(--color-primary-600)] font-semibold uppercase tracking-wider mb-1.5">{formatDate(blog.publishedAt)}</p>
                  <h3 className="font-display font-bold text-[15px] text-[var(--color-text)] group-hover:text-[var(--color-primary-700)] transition-colors leading-tight line-clamp-2">{blog.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-2">{blog.content?.split("\n")[0]}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-600)]">Read More <ArrowRight className="w-3 h-3" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/blog" className="btn btn-secondary">View All Posts <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}

function getBlogEmoji(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("coffee") || t.includes("pour") || t.includes("brew")) return "☕";
  if (t.includes("breakfast") || t.includes("bowl")) return "🥣";
  if (t.includes("seasonal") || t.includes("special")) return "🌿";
  return "📖";
}
