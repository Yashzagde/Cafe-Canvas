"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import ProblemSection from "@/components/sections/ProblemSection";
import ValueProposition from "@/components/sections/ValueProposition";
import HowItWorks from "@/components/sections/HowItWorks";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import ThemeShowcase from "@/components/sections/ThemeShowcase";
import SocialProof from "@/components/sections/SocialProof";
import RestaurantImage from "@/components/sections/RestaurantImage";
import Testimonials from "@/components/sections/Testimonials";
import FounderStory from "@/components/sections/FounderStory";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-stone-900 bg-stone-50/50 font-sans selection:bg-green-100 selection:text-green-800 overflow-x-hidden relative">
      
      {/* 1. Global Sticky Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section with floating phones */}
        <Hero />

        {/* 3. Infinite Client Marquee */}
        <TrustBar />

        {/* 4. Problem & Pain points */}
        <ProblemSection />

        {/* 5. Asymmetric value props */}
        <ValueProposition />

        {/* 6. Process Flow */}
        <HowItWorks />

        {/* 7. Bento grid features */}
        <FeaturesGrid />

        {/* 8. 52-Themes showcase slider */}
        <ThemeShowcase />

        {/* 9. Scroll Counters */}
        <SocialProof />

        {/* 10. Immersive banner banner */}
        <RestaurantImage />

        {/* 11. Customer feedback cards */}
        <Testimonials />

        {/* 12. Yash Zagade founder notes */}
        <FounderStory />

        {/* 13. Accordion accordion FAQ */}
        <FAQ />

        {/* 14. Conversion CTA block */}
        <FinalCTA />
      </main>

      {/* 15. Standard brand footer links */}
      <Footer />
    </div>
  );
}
