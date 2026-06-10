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
      icon: <UtensilsCrossed className="w-5 h-5 text-[#FFC9CD]" />,
      cta1: { text: 'Order Now', href: '#menu-section' },
      cta2: { text: 'View Menu', href: '#menu-section' }
    },
    {
      bg: heroImageUrl2 || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=80',
      headline: heroTitle2 || "Our Barista's Masterpieces",
      sub: heroSubtitle2 || 'Every cup is a canvas. Discover our premium organic blends and slow pour-overs.',
      icon: <CalendarDays className="w-5 h-5 text-[#B4F8C8]" />,
      cta1: { text: 'Book Table', href: '#checkout-trigger' },
      cta2: { text: 'Explore Blends', href: '#menu-section' }
    },
    {
      bg: heroImageUrl3 || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      headline: heroTitle3 || 'Hot Delights at Your Table',
      sub: heroSubtitle3 || 'Freshly baked pastries and signature thalis prepared live in our kitchen.',
      icon: <ShoppingBag className="w-5 h-5 text-[#E2C9A3]" />,
      cta1: { text: 'Dine-In QR', href: '#menu-section' },
      cta2: { text: 'Our Story', href: '/about' }
    }
  ];

  return (
    <div className="w-full relative h-[65vh] min-h-[460px] md:h-[75vh] rounded-3xl overflow-hidden shadow-lg border border-[#DEC5A4]/40 select-none bg-[#F7EEE2]">
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
              {/* Cover Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transform scale-105 hover:scale-100 transition-transform duration-10000"
                style={{ backgroundImage: `url(${s.bg})` }}
              />
              
              {/* Glass Gradient Tint Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A3728]/85 via-[#4A3728]/50 to-transparent z-10" />

              {/* Slide Content with Glassmorphic Floating Panel */}
              <div className="relative z-20 flex flex-col justify-center h-full px-6 md:px-16 max-w-2xl text-[#FFF6EC] space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 w-fit self-start animate-fade-in">
                  {s.icon}
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFF6EC]">
                    Boutique Experience
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-[#FFF6EC]">
                  {resolvedHeadline}
                </h1>
                
                <p className="text-xs md:text-base text-[#F7EEE2]/85 font-medium max-w-lg leading-relaxed">
                  {s.sub}
                </p>

                <div className="flex flex-wrap gap-3.5 pt-3">
                  <a
                    href={s.cta1.href}
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-[#FFC9CD] hover:bg-[#E8A5AA] text-[#4A3728] text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95"
                  >
                    <span>{s.cta1.text}</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </a>
                  <a
                    href={s.cta2.href}
                    className="inline-flex items-center px-6 py-3 rounded-2xl bg-[#FFF6EC]/10 backdrop-blur-md border border-[#FFF6EC]/25 text-[#FFF6EC] text-xs font-extrabold uppercase tracking-wider hover:bg-[#FFF6EC]/20 transition-all"
                  >
                    {s.cta2.text}
                  </a>
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
          background: rgba(255, 246, 236, 0.4);
          margin: 0 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .custom-bullet-active {
          width: 24px;
          background: #FFC9CD !important;
          box-shadow: 0 0 8px rgba(255, 201, 205, 0.6);
        }
      `}</style>
    </div>
  );
}
