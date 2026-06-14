'use client'

import { useState, useEffect } from 'react'

interface HeroSlide {
  image_url: string | null
  title?:    string | null
  subtitle?: string | null
}

export function HeroSection({ slides, storeName }: { slides: HeroSlide[]; storeName: string }) {
  const [current, setCurrent] = useState(0)

  const defaultSlides = [
    {
      image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      title: `Welcome to ${storeName}`,
      subtitle: 'Artisan coffee, handcrafted meals, and warm hospitality.'
    }
  ]

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % activeSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [activeSlides.length])

  return (
    <div className="w-full relative h-[60vh] min-h-[400px] overflow-hidden bg-gray-950">
      {activeSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Cover Image */}
          <div
            className="w-full h-full bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: `url(${slide.image_url || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'})`
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 md:pb-20 md:px-16 max-w-2xl text-white space-y-3 select-none">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              {slide.title || `Welcome to ${storeName}`}
            </h1>
            <p className="text-sm md:text-lg opacity-90 max-w-lg leading-relaxed font-medium drop-shadow-sm">
              {slide.subtitle || 'Artisan coffee, handcrafted meals, and warm hospitality.'}
            </p>
            <div className="pt-3">
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Explore Menu
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              style={i === current ? { backgroundColor: 'var(--primary)' } : {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
