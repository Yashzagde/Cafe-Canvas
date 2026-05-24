"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function WhyCafeCanvas() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const points = [
    {
      problem: "Disconnected Software",
      solution: "One Connected Platform",
      desc: "Juggling isolated POS, separate staff tools, and raw Excel sheets causes lost revenue. CafeCanvas handles it all from one cloud workspace."
    },
    {
      problem: "Manual Billing & Leaks",
      solution: "Automated POS Audits",
      desc: "Waiters writing down items results in billing leaks and manual errors. Our smart KDS links table scans directly to POS reconciliation."
    },
    {
      problem: "Inventory Stock Confusion",
      solution: "Recipe-Level Tracking",
      desc: "Unexplained material shrinkage erodes profits. CafeCanvas auto-deducts raw ingredients on order settlements with recipe-mapping."
    },
    {
      problem: "Staff Management Chaos",
      solution: "Role-Based Scheduling",
      desc: "Coordinating shifts manually leads to disputes and empty floors. System assigns rosters based on role metrics and records check-ins."
    },
    {
      problem: "Opaque Performance Reports",
      solution: "Real-Time Centralized Analytics",
      desc: "Reviewing metrics weeks late prevents prompt adjustments. Access instant live reports on margins, outlets, and shifts on the fly."
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50 text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Problem vs. Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Designed for Modern Hospitality Operations.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Old legacy software creates friction and drops sales. CafeCanvas provides a unified platform to plug leaks and optimize performance.
          </p>
        </motion.div>

        {/* Comparison Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Legacy Side */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider px-2">
              ⚠️ Legacy Operations (The Friction)
            </h3>
            <div className="space-y-4">
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 bg-white border border-gray-200 rounded-xl flex gap-4 items-start"
                >
                  <span className="text-red-500 font-bold text-lg mt-0.5">✕</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{p.problem}</h4>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      Lacks real-time linking, requiring staff to cross-verify numbers manually and increasing operational leaks.
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CafeCanvas Side */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wider px-2">
              ✨ With CafeCanvas (The Flow)
            </h3>
            <div className="space-y-4">
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 bg-white border-2 border-orange-500/10 rounded-xl flex gap-4 items-start shadow-sm"
                >
                  <span className="text-green-500 font-bold text-lg mt-0.5">✓</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{p.solution}</h4>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
