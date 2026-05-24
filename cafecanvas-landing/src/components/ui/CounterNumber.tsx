"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface CounterNumberProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function CounterNumber({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: CounterNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration: 2.2,
        ease: [0.25, 0.1, 0.25, 1], // ease-out-cubic equivalent
        onUpdate: (value) => setCount(value),
      });
      return () => controls.stop();
    }
  }, [isInView, target]);

  const formattedValue = count.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
