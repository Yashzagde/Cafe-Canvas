"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider({ images = [], fallbackEmoji = "🍽️" }) {
  // If no images are provided, generate beautiful gradient slide placeholders
  const slides = images.length > 0 ? images : [
    { type: "gradient", from: "from-amber-100", to: "to-orange-100", emoji: fallbackEmoji },
    { type: "gradient", from: "from-orange-100", to: "to-red-100", emoji: "🌿" },
    { type: "gradient", from: "from-yellow-100", to: "to-amber-100", emoji: "✨" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Minimum distance required to trigger a swipe
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // Setup auto-scroll interval (2s)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 2500); // 2.5s is slightly gentler than 2s but extremely active

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, slides.length]);

  // Touch handlers for swipe support
  const onTouchStart = (e) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-surface-50 group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Wrapper */}
      <div
        className="w-full h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative select-none">
            {typeof slide === "string" || (slide && slide.url) ? (
              <img
                src={typeof slide === "string" ? slide : slide.url}
                alt={`Food Slide ${index + 1}`}
                className="w-full h-full object-cover"
                draggable="false"
              />
            ) : (
              /* Beautiful Placeholder Gradient Slide */
              <div className={`w-full h-full bg-gradient-to-br ${slide.from} ${slide.to} flex items-center justify-center`}>
                <span className="text-7xl animate-bounce duration-[3000ms] opacity-60">
                  {slide.emoji}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-surface-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-surface-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
