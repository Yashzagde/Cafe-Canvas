"use client";

import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    text: "The Hazelnut Latte is absolutely divine! The ambience is perfect for working or catching up with friends. My go-to cafe in Bangalore.",
    date: "2 weeks ago",
  },
  {
    name: "Arjun Mehta",
    avatar: "AM",
    rating: 5,
    text: "Best Avocado Toast in the city, hands down. The digital menu makes ordering so smooth. Love the attention to detail!",
    date: "1 month ago",
  },
  {
    name: "Sneha Reddy",
    avatar: "SR",
    rating: 4,
    text: "Discovered this gem through their QR menu. The Matcha Zen Latte is unlike anything I've tried. Will definitely be back!",
    date: "3 weeks ago",
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-16 bg-surface-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2 block">
            What People Say
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900">
            Loved by Our Guests
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className={`card-flat p-6 relative animate-slide-up stagger-${i + 1}`}
              id={`review-${i}`}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-100" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${
                      si < review.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-surface-200"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-surface-600 leading-relaxed mb-5">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{review.name}</p>
                  <p className="text-xs text-surface-400">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
