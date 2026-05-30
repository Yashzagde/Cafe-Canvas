"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertCircle, ShoppingBag } from "lucide-react";

const ICONS = {
  success: <Check className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  cart: <ShoppingBag className="w-4 h-4" />,
};

const COLORS = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  cart: "bg-brand-50 border-brand-200 text-brand-800",
};

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`toast flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all duration-300 ${
        COLORS[type] || COLORS.success
      } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
    >
      {ICONS[type] || ICONS.success}
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
