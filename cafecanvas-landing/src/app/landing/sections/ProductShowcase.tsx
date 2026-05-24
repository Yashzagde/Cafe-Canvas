"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function ProductShowcase() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [activePreview, setActivePreview] = useState("pos");

  const mockups = [
    {
      id: "pos",
      label: "Billing Interface",
      title: "Fast POS Billing System",
      desc: "Split bills by guest or item, apply discounts instantly, handle GST rules, and auto-print to KDS with a single tap.",
      details: ["UPI, Card & Cash reconciliation", "Custom taxes and service charges", "Offline operations support"]
    },
    {
      id: "analytics",
      label: "Analytics System",
      title: "Real-time Sales Insights",
      desc: "Understand peak hours, optimize menu prices, monitor raw food wastage, and oversee multi-outlet growth centrally.",
      details: ["Food margin analytics", "Staff productivity scores", "Automatic weekly reports"]
    },
    {
      id: "qr",
      label: "QR Table Ordering",
      title: "Seamless Table Service",
      desc: "Let tables browse the menu, request waiters, and check out instantly on their phones. Auto-syncs to the main POS.",
      details: ["Zero wait ordering", "Custom theme branding", "WhatsApp bill delivery"]
    }
  ];

  const currentMockup = mockups.find((m) => m.id === activePreview)!;

  return (
    <section ref={ref} className="py-24 bg-gray-950 text-gray-100 px-4 border-b border-gray-900">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Product Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            See CafeCanvas in Action.
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Designed to match the high-speed demands of modern hospitality environments.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center border-b border-gray-900 pb-px max-w-md mx-auto">
          <div className="flex w-full justify-between">
            {mockups.map((m) => (
              <button
                key={m.id}
                onClick={() => setActivePreview(m.id)}
                className={`pb-4 px-4 text-sm font-semibold transition border-b-2 cursor-pointer ${
                  activePreview === m.id
                    ? "border-orange-500 text-white font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Showcase panel */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMockup.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {currentMockup.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {currentMockup.desc}
                </p>
                <ul className="space-y-3.5">
                  {currentMockup.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Graphical Mockup Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMockup.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl"
              >
                {/* Simulated Interface Display */}
                {currentMockup.id === "pos" && (
                  <div className="bg-gray-950 rounded-lg p-5 aspect-[16/10] flex flex-col justify-between text-xs font-mono text-gray-400">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                      <span className="font-bold text-white">RECEIPT SIMULATOR</span>
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">ONLINE</span>
                    </div>
                    <div className="flex-1 py-4 space-y-2 border-b border-gray-900/50 border-dashed">
                      <div className="flex justify-between">
                        <span>2x Cappuccino (Custom Milk)</span>
                        <span className="text-gray-300">₹360.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Grilled Veggie Sandwich</span>
                        <span className="text-gray-300">₹240.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Craft Red Ale</span>
                        <span className="text-gray-300">₹290.00</span>
                      </div>
                    </div>
                    <div className="pt-3 space-y-1">
                      <div className="flex justify-between">
                        <span>CGST (9%) + SGST (9%)</span>
                        <span>₹160.20</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-1">
                        <span>Total Due</span>
                        <span className="text-orange-500">₹1,050.20</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentMockup.id === "analytics" && (
                  <div className="bg-gray-950 rounded-lg p-5 aspect-[16/10] flex flex-col justify-between text-xs text-gray-400">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                      <span className="font-bold text-white uppercase tracking-wider">Hourly Performance Chart</span>
                      <span className="text-orange-500 font-bold">LIVE REVENUE</span>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2.5 h-36 pt-4 border-b border-gray-900">
                      {[15, 30, 45, 90, 75, 40].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            style={{ height: `${height}%` }}
                            className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t"
                          />
                          <span className="text-[9px] text-gray-600">{i * 2 + 10} AM</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-between text-[10px] text-gray-500">
                      <span>Top Item: Latte (34% sales)</span>
                      <span>Total margin: 68% avg.</span>
                    </div>
                  </div>
                )}

                {currentMockup.id === "qr" && (
                  <div className="bg-gray-950 rounded-lg p-5 aspect-[16/10] flex items-center justify-center">
                    <div className="max-w-[200px] w-full bg-white text-gray-950 rounded-xl p-4 shadow-lg text-center flex flex-col items-center">
                      {/* CSS QR mock */}
                      <div className="w-20 h-20 bg-gray-950 p-1 flex flex-wrap mb-3">
                        <div className="w-6 h-6 border-2 border-white m-0.5" />
                        <div className="w-6 h-6 border-2 border-white m-0.5" />
                        <div className="w-6 h-6 border-2 border-white m-0.5" />
                        <div className="w-6 h-6 bg-white m-0.5" />
                      </div>
                      <p className="font-bold text-xs">Table 09 Guest Menu</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Scan to order and settle bill</p>
                      <span className="mt-3.5 inline-block w-full py-1 bg-orange-500 text-white font-bold text-[10px] rounded">
                        View Menu List
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
