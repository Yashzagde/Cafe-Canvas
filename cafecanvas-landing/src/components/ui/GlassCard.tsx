"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  variant = "dark",
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  const base = variant === "dark" ? "glass-dark" : "glass-resting";
  const hover = variant === "dark" ? "glass-dark-hover" : "glass-hover-effect";

  return (
    <motion.div
      className={`${base} ${hoverEffect ? hover : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
