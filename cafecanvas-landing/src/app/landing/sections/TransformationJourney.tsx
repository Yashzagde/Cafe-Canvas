'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function TransformationJourney() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const journeySteps = [
    {
      step: '1️⃣',
      time: 'Day 1: Setup (15 minutes)',
      story: 'Raj sets up CafeCanvas. Adds his menu. Generates QR codes for each table. Done.',
      result: 'Tables: Connected ✅'
    },
    {
      step: '2️⃣',
      time: 'Day 2: First Orders',
      story: 'Customers scan QR → Browse menu → Order directly → Kitchen gets alert immediately.',
      result: 'Order Time: 20 min → 2 min ⚡'
    },
    {
      step: '3️⃣',
      time: 'Day 3: Staff Magic',
      story: 'Raj sets up staff profiles. Attendance auto-tracks. Payroll calculates in seconds.',
      result: 'Payroll Time: 3 hours → 5 minutes 🎯'
    },
    {
      step: '4️⃣',
      time: 'Day 4: Insights',
      story: 'Dashboard shows: Top 5 dishes, peak hours, customer preferences, exact profit margins.',
      result: 'Decision Making: Guesswork → Data-Driven 📊'
    },
    {
      step: '5️⃣',
      time: 'Day 5: Growth',
      story: 'Raj runs a targeted promotion. Email + WhatsApp. Loyalty program tracks repeat customers.',
      result: 'Repeat Customers: 10% → 35% 🚀'
    },
    {
      step: '6️⃣',
      time: '30 Days Later',
      story: 'Revenue up 25%. Errors down to zero. Staff happy. Customers happy. Raj sleeps 8 hours.',
      result: 'Raj is Free 😊'
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
          Raj's 30-Day Transformation
        </motion.h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          This is what happens when a restaurant owner discovers CafeCanvas...
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 to-orange-600 transform -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-12">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col lg:flex-row ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'} items-center gap-8`}
              >
                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="p-6 bg-white rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition">
                    <div className="text-3xl mb-2">{step.step}</div>
                    <p className="text-sm text-orange-600 font-semibold mb-2">{step.time}</p>
                    <p className="text-gray-800 leading-relaxed mb-3">{step.story}</p>
                    <p className="text-lg font-bold text-green-600">→ {step.result}</p>
                  </div>
                </div>

                {/* Spacer for center */}
                <div className="hidden lg:flex flex-initial justify-center items-center w-12">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: i * 0.15, duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    className="w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10"
                  />
                </div>

                {/* Empty space */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Result Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-20 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Raj's Results After 30 Days</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">+25%</div>
              <p className="text-gray-700">Revenue Growth</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">-90%</div>
              <p className="text-gray-700">Order Errors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">+35%</div>
              <p className="text-gray-700">Repeat Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">8 hrs</div>
              <p className="text-gray-700">Sleep Per Night</p>
            </div>
          </div>
          <p className="text-center text-gray-700 mt-6 text-lg">
            <strong>"CafeCanvas didn't just save me time. It saved my restaurant."</strong> - Raj, Mumbai
          </p>
        </motion.div>
      </div>
    </section>
  );
}
