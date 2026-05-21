'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const steps = [
    {
      number: '1',
      title: 'Sign Up (2 minutes)',
      description: 'Create account with your restaurant name, location, and phone number.',
      animation: '🎯'
    },
    {
      number: '2',
      title: 'Add Your Menu (15 minutes)',
      description: 'Upload dishes, prices, images. Or let us scan your existing menu.',
      animation: '📸'
    },
    {
      number: '3',
      title: 'Generate QR Codes (1 minute)',
      description: 'One click. QR codes for every table. Print or laminate.',
      animation: '📱'
    },
    {
      number: '4',
      title: 'Manage Staff (5 minutes)',
      description: 'Add staff profiles. Set roles. Attendance auto-tracks.',
      animation: '👥'
    },
    {
      number: '5',
      title: 'Go Live (Now!)',
      description: 'Customers scan QR. Orders flow. Kitchen buzzes. You relax.',
      animation: '🚀'
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-5xl font-bold text-gray-900 text-center mb-4"
        >
          Getting Started Is Stupid Simple
        </motion.h2>
        <p className="text-center text-gray-600 text-lg mb-16">
          5 steps. Less than 30 minutes. Your restaurant transforms.
        </p>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6"
            >
              {/* Number */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <span className="text-4xl font-bold text-white">{step.number}</span>
              </motion.div>

              {/* Content */}
              <div className="flex-1 p-6 bg-white rounded-xl border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="text-3xl">{step.animation}</span>
                  {step.title}
                </h3>
                <p className="text-gray-700 text-lg">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl border-2 border-orange-300 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No credit card. No commitment. Just 14 days of pure magic.
          </h3>
          <button className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition cursor-pointer">
            Start Free Trial Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
