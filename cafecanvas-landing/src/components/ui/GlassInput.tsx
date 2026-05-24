"use client";

import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function GlassInput({ label, id, ...props }: GlassInputProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-white/60"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full px-[18px] py-[14px] bg-white/[0.06] border border-white/[0.12] rounded-xl text-white text-[15px] font-sans placeholder:text-white/30 focus:outline-none focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)] focus:bg-white/[0.09] transition-all duration-200"
        {...props}
      />
    </div>
  );
}
