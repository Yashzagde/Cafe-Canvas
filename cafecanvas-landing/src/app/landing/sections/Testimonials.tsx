'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

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
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-5xl font-bold text-gray-900 text-center mb-16"
        >
          What Restaurant Owners Say
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="p-8 bg-white border-2 border-orange-200 rounded-2xl shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{testimonial.image}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-orange-600">{testimonial.restaurant}</p>
                </div>
              </div>

              <blockquote className="text-gray-800 italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="text-center pt-4 border-t-2 border-orange-100">
                <span className="text-2xl font-bold text-green-600">{testimonial.results}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
