'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-20 bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Your Restaurant <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Deserves Better</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
            Stop juggling spreadsheets, lost orders, and missed customers.
            <br />
            <span className="text-orange-600 font-semibold">
              One software. Complete control. 10x efficiency.
            </span>
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition cursor-pointer"
              >
                ✨ See It In Action (Free Demo)
              </motion.button>
            </Link>
            
            <button className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-lg font-semibold text-lg hover:bg-orange-50 transition cursor-pointer">
              📖 Read Our Story
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            '🍽️ QR Table Ordering',
            '💰 Smart Billing',
            '👥 Staff Management',
            '📊 Real-time Analytics',
            '🎨 Beautiful Themes'
          ].map((feature, i) => (
            <div
              key={i}
              className="px-4 py-2 bg-white bg-opacity-70 backdrop-blur-md rounded-full text-gray-700 text-sm font-medium border border-orange-200 shadow-sm transition hover:border-orange-400 cursor-default"
            >
              {feature}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-gray-500 text-xs mb-2">Scroll to discover</p>
        <svg className="w-6 h-6 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
