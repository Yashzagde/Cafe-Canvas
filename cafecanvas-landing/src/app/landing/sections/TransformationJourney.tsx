'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function TransformationJourney() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

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
    <section ref={ref} className="py-24 px-4 bg-gradient-to-b from-white to-orange-50/50 relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4 tracking-tight"
        >
          Raj&apos;s 30-Day Transformation
        </motion.h2>
        <p className="text-center text-gray-600 mb-16 text-lg max-w-xl mx-auto">
          This is what happens when a restaurant owner discovers CafeCanvas...
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 via-orange-500 to-orange-600 transform -translate-x-1/2 rounded-full" />

          {/* Steps */}
          <div className="space-y-12">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`flex flex-col lg:flex-row ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch gap-6 lg:gap-8`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="h-full p-6 bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-3">{step.step}</div>
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-2">{step.time}</p>
                      <p className="text-gray-700 leading-relaxed mb-4 text-base">{step.story}</p>
                    </div>
                    <div className="inline-block self-start px-3 py-1.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200">
                      → {step.result}
                    </div>
                  </div>
                </div>

                {/* Spacer for center node */}
                <div className="hidden lg:flex flex-col justify-center items-center">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-md relative z-10"
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
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 p-8 md:p-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl shadow-sm"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Raj&apos;s Results After 30 Days</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-1">+25%</div>
              <p className="text-gray-600 text-sm font-medium">Revenue Growth</p>
            </div>
            <div className="text-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-1">-90%</div>
              <p className="text-gray-600 text-sm font-medium">Order Errors</p>
            </div>
            <div className="text-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-1">+35%</div>
              <p className="text-gray-600 text-sm font-medium">Repeat Customers</p>
            </div>
            <div className="text-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-1">8 hrs</div>
              <p className="text-gray-600 text-sm font-medium">Sleep Per Night</p>
            </div>
          </div>
          <p className="text-center text-gray-850 mt-10 text-lg md:text-xl font-medium italic">
            &quot;CafeCanvas didn&apos;t just save me time. It saved my restaurant.&quot;
            <span className="block not-italic text-sm text-gray-500 mt-2 font-semibold">— Raj, Mumbai</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
