"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

export default function FinalCTA() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 bg-gray-950 text-gray-100 px-4 text-center relative overflow-hidden border-t border-gray-900">
      {/* Subtle bottom/right glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight"
        >
          One Platform For Modern <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            Hospitality Businesses.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
          className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
        >
          Consolidate your billing POS, tableside QR ordering, staff schedules, and real-time inventory management. Secure your membership today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-4 justify-center pt-4"
        >
          <Link href="#pricing">
            <button className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/15 transition cursor-pointer text-sm">
              Choose Membership
            </button>
          </Link>
          <Link href="/auth?mode=login">
            <button className="px-8 py-3.5 bg-gray-950 hover:bg-gray-900 text-gray-200 border border-gray-800 rounded-lg font-bold transition cursor-pointer text-sm">
              Sign In
            </button>
          </Link>
        </motion.div>

        {/* Footer Brand Info */}
        <div className="pt-16 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} CafeCanvas. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Owner: Yash Zagade</span>
            <span>+91 8408060787</span>
            <span>help@cafecanvas.bar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
