"use client";

import React from "react";
import Image from "next/image";

export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0A0F1C]">
      {/* Layer 1: 6-Image Hospitality Collage */}

      {/* Image 1: Premium Restaurant — large left panel */}
      <div className="absolute top-0 left-0 w-full h-[50%] sm:w-1/2 sm:h-full lg:w-[40%] overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <Image
            src="/images/bg/restaurant.png"
            alt="Premium fine dining restaurant"
            fill
            className="object-cover animate-ken-burns-1"
            priority
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </div>

      {/* Image 2: Cafe — top center */}
      <div className="hidden sm:block absolute top-0 left-1/2 lg:left-[40%] w-1/2 lg:w-[30%] h-[33.33%] overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="/images/bg/cafe.png"
            alt="Premium cafe interior"
            fill
            className="object-cover animate-ken-burns-2"
            sizes="(min-width: 1024px) 30vw, 50vw"
          />
        </div>
      </div>

      {/* Image 3: Bar — center middle */}
      <div className="hidden sm:block absolute top-[33.33%] left-1/2 lg:left-[40%] w-1/2 lg:w-[30%] h-[33.33%] overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="/images/bg/bar.png"
            alt="Upscale cocktail bar"
            fill
            className="object-cover animate-ken-burns-3"
            sizes="(min-width: 1024px) 30vw, 50vw"
          />
        </div>
      </div>

      {/* Image 4: Nightclub / Dancing — bottom center */}
      <div className="hidden sm:block absolute bottom-0 left-1/2 lg:left-[40%] w-1/2 lg:w-[30%] h-[33.34%] overflow-hidden">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/images/bg/nightclub.png"
            alt="Nightclub dance floor"
            fill
            className="object-cover blur-[1px] animate-ken-burns-4"
            sizes="(min-width: 1024px) 30vw, 50vw"
          />
        </div>
      </div>

      {/* Image 5: Pub — top right, desktop only */}
      <div className="hidden lg:block absolute top-0 right-0 w-[30%] h-1/2 overflow-hidden">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/images/bg/pub.png"
            alt="Cozy pub interior"
            fill
            className="object-cover blur-[1px] animate-ken-burns-5"
            sizes="30vw"
          />
        </div>
      </div>

      {/* Image 6: Drinks — bottom right, desktop only */}
      <div className="hidden lg:block absolute bottom-0 right-0 w-[30%] h-1/2 overflow-hidden">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/images/bg/drinks.png"
            alt="Premium craft cocktails"
            fill
            className="object-cover blur-[2px] animate-ken-burns-1"
            sizes="30vw"
          />
        </div>
      </div>

      {/* Mobile: bottom half fallback */}
      <div className="block sm:hidden absolute bottom-0 left-0 w-full h-[50%] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/images/bg/bar.png"
            alt="Bar atmosphere"
            fill
            className="object-cover animate-ken-burns-3"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Layer 2: Cinematic gradient overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(10, 15, 28, 0.65) 0%,
            rgba(10, 15, 28, 0.25) 30%,
            rgba(10, 15, 28, 0.25) 70%,
            rgba(10, 15, 28, 0.80) 100%
          )`,
        }}
      />

      {/* Layer 3: Warm radial accent */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 80% 60% at 65% 40%,
            rgba(249, 115, 22, 0.07) 0%,
            transparent 70%
          )`,
        }}
      />

      {/* Layer 4: Noise texture */}
      <div className="noise-overlay" />
    </div>
  );
}
