"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function GlassButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: GlassButtonProps) {
  const baseStyles =
    "px-8 py-4 font-bold rounded-full text-base transition-all duration-350 select-none flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/15",
    secondary:
      "bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/80 text-stone-850 shadow-sm",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
