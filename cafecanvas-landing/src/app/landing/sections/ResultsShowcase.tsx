'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function ResultsShowcase() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const results = [
    {
      metric: '1000+',
      label: 'Restaurants Growing',
      icon: '🏪'
    },
    {
      metric: '50M+',
      label: 'Orders Processed',
      icon: '📦'
    },
    {
      metric: '₹100Cr+',
      label: 'Revenue Tracked',
      icon: '💵'
    },
    {
      metric: '4.9/5',
      label: 'Customer Rating',
      icon: '⭐'
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-5xl font-bold text-gray-900 text-center mb-16"
        >
          Trusted By India's Best Restaurants
        </motion.h2>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl text-center cursor-pointer"
            >
              <div className="text-5xl mb-3">{result.icon}</div>
              <div className="text-4xl font-bold text-orange-600 mb-2">{result.metric}</div>
              <p className="text-gray-700 font-medium">{result.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
