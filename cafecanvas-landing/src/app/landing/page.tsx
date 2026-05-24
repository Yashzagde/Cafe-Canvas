"use client";

import React, { useState, useCallback } from "react";
import CinematicBackground from "@/components/background/CinematicBackground";
import BrandSplash from "@/components/sections/BrandSplash";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/Hero";
import WhatsComing from "@/components/sections/WhatsComing";
import FounderStory from "@/components/sections/FounderStory";
import PreRegForm from "@/components/sections/PreRegForm";
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

      {/* Navbar appears after splash */}
      {splashDone && <Navbar />}

      <main>
        {/* 01. Hero — Animated logo + headline + single CTA */}
        <HeroSection />

        {/* 02. What's coming — Feature cards with CafeCanvas info */}
        <WhatsComing />

        {/* 03. Founder story — Photo + narrative */}
        <FounderStory />

        {/* 04. Pre-registration form — The conversion anchor */}
        <PreRegForm />
      </main>

      {/* 05. Footer — Minimal */}
      <Footer />
    </div>
  );
}
