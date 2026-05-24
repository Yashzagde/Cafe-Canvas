"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function FeaturesStory() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const features = [
    {
      title: "Smart Billing",
      desc: "Split bills instantly, customize tax codes (GST ready), handle multiple payment modes (UPI, Cash, Cards), and issue digital receipts.",
      accent: "border-l-4 border-l-orange-500",
      badge: "Fast Operations"
    },
    {
      title: "QR Table Ordering",
      desc: "Allow customers to order directly from their tables. Reduce waiter overhead and double your order turnaround speeds.",
      accent: "border-l-4 border-l-amber-500",
      badge: "Self-Checkout"
    },
    {
      title: "Real-Time Analytics",
      desc: "Track sales margins, peak performance hours, top-selling inventory items, and wait times in a unified dashboard.",
      accent: "border-l-4 border-l-blue-500",
      badge: "Insights"
    },
    {
      title: "Inventory Control",
      desc: "Recipe-level stock deduction, shrinkage checks, auto-reordering models, and purchase order tracking to maintain margins.",
      accent: "border-l-4 border-l-emerald-500",
      badge: "Margins"
    },
    {
      title: "Staff Management",
      desc: "Monitor staff check-ins, configure role-based app logins, track individual waiter tip allocations, and coordinate payroll.",
      accent: "border-l-4 border-l-indigo-500",
      badge: "Team Core"
    },
    {
      title: "Multi-Outlet Control",
      desc: "Coordinate menu changes, brand catalogs, master pricing, and stock transfers across multiple locations from one login.",
      accent: "border-l-4 border-l-purple-500",
      badge: "Scalable"
    },
    {
      title: "Customer Loyalty",
      desc: "Acquire user contacts securely, design customized discount tiers, and launch targeted promotional WhatsApp/Email models.",
      accent: "border-l-4 border-l-rose-500",
      badge: "CRM Tools"
    },
    {
      title: "Operations Automation",
      desc: "Trigger automatic KDS alerts on receipt confirmation. Connect online sales aggregators (Zomato/Swiggy) directly to POS.",
      accent: "border-l-4 border-l-teal-500",
      badge: "Auto Sync"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-white text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Everything Needed to Run Hospitality.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Powering billing operations, menu management, customer relationships, and supply chains for leading outlets.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className={`p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl hover:shadow-md transition flex flex-col justify-between ${feature.accent}`}
            >
              <div className="space-y-4">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-full">
                  {feature.badge}
                </span>
                <h3 className="font-extrabold text-gray-900 text-lg">{feature.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
