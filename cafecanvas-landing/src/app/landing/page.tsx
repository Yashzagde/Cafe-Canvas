"use client";

import React, { useState, useCallback } from "react";
import CinematicBackground from "@/components/background/CinematicBackground";
import BrandSplash from "@/components/sections/BrandSplash";
import HeroSection from "@/components/sections/Hero";
import WhatsComing from "@/components/sections/WhatsComing";
import FounderStory from "@/components/sections/FounderStory";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <div className="min-h-screen text-white bg-[#0A0F1C] font-sans selection:bg-green-900/50 selection:text-green-200 overflow-x-hidden relative">
      {/* Full-screen brand reveal splash — plays once */}
      {!splashDone && <BrandSplash onComplete={handleSplashComplete} />}

      {/* Fixed cinematic hospitality background */}
      <CinematicBackground />

      <main>
        {/* 01. Hero — headline + single CTA */}
        <HeroSection />

        {/* 02. What's coming — Feature cards with CafeCanvas info */}
        <WhatsComing />

        {/* 03. Founder story — Photo + narrative */}
        <FounderStory />

        {/* 04. Final conversion CTA */}
        <FinalCTA />
      </main>

      {/* 05. Footer — Minimal */}
      <Footer />
    </div>
  );
}
