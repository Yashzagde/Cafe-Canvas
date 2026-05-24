"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { staggerContainer } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const faqs = [
  {
    question: "Do you take a commission on orders?",
    answer: "No. We take absolute zero commission on orders. All online transactions (UPI, credit cards, wallets) are routed directly to your Razorpay account. You only pay standard payment gateway processing fees (~2%).",
  },
  {
    question: "Can I use my own domain name?",
    answer: "Yes, fully supported. You can point your custom domain or subdomain (e.g., order.yourcafe.com) to our servers via CNAME. We also auto-generate and manage free SSL security certificates for you.",
  },
  {
    question: "How long does it take to go live?",
    answer: "You can go live in under 24 hours. Simply create an account, upload your food menu items with pricing, connect your bank details, select a layout theme, and you're ready to share your ordering link.",
  },
  {
    question: "What happens if I want to change my theme?",
    answer: "You can switch between any of our 52 premium themes with one click. Your menus, prices, and categories stay completely intact. Your storefront updates instantly without touching any code.",
  },
  {
    question: "Do my customers need to download an app?",
    answer: "No app download required. Diners scan the QR code on their tables or click your digital link to open the menu instantly in their mobile browser, logging in with a friction-free WhatsApp OTP.",
  },
  {
    question: "What payment methods are supported?",
    answer: "We support the native Indian payment stack out of the box through Razorpay: UPI (GPay, PhonePe, Paytm), RuPay & credit cards, netbanking, digital wallets, and Buy Now Pay Later (BNPL) options.",
  },
  {
    question: "Can I manage multiple branches?",
    answer: "Yes. Cafe Canvas is fully multi-outlet ready. From a centralized master dashboard, you can push menu updates, adjust pricing, monitor sales volume, and check analytics across all your branches.",
  },
  {
    question: "What if I already have a website?",
    answer: "You can easily integrate your ordering store. Link your existing website's 'Order Online' buttons to your custom Cafe Canvas ordering domain, maintaining your homepage brand look.",
  },
  {
    question: "Is my customer data safe and private?",
    answer: "Completely. Unlike food delivery aggregators who lock customer contact details, Cafe Canvas stores all names and mobile phone numbers exclusively for your restaurant CRM database. Your lists belong 100% to you.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer 24/7 dedicated support. You can reach our team via phone at +91 8408060787, email at help@cafecanvas.bar, or direct WhatsApp chat for quick resolution on any technical queries.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="relative py-24 md:py-32 overflow-hidden bg-stone-50/40 border-t border-stone-200/50"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-12"
        >
          <SectionHeading
            tag="Support FAQ"
            title="Questions we hear most often."
            subtitle="Get clear, direct answers about pricing gateway fees, setups, domains, and CRM data management."
          />

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <GlassCard
                  key={idx}
                  className="overflow-hidden border border-white/60"
                  hoverEffect={false}
                >
                  <button
                    id={`faq-header-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${idx}`}
                    onClick={() => toggle(idx)}
                    className="w-full py-6 px-6 text-left flex items-center justify-between text-base font-bold text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-t-2xl transition duration-200 select-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-5 h-5 text-stone-550" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-content-${idx}`}
                        role="region"
                        aria-labelledby={`faq-header-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 px-6 text-sm text-stone-600 font-sans font-light leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
