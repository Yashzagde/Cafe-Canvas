"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-resting ${
        hoverEffect ? "glass-hover-effect" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
