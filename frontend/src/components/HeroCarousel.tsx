'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, UtensilsCrossed, CalendarDays, ShoppingBag } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroCarousel({ 
  cafeName,
  heroImageUrl,
  heroImageUrl2,
  heroImageUrl3,
  heroTitle,
  heroSubtitle,
  heroTitle2,
  heroSubtitle2,
  heroTitle3,
  heroSubtitle3
}: { 
  cafeName: string;
  heroImageUrl?: string | null;
  heroImageUrl2?: string | null;
  heroImageUrl3?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroTitle2?: string | null;
  heroSubtitle2?: string | null;
  heroTitle3?: string | null;
  heroSubtitle3?: string | null;
}) {
  const slides = [
    {
      bg: heroImageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      headline: heroTitle || 'Welcome to Cafe Canvas',
      sub: heroSubtitle || 'Artisan coffee, handcrafted meals, and warm boutique hospitality.',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      cta1: { text: 'Order Now', href: '#menu-section' },
      cta2: { text: 'View Menu', href: '#menu-section' }
    },
    {
      bg: heroImageUrl2 || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=80',
      headline: heroTitle2 || "Our Barista's Masterpieces",
      sub: heroSubtitle2 || 'Every cup is a canvas. Discover our premium organic blends and slow pour-overs.',
      icon: <CalendarDays className="w-5 h-5" />,
      cta1: { text: 'Book Table', href: '#checkout-trigger' },
      cta2: { text: 'Explore Blends', href: '#menu-section' }
    },
    {
      bg: heroImageUrl3 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      headline: heroTitle3 || 'Hot Delights at Your Table',
      sub: heroSubtitle3 || 'Freshly baked pastries and signature thalis prepared live in our kitchen.',
      icon: <ShoppingBag className="w-5 h-5" />,
      cta1: { text: 'Dine-In QR', href: '#menu-section' },
      cta2: { text: 'Our Story', href: '/about' }
    }
  ];

  return (
    <div className="w-full relative h-[65vh] min-h-[530px] md:h-[75vh] md:min-h-[460px] rounded-3xl overflow-hidden shadow-lg border border-[var(--border-color)] select-none bg-[var(--background)]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, bulletClass: 'custom-bullet', bulletActiveClass: 'custom-bullet-active' }}
        loop
        className="w-full h-full"
      >
        {slides.map((s, i) => {
          const resolvedHeadline = s.headline.replace('Cafe Canvas', cafeName);
          return (
            <SwiperSlide key={i} className="w-full h-full relative">
              <div className="w-full h-full flex flex-col md:block relative overflow-hidden">
                {/* Cover Image */}
                <div
                  className="w-full h-[250px] md:h-full md:absolute md:inset-0 bg-cover bg-center transform scale-105 hover:scale-100 transition-transform duration-10000 shrink-0"
                  style={{ backgroundImage: `url(${s.bg})` }}
                />
                
                {/* Dynamic Gradient Tint Overlays */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[250px] z-10 md:hidden"
                  style={{ background: 'linear-gradient(to top, var(--card-bg) 0%, transparent 80%, rgba(0,0,0,0.15) 100%)' }}
                />
                <div 
                  className="absolute inset-0 z-10 hidden md:block"
                  style={{ background: 'linear-gradient(to right, var(--card-bg) 0%, var(--card-bg) 35%, transparent 100%)' }}
                />

                {/* Slide Content with Layered Panel */}
                <div className="relative z-20 flex-grow md:flex-initial flex flex-col justify-center px-6 pb-12 pt-8 md:py-0 md:px-16 max-w-2xl text-[var(--foreground)] space-y-3.5 bg-[var(--card-bg)] rounded-t-[28px] -mt-6 md:rounded-none md:mt-0 md:bg-transparent md:h-full">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-[var(--brand)] w-fit self-start animate-fade-in">
                    {s.icon}
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand)]">
                      Boutique Experience
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-5xl font-display font-extrabold leading-tight text-[var(--foreground)]">
                    {resolvedHeadline}
                  </h1>
                  
                  <p className="text-xs md:text-base text-[var(--foreground)] opacity-80 font-medium max-w-lg leading-relaxed">
                    {s.sub}
                  </p>

                  <div className="flex flex-wrap gap-3.5 pt-3">
                    <a
                      href={s.cta1.href}
                      className="inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-[var(--brand)] hover:opacity-90 text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95"
                    >
                      <span>{s.cta1.text}</span>
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </a>
                    <a
                      href={s.cta2.href}
                      className="inline-flex items-center px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-[var(--border-color)] text-[var(--foreground)] text-xs font-extrabold uppercase tracking-wider hover:bg-[var(--foreground)]/5 transition-all"
                    >
                      {s.cta2.text}
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Global CSS for Custom Bullets */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 24px !important;
        }
        .custom-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: var(--foreground);
          opacity: 0.3;
          margin: 0 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .custom-bullet-active {
          width: 24px;
          background: var(--brand) !important;
          opacity: 1;
          box-shadow: 0 0 8px var(--brand);
        }
      `}</style>
    </div>
  );
}
