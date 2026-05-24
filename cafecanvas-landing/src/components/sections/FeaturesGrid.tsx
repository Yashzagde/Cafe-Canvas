"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Paintbrush,
  QrCode,
  MessageSquare,
  BadgePercent,
  Users,
  Megaphone,
  BarChart3,
  CreditCard,
  Globe,
  Building2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const features = [
  {
    icon: Paintbrush,
    title: "50+ Restaurant Themes",
    desc: "From Nordic minimal to Mughal gold — customize your digital storefront with curated designs in under 10 seconds. No developer or code edits required.",
    size: "col-span-1 md:col-span-2",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: QrCode,
    title: "QR Table Ordering",
    desc: "Table scan-to-order routing directly to kitchen display tablets.",
    size: "col-span-1",
    color: "text-orange-500 bg-orange-50",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp OTP Login",
    desc: "Passwordless customer registration that boosts checkout speeds.",
    size: "col-span-1",
    color: "text-green-500 bg-emerald-50",
  },
  {
    icon: BadgePercent,
    title: "Zero Commission Orders",
    desc: "Say goodbye to aggregators taking 30% cuts. All revenue is routed directly to your Razorpay integration. We charge 0% on transactions.",
    size: "col-span-1 md:col-span-2",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: Users,
    title: "CRM & Customer Lists",
    desc: "Own your data. View visit metrics, order history, and dish reviews.",
    size: "col-span-1",
    color: "text-rose-500 bg-rose-50",
  },
  {
    icon: Megaphone,
    title: "WhatsApp Broadcast",
    desc: "Launch promotional alerts directly to your customers' mobile chat.",
    size: "col-span-1",
    color: "text-indigo-500 bg-indigo-50",
  },
  {
    icon: CreditCard,
    title: "UPI & Card Payments",
    desc: "Built natively for UPI, RuPay, credit cards, netbanking, and wallets.",
    size: "col-span-1",
    color: "text-teal-600 bg-teal-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Insights Dashboard",
    desc: "Track sales volume, food item trends, peak hours, and server performance metrics instantly from one connected command center.",
    size: "col-span-1 md:col-span-2",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Globe,
    title: "Custom Domain CNAME",
    desc: "Connect your branded domain with free, automated SSL certificates.",
    size: "col-span-1",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: Building2,
    title: "Multi-Branch Dashboard",
    desc: "Control menus, prices, and stats across 10 locations from one tab.",
    size: "col-span-1",
    color: "text-violet-500 bg-violet-50",
  },
  {
    icon: Sparkles,
    title: "AI Blog & Menu Copywriter",
    desc: "Auto-generate engaging copy for your restaurant website and items.",
    size: "col-span-1",
    color: "text-purple-500 bg-purple-50",
  },
  {
    icon: TrendingUp,
    title: "Upsell Recommendation Engine",
    desc: "Smart menu upsells at checkout to increase average order values.",
    size: "col-span-1",
    color: "text-cyan-500 bg-cyan-50",
  },
];

export default function FeaturesGrid() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={containerRef}
      id="features-grid"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/20 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <SectionHeading
            tag="Platform Scope"
            title="Built for how restaurants actually work."
            subtitle="Every single digital tool you need to run, scale, and analyze your hospitality business, packed in a single responsive command dashboard."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div key={idx} variants={fadeInUp} className={feat.size}>
                  <GlassCard className="p-8 h-full flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(22,163,74,0.06)] hover:border-green-200/40">
                    <div className="space-y-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center border border-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 font-sans">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-light">
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
