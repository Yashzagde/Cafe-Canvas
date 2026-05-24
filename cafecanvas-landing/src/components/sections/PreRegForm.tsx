"use client";

import React, { useRef, useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { staggerContainer, fadeInUp, scaleIn } from "@/lib/animations";
import GlassInput from "@/components/ui/GlassInput";
import GlassSelect from "@/components/ui/GlassSelect";
import CounterNumber from "@/components/ui/CounterNumber";

const venueOptions = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar-pub", label: "Bar & Pub" },
  { value: "food-truck", label: "Food Truck" },
  { value: "cloud-kitchen", label: "Cloud Kitchen" },
  { value: "other", label: "Other" },
];

export default function PreRegForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    restaurantName: "",
    city: "",
    whatsapp: "",
    venueType: "",
  });

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cafecanvas-preregistered");
    if (stored === "true") {
      setIsSubmitted(true);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call (replace with Firestore write later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    localStorage.setItem("cafecanvas-preregistered", "true");
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section
      ref={ref}
      id="preregister"
      className="relative py-24 md:py-32 z-10"
    >
      <div className="max-w-xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Heading */}
          <div className="text-center space-y-4">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-serif"
            >
              Be among the first to go live.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-white/60 font-sans font-light max-w-2xl mx-auto"
            >
              Pre-register today and get early access, priority onboarding, and
              a founding member benefit — exclusively for the first 500
              restaurants.
            </motion.p>
          </div>

          {/* Form Container */}
          <motion.div variants={fadeInUp}>
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="glass-dark-form p-8 md:p-10 space-y-5"
                >
                  <GlassInput
                    label="Your Name"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />

                  <GlassInput
                    label="Restaurant Name"
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    placeholder="Your restaurant's name"
                    required
                    value={formData.restaurantName}
                    onChange={handleChange}
                  />

                  <GlassInput
                    label="City"
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Your city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />

                  <GlassInput
                    label="WhatsApp Number"
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                  />

                  <GlassSelect
                    label="Type of Venue"
                    id="venueType"
                    name="venueType"
                    options={venueOptions}
                    required
                    value={formData.venueType}
                    onChange={handleChange}
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold text-base rounded-full shadow-[0_8px_32px_rgba(22,163,74,0.30)] hover:shadow-[0_16px_48px_rgba(22,163,74,0.40)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Pre-register Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="glass-dark-form p-10 md:p-14 text-center space-y-6"
                >
                  {/* Animated Check Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center"
                  >
                    <Check className="w-10 h-10 text-green-400" strokeWidth={3} />
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white font-serif">
                    You{"'"}re on the list. ✓
                  </h3>

                  <p className="text-base text-white/60 font-sans font-light max-w-md mx-auto leading-relaxed">
                    We{"'"}ll reach out on WhatsApp as soon as Cafe Canvas
                    launches in your city. You{"'"}re one of the first — thank
                    you.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Waitlist Counter */}
          <motion.div
            variants={fadeInUp}
            className="text-center text-sm text-white/50 font-sans flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>
              <CounterNumber
                target={423}
                className="font-semibold text-white/70"
              />{" "}
              restaurants have already pre-registered
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
