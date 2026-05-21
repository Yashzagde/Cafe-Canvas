'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const testimonials = [
    {
      name: 'Raj Patel',
      restaurant: 'Mumbai Pizza House, Mumbai',
      image: '👨💼',
      quote: 'CafeCanvas saved me ₹5 lakhs in billing errors alone. Now I actually have time for my family.',
      results: '+28% Revenue'
    },
    {
      name: 'Priya Sharma',
      restaurant: 'Spice & Saffron, Delhi',
      image: '👩💼',
      quote: 'My staff loves it. Attendance is transparent. Payroll is fair. No more disputes. Just happy people.',
      results: '0 Staff Turnover'
    },
    {
      name: 'Arjun Singh',
      restaurant: 'Burger Junction, Bangalore',
      image: '👨💼',
      quote: 'The QR ordering changed everything. My customers order 2x faster. They spend more. They come back more often.',
      results: '+35% Repeat Rate'
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 bg-gradient-to-b from-white to-orange-50/50 relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16 tracking-tight"
        >
          What Restaurant Owners Say
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="p-8 bg-white border border-orange-100 rounded-3xl shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center border border-orange-100">{testimonial.image}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{testimonial.name}</h3>
                    <p className="text-sm text-orange-600 font-semibold">{testimonial.restaurant}</p>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-8 leading-relaxed text-base">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
              </div>

              <div className="text-center pt-4 border-t border-orange-100/50">
                <span className="text-2xl font-bold text-green-600 block">{testimonial.results}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
