"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const testimonials = [
    {
      name: "Rajesh Patel",
      role: "Managing Director",
      business: "Mumbai Bistro House, Mumbai",
      quote: "CafeCanvas saved us over ₹3.4 Lakhs in billing leaks and manual errors in just 3 months. The real-time reconciliation matches cash, card, and UPI perfectly. Highly recommend it.",
      rating: 5,
      impact: "14% Profit Margins ↑"
    },
    {
      name: "Priya Deshmukh",
      role: "Founder",
      business: "The Herb Garden Cafe, Pune",
      quote: "Our staff loves using the system. Shift coordination is fully transparent and payroll calculations take minutes instead of days. Having POS and QR ordering connected saves hours daily.",
      rating: 5,
      impact: "Zero Staff Turnover"
    },
    {
      name: "Arjun Singh",
      role: "Owner",
      business: "Brew & Barrel Brewery, Bangalore",
      quote: "Introducing QR ordering increased our table turnaround speed by 28%. Guests spend more when they can reorder drinks instantly. An absolute game changer for busy weekend rushes.",
      rating: 5,
      impact: "+32% Check Average ↑"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50 text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Case Studies
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Loved by Hospitality Operators.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            See how CafeCanvas helps restaurants, cafes, and bars control their margins and scale operations.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* 5 Star Rating */}
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, idx) => (
                    <span key={idx} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>

                <blockquote className="text-gray-600 text-sm italic leading-relaxed">
                  "{t.quote}"
                </blockquote>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-end">
                <div>
                  <h4 className="font-extrabold text-gray-950 text-sm">{t.name}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold">{t.role}</p>
                  <p className="text-[10px] text-orange-500 font-semibold mt-0.5">{t.business}</p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                  {t.impact}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
