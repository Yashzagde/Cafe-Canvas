'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function FinalCTA() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-orange-500 to-orange-600">
      <div className="max-w-4xl mx-auto text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl font-bold mb-6"
        >
          Your Restaurant's Better Future Starts Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-xl mb-8 text-orange-100"
        >
          14 days free. No credit card. No commitment. Just pure results.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-6 bg-white text-orange-600 rounded-xl font-bold text-xl hover:shadow-2xl transition cursor-pointer"
        >
          🚀 Start Your Free Trial Now
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-orange-100"
        >
          Trusted by 1000+ restaurants • 50+ million orders • ₹100 Cr+ in revenue tracked
        </motion.p>

        {/* FAQ Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-orange-400 flex justify-center gap-6 flex-wrap"
        >
          <button className="text-orange-100 hover:text-white transition underline cursor-pointer bg-transparent border-none">
            See Demo Video
          </button>
          <button className="text-orange-100 hover:text-white transition underline cursor-pointer bg-transparent border-none">
            Read FAQ
          </button>
          <button className="text-orange-100 hover:text-white transition underline cursor-pointer bg-transparent border-none">
            Chat with Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}
