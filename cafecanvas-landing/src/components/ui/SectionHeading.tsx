"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface SectionHeadingProps {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  titleClassName?: string;
}

export default function SectionHeading({
  tag,
  title,
  subtitle,
  align = "center",
  titleClassName = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`max-w-3xl mb-16 space-y-4 ${
        isCenter ? "mx-auto text-center" : "text-left"
      }`}
    >
      {tag && (
        <motion.span
          variants={fadeInUp}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200/50 uppercase tracking-wider"
        >
          {tag}
        </motion.span>
      )}
      <motion.h2
        variants={fadeInUp}
        className={`text-3xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight font-serif ${titleClassName}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeInUp}
          className="text-base sm:text-lg text-stone-600 font-sans font-light leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
