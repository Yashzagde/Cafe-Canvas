"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function FounderStory() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 bg-gray-50 text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-4xl mx-auto space-y-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Founder's Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The Vision Behind CafeCanvas
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="bg-white p-8 md:p-12 border border-gray-200 rounded-2xl shadow-sm space-y-6 text-left max-w-3xl mx-auto"
        >
          {/* Quote mark decoration */}
          <span className="text-5xl text-orange-500/20 font-serif leading-none block h-2">“</span>
          
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Yash Zagade founded CafeCanvas to help hospitality businesses modernize operations with better technology and connected systems.
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Many restaurants and cafes still rely on outdated tools that create operational challenges and limit growth. Different software applications that don't speak to each other cause pricing leaks, stock depletion blind spots, and customer service friction.
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            CafeCanvas is designed to simplify operations and help businesses scale more efficiently. By combining billing POS, QR ordering, real-time inventory, and staff rosters, we empower owners to focus on what they do best: serving outstanding hospitality.
          </p>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-gray-950 text-base">Yash Zagade</p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Founder & Creator, CafeCanvas</p>
            </div>
            <div className="text-right text-[11px] text-gray-400 font-medium">
              <p>+91 8408060787</p>
              <p className="mt-0.5 hover:text-orange-500 transition">help@cafecanvas.bar</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
