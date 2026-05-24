"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export default function GlassSelect({ label, id, options, ...props }: GlassSelectProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-white/60"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="w-full appearance-none px-[18px] py-[14px] bg-white/[0.06] border border-white/[0.12] rounded-xl text-white text-[15px] font-sans focus:outline-none focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)] focus:bg-white/[0.09] transition-all duration-200 cursor-pointer"
          {...props}
        >
          <option value="" className="bg-[#0A0F1C] text-white/50">Select venue type</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0A0F1C] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
