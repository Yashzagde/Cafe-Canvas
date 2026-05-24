"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Globe,
  QrCode,
  MessageSquare,
  BadgePercent,
  Users,
  BarChart3,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const features = [
  {
    icon: Globe,
    title: "Branded Digital Store",
    desc: "A fully custom storefront live on your own domain in under 24 hours. Change layout designs instantly.",
    color: "text-green-600",
    bg: "bg-green-50/50",
    border: "group-hover:border-green-200/60",
  },
  {
    icon: QrCode,
    title: "QR Table Ordering",
    desc: "Contactless dining. Customers scan, browse, and place orders directly to the kitchen. No app download needed.",
    color: "text-orange-500",
    bg: "bg-orange-50/50",
    border: "group-hover:border-orange-200/60",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp OTP Login",
    desc: "Frictionless, one-tap mobile login. Eliminate email friction and increase order completions by 3x.",
    color: "text-green-500",
    bg: "bg-emerald-50/50",
    border: "group-hover:border-emerald-200/60",
  },
  {
    icon: BadgePercent,
    title: "Zero Commission Payments",
    desc: "Keep 100% of your earnings. Razorpay routes payouts directly to your bank account instantly.",
    color: "text-amber-500",
    bg: "bg-amber-50/50",
    border: "group-hover:border-amber-200/60",
  },
  {
    icon: Users,
    title: "CRM & Broadcast Engine",
    desc: "Own your customer database. Send targeted WhatsApp alerts, deals, and loyalty coupons easily.",
    color: "text-rose-500",
    bg: "bg-rose-50/50",
    border: "group-hover:border-rose-200/60",
  },
  {
    icon: BarChart3,
    title: "Real-Time Intelligence",
    desc: "Know your busiest times, best-selling dishes, and customer retention metrics instantly on one dashboard.",
    color: "text-teal-600",
    bg: "bg-teal-50/50",
    border: "group-hover:border-teal-200/60",
  },
];

export default function ValueProposition() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={containerRef}
      id="value-proposition"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/20 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <SectionHeading
            tag="Features Core"
            title="One platform. Complete restaurant infrastructure."
            subtitle="Everything you need to run, grow, and own your digital restaurant — without writing a single line of code."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <motion.div key={idx} variants={fadeInUp}>
                  <GlassCard
                    className={`p-8 h-full flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(22,163,74,0.06)] ${feat.border}`}
                  >
                    <div className="space-y-5">
                      <div
                        className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center border border-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className={`w-6 h-6 ${feat.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 leading-snug">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed font-light">
                        {feat.desc}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
