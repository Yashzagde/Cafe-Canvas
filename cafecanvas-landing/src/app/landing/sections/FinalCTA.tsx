'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function FinalCTA() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 px-4 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full filter blur-2xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-300 opacity-10 rounded-full filter blur-2xl -ml-20 -mb-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center text-white relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight"
        >
          Your Restaurant&apos;s Better Future Starts Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl mb-10 text-orange-100 max-w-xl mx-auto leading-relaxed"
        >
          14 days free. No credit card. No commitment. Just pure results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-6 bg-white text-orange-600 rounded-2xl font-bold text-xl hover:shadow-2xl transition cursor-pointer"
          >
            🚀 Start Your Free Trial Now
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 text-sm text-orange-150 font-medium"
        >
          Trusted by 1000+ restaurants • 50+ million orders • ₹100 Cr+ in revenue tracked
        </motion.p>

        {/* FAQ Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-orange-400/40 flex justify-center gap-8 flex-wrap"
        >
          <button className="text-orange-100 hover:text-white transition underline font-medium cursor-pointer">
            See Demo Video
          </button>
          <button className="text-orange-100 hover:text-white transition underline font-medium cursor-pointer">
            Read FAQ
          </button>
          <button className="text-orange-100 hover:text-white transition underline font-medium cursor-pointer">
            Chat with Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}
