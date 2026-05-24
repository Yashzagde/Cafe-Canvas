"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

export default function Pricing() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const plans = [
    {
      name: "Starter",
      price: "₹1,499",
      period: "/month",
      suitability: "Best for single small cafes or food trucks",
      features: [
        "1 POS Billing Terminal",
        "Digital Menu & QR Table Ordering",
        "Basic Sales Reporting",
        "Up to 5 Employees",
        "Standard Email Support"
      ],
      ctaColor: "bg-gray-900 text-white hover:bg-gray-850 border border-gray-800"
    },
    {
      name: "Growth",
      price: "₹2,999",
      period: "/month",
      suitability: "Designed for scaling cafes and busy dine-in bistros",
      features: [
        "2 POS Billing Terminals",
        "Advanced Inventory & Recipe Tracking",
        "QR Table Ordering & Waiter Calling",
        "Up to 15 Employees",
        "CRM & Customer Loyalty module",
        "24/7 Phone & Email Support"
      ],
      ctaColor: "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
      popular: true
    },
    {
      name: "Scale",
      price: "₹5,499",
      period: "/month",
      suitability: "Perfect for high-volume bars, clubs, and multi-outlet operations",
      features: [
        "5 POS Billing Terminals",
        "Multi-Outlet Inventory Syncing",
        "WhatsApp / SMS Invoice Automations",
        "KDS (Kitchen Display System) linking",
        "Unlimited Staff Members",
        "Dedicated Account Executive"
      ],
      ctaColor: "bg-gray-900 text-white hover:bg-gray-850 border border-gray-800"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      suitability: "Enterprise chains requiring bespoke feature developments",
      features: [
        "Unlimited POS Terminals",
        "Custom ERP/Accounting integrations",
        "SLA Guarantee & Dedicated Servers",
        "Custom branding & white-label menus",
        "Quarterly business reviews",
        "On-site deployment & support training"
      ],
      ctaColor: "bg-gray-900 text-white hover:bg-gray-850 border border-gray-800"
    }
  ];

  return (
    <section id="pricing" ref={ref} className="py-24 bg-white text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Membership Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Predictable Pricing for Growing Businesses.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Select a workspace subscription tier tailored to your scale of operations. No hidden platform margins.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className={`p-8 bg-gray-50 border rounded-xl flex flex-col justify-between relative transition hover:shadow-lg ${
                plan.popular ? "border-2 border-orange-500 shadow-md shadow-orange-500/5 bg-white" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-gray-950 text-xl">{plan.name}</h3>
                  <p className="text-gray-500 text-xs mt-1 min-h-[32px]">{plan.suitability}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-gray-950">{plan.price}</span>
                  <span className="text-gray-500 text-sm font-semibold">{plan.period}</span>
                </div>

                <ul className="space-y-3.5 border-t border-gray-200 pt-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                      <span className="text-orange-500 font-bold text-xs mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-auto">
                <Link href={`/auth?plan=${plan.name}`}>
                  <button className={`w-full py-2.5 rounded-lg font-bold text-xs transition cursor-pointer ${plan.ctaColor}`}>
                    Choose Plan
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
