"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-stone-100/40 backdrop-blur-xl pt-20 pb-10 border-t border-stone-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-stone-200">
              <Image
                src="/images/logo.jpg"
                alt="CafeCanvas Brand Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-sans">
              Cafe<span className="text-green-600">Canvas</span>
            </span>
          </div>
          <p className="text-stone-600 max-w-sm text-base font-light leading-relaxed">
            The premium restaurant operating system built for modern hospitality brands. Take back control of your operations, menu, and customer lists.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 mb-6 uppercase tracking-wider text-xs">Product</h4>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li>
              <a href="#platform" className="hover:text-green-650 transition-colors">POS Billing</a>
            </li>
            <li>
              <a href="#platform" className="hover:text-green-655 transition-colors">QR Table Orders</a>
            </li>
            <li>
              <a href="#platform" className="hover:text-green-650 transition-colors">Inventory Suite</a>
            </li>
            <li>
              <a href="#platform" className="hover:text-green-650 transition-colors">Themes Catalog</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 mb-6 uppercase tracking-wider text-xs">Contact & Info</h4>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li>
              <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-widest">Support Line</span>
              <a href="tel:+918408060787" className="hover:text-green-650 transition-colors">
                +91 8408060787
              </a>
            </li>
            <li>
              <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-widest">Email</span>
              <a href="mailto:help@cafecanvas.bar" className="hover:text-orange-655 transition-colors">
                help@cafecanvas.bar
              </a>
            </li>
            <li>
              <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-widest">Web Link</span>
              <a href="https://cafecanvas.bar" target="_blank" rel="noopener noreferrer" className="hover:text-green-650 transition-colors">
                cafecanvas.bar
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between pt-8 border-t border-stone-200/60 text-xs text-stone-500 relative z-10">
        <p>© {new Date().getFullYear()} CafeCanvas. Made in India. All rights reserved.</p>
        <p className="mt-2 md:mt-0 font-medium text-stone-600">Built for Hospitality by Yash Zagade.</p>
      </div>
    </footer>
  );
}
