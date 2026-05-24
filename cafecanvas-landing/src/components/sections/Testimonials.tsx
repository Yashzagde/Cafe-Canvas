"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const testimonials = [
  {
    name: "Priya Nair",
    role: "Owner",
    restaurant: "The Malabar House",
    location: "Kochi · Coastal Cuisine",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    quote: "We were paying aggregators over ₹35,000 a month in commissions. After switching to Cafe Canvas, that money stays in our bank. Setup took just one afternoon.",
    metric: "₹35,000 saved monthly",
  },
  {
    name: "Aarav Singh",
    role: "General Manager",
    restaurant: "Spice Route",
    location: "Chennai · Chettinad Fine Dining",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    quote: "The QR table ordering changed how our dinner service works. Less staff running around, more orders per table, and our diners settle payments instantly via UPI.",
    metric: "+28% table turn speed",
  },
  {
    name: "Meera Patel",
    role: "Founder",
    restaurant: "Brew District",
    location: "Ahmedabad · Coffee & Roasters",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    quote: "I changed our entire website theme for Diwali in 10 minutes from my phone. No developers, no agencies, no waiting. Simple menus updates are a breeze.",
    metric: "₹0 developer fees",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="testimonials"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/40 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <SectionHeading
            tag="Success Stories"
            title="Restaurant owners who took back control."
            subtitle="Read real stories from real F&B owners across India who broke free from aggregator commissions and rebuilt direct relationships with their customers."
          />

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {testimonials.map((t, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="relative pt-6">
                <GlassCard className="p-8 h-full flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(22,163,74,0.06)] hover:border-green-200/40 relative">
                  
                  {/* Floating User Photo */}
                  <div className="absolute top-[-30px] left-8 w-16 h-16 rounded-full border-2 border-white shadow-md bg-stone-100 overflow-hidden ring-4 ring-green-100/50">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>

                  <div className="space-y-4 pt-6">
                    {/* Stars */}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-sm text-stone-600 leading-relaxed font-light italic">
                      "{t.quote}"
                    </blockquote>
                  </div>

                  {/* Owner Info & Metric Highlight */}
                  <div className="pt-6 border-t border-stone-200/50 mt-6 flex justify-between items-end">
                    <div className="space-y-1">
                      <cite className="not-italic font-bold text-sm text-stone-900 block font-sans">
                        {t.name}
                      </cite>
                      <span className="text-[10px] text-green-700 font-bold block">
                        {t.restaurant}
                      </span>
                      <span className="text-[9px] text-stone-500 font-light block">
                        {t.location}
                      </span>
                    </div>

                    <span className="text-[10px] bg-green-500/10 text-green-700 border border-green-500/15 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {t.metric}
                    </span>
                  </div>

                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
