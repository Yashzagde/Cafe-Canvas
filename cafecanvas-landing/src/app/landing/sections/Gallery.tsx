"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

export default function Gallery() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const galleryItems = [
    {
      title: "Fine Dining Restaurants",
      tag: "Restaurants",
      image: "/images/restaurant_fine_dining.png", // our successfully generated local asset
      desc: "Manage table bookings, courses sequencing, and raw inventory recipes."
    },
    {
      title: "Cozy Espresso Cafes",
      tag: "Cafes",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=85",
      desc: "Accelerate counter queues with quick billing, QR menus, and fast KDS sync."
    },
    {
      title: "Premium Cocktail Lounges",
      tag: "Bars & Clubs",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=85",
      desc: "Handle peak order volumes, split tabs, and track bartender tip allocations."
    },
    {
      title: "Upscale Gastro Pubs",
      tag: "Pubs & Breweries",
      image: "https://images.unsplash.com/photo-1574096079513-d8259312b7a3?auto=format&fit=crop&w=800&q=85",
      desc: "Monitor drafts inventory and coordinate staff shifts across active nights."
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-white text-gray-950 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Built For You
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tailored for Every Hospitality Format.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            From single-outlet neighborhood cafes to multi-state restaurant chains.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col group"
            >
              <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.title} operating with CafeCanvas SaaS`}
                  fill
                  className="object-cover group-hover:scale-103 transition duration-500"
                  unoptimized={item.image.startsWith("http")}
                />
                <span className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-800">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base group-hover:text-orange-500 transition duration-255">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
