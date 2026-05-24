"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function WhatIsCafeCanvas() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const points = [
    {
      title: "Smart POS & Billing",
      desc: "Accelerate tableside or counter operations. Process digital, cash, and card orders with instant compliant invoicing."
    },
    {
      title: "Self-Serve QR Menus",
      desc: "Guests scan, browse, and place orders directly from their tables. Reduces staff load and improves check averages."
    },
    {
      title: "Advanced Inventory control",
      desc: "Real-time stock alerts, recipe-level mapping, and automated reorder alerts to reduce food wastage."
    },
    {
      title: "Unified Staff Schedules",
      desc: "Attendance monitoring, roles and permissions setups, and integrated payroll estimates in one panel."
    },
    {
      title: "Analytical Operations",
      desc: "Identify peak hours, high-margin menu items, and outlet performance dynamically from anywhere."
    },
    {
      title: "CRM & Customer Loyalty",
      desc: "Maintain profiles, trigger promotional marketing campaigns, and design loyalty point models."
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-white text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        {/* Left Side: Copy */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              Unified Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
              A Complete Operating System for Hospitality.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hospitality businesses lose significant revenue due to disconnected legacy systems. CafeCanvas integrates every key function of your restaurant, pub, bar, or cafe into a single, reliable hub.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gray-50 border border-gray-100 rounded-xl space-y-3"
          >
            <h4 className="font-bold text-gray-900 text-sm">💡 Operational Intelligence</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              No spreadsheets, no manual reconciliations. CafeCanvas connects your front-of-house (POS, QR ordering) to back-of-house (kitchen, inventory, payroll) in real-time.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Features Grid */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
          {points.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="p-6 bg-white border border-gray-200 hover:border-gray-300 rounded-xl hover:shadow-sm transition"
            >
              <h3 className="font-bold text-gray-900 text-base mb-2">{point.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
