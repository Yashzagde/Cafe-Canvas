"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-gray-950 pt-32 pb-24 px-4 overflow-hidden border-b border-gray-900">
      {/* Soft gradient background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left column: Typography & CTAs */}
        <div className="lg:col-span-6 text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-orange-400 border border-gray-800">
              ✨ The Hospitality Operating System
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Run Your Hospitality <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                Business Smarter.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl">
              CafeCanvas helps restaurants, cafes, bars, pubs, and clubs manage billing, analytics, inventory, staff, and customer operations through one connected platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="#pricing">
              <button className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/20 transition cursor-pointer text-sm">
                Choose Membership
              </button>
            </Link>
            <Link href="/auth?mode=login">
              <button className="px-6 py-3.5 bg-gray-900 hover:bg-gray-850 text-gray-200 border border-gray-800 rounded-lg font-bold transition cursor-pointer text-sm">
                Sign In
              </button>
            </Link>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-900 max-w-md"
          >
            {[
              { val: "99.9%", label: "System Uptime" },
              { val: "10x", label: "Operations Speed" },
              { val: "18%", label: "Average Profit ↑" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xl font-black text-white">{stat.val}</p>
                <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column: Dashboard Preview Mockup */}
        <div className="lg:col-span-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative bg-gray-900 border border-gray-800 p-2 rounded-2xl shadow-2xl shadow-black/80 max-w-xl mx-auto overflow-hidden group"
          >
            {/* Window controls */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-850">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-gray-600 font-bold ml-2">CafeCanvas POS - Smart Suite</span>
            </div>

            <div className="relative aspect-[16/10] w-full bg-gray-950 overflow-hidden">
              <Image
                src="/images/pos_dashboard_ui.png"
                alt="CafeCanvas SaaS POS Terminal & Operational Analytics Dashboard preview"
                fill
                className="object-cover opacity-90 group-hover:scale-102 transition duration-700"
                priority
              />
            </div>

            {/* Float UI card overlay (Billing stats notification card) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-6 left-[-20px] bg-gray-900/90 border border-gray-800 backdrop-blur p-4 rounded-xl shadow-lg hidden md:flex items-center gap-3.5 max-w-xs"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl text-orange-400 font-bold">
                ₹
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Live Daily Revenue</p>
                <p className="text-base font-black text-white">₹78,420.00</p>
                <span className="text-[10px] text-green-500 font-bold">↑ 14.2% peak order speed</span>
              </div>
            </motion.div>

            {/* Float UI card overlay 2 (Active Tables status card) */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-12 right-[-20px] bg-gray-900/90 border border-gray-800 backdrop-blur p-4 rounded-xl shadow-lg hidden md:flex items-center gap-3.5 max-w-xs"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <div>
                <p className="text-xs font-bold text-white">14 Tables Active</p>
                <p className="text-[10px] text-gray-400">QR Self-checkout enabled</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
