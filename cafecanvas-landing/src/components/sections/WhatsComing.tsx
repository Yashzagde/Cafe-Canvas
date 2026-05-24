"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Paintbrush,
  Users,
  QrCode,
  BarChart3,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Globe,
  CreditCard,
  ClipboardList,
  Megaphone,
  Zap,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const featureCards = [
  {
    icon: Globe,
    emoji: "🎨",
    title: "Your Own Branded Online Store",
    body: "Launch a fully branded restaurant website on your own custom domain. Choose from 52 premium themes designed for Indian hospitality — cafes, fine dining, bars, pubs, cloud kitchens. Go live in under 24 hours with zero developers needed.",
    tags: ["52 Themes", "Custom Domain", "Go Live in 24hrs"],
  },
  {
    icon: QrCode,
    emoji: "📱",
    title: "QR Table Ordering & Digital Menu",
    body: "Let customers scan, browse your full menu, customize orders, and pay — all from their phone. No app download required. Works for dine-in, takeaway, and delivery. WhatsApp OTP login for frictionless access.",
    tags: ["QR Ordering", "Digital Menu", "No App Needed"],
  },
  {
    icon: CreditCard,
    emoji: "₹",
    title: "Zero Commission. Always.",
    body: "Every order processed through Razorpay — UPI, credit cards, debit cards, wallets, netbanking, and Buy Now Pay Later. You keep 100% of every rupee. No platform tax. No hidden charges. No revenue sharing.",
    tags: ["Razorpay", "UPI", "Zero Commission"],
  },
  {
    icon: Users,
    emoji: "👥",
    title: "Own Your Customer Data & CRM",
    body: "Every customer who orders belongs to you — not a platform. Built-in CRM captures phone numbers, order history, preferences, and visit frequency. Run WhatsApp broadcasts, loyalty programs, and targeted campaigns directly.",
    tags: ["CRM", "WhatsApp Broadcast", "Loyalty Programs"],
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Real-Time Analytics & Insights",
    body: "Live dashboard with revenue tracking, bestseller analysis, peak hour heatmaps, table turnover rates, and customer lifetime value. Know exactly what's working and where to double down — updated in real time.",
    tags: ["Live Dashboard", "Revenue Analytics", "Bestseller Reports"],
  },
  {
    icon: ClipboardList,
    emoji: "📋",
    title: "Inventory & Staff Management",
    body: "Track raw materials, set low-stock alerts, manage recipes with auto-deduction. Assign staff roles, monitor attendance, and get real-time kitchen alerts. One platform for your entire back-of-house operation.",
    tags: ["Inventory Tracking", "Staff Roles", "Kitchen Alerts"],
  },
];

const additionalFeatures = [
  { icon: Smartphone, label: "Mobile-First Design" },
  { icon: ShieldCheck, label: "Bank-Grade Security" },
  { icon: MessageCircle, label: "WhatsApp OTP Login" },
  { icon: Megaphone, label: "Marketing Campaigns" },
  { icon: Zap, label: "AI Menu Suggestions" },
  { icon: Paintbrush, label: "Custom Branding" },
];

export default function WhatsComing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 z-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-16"
        >
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400 tracking-widest uppercase mb-4"
            >
              <Zap className="w-3.5 h-3.5" />
              The Complete Hospitality OS
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-serif"
            >
              Everything your restaurant needs.
              <br />
              <span className="text-white/50">Nothing you don{"'"}t.</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-white/60 font-sans font-light leading-relaxed"
            >
              Cafe Canvas is launching with the complete infrastructure stack
              for restaurants, cafes, bars, pubs, clubs, and cloud kitchens who
              are done paying platform tax.
            </motion.p>
          </div>

          {/* 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="glass-dark glass-dark-hover p-7 flex flex-col"
              >
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-3xl select-none">
                  {card.emoji}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mt-5 font-serif leading-snug">
                  {card.title}
                </h3>

                {/* Body */}
                <p className="text-[13px] text-white/55 leading-relaxed mt-3 font-sans font-light flex-1">
                  {card.body}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Features Row */}
          <motion.div variants={fadeInUp} className="pt-4">
            <p className="text-center text-xs text-white/40 uppercase tracking-widest font-semibold mb-6">
              And so much more
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {additionalFeatures.map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs font-medium hover:bg-white/[0.10] hover:text-white/80 transition-all duration-200"
                >
                  <feat.icon className="w-3.5 h-3.5 text-green-400" />
                  {feat.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <a
              href="#preregister"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm rounded-full shadow-lg shadow-green-900/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              Pre-register Now
              <span className="text-white/60">→</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
