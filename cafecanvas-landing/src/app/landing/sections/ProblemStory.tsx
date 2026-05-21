'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function ProblemStory() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const problems = [
    {
      icon: '😫',
      title: 'Manual Order Chaos',
      description: 'Waiter writes on paper → Customer waits 20 mins → Wrong order arrives. Sound familiar?'
    },
    {
      icon: '💸',
      title: 'Billing Nightmares',
      description: 'Calculator errors, cash discrepancies, GST confusion. Your accountant stays late every night.'
    },
    {
      icon: '👔',
      title: 'Staff Chaos',
      description: 'No one knows who did what. Missing attendance records. Payroll takes 3 hours to calculate.'
    },
    {
      icon: '📉',
      title: 'Flying Blind',
      description: 'No idea which dishes are popular. Can\'t see peak hours. Marketing = guesswork.'
    },
    {
      icon: '👻',
      title: 'Ghost Customers',
      description: 'One-time visitors never come back. No loyalty program. Zero customer data.'
    },
    {
      icon: '🔄',
      title: 'Constant Stress',
      description: 'You manage everything manually. Can\'t scale. Can\'t take a day off without disaster.'
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Sound Like Your Restaurant?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Every restaurant owner faces these problems. Most think it's &quot;just how restaurants work.&quot;
            <br />
            <span className="text-orange-600 font-semibold">It doesn't have to be.</span>
          </p>
        </motion.div>

        {/* Problem Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50 border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-gray-600 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Narrative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-sm"
        >
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            <p className="text-lg">
              <strong className="text-orange-800 text-xl block mb-2">Meet Raj.</strong> 
              He owns a 30-seat restaurant in Mumbai. Yesterday, he lost ₹8,000 due to a billing error. The waiter forgot to add 3 dishes. This week, his best staff member quit because payroll was calculated wrong. He&apos;s thinking of closing down.
            </p>
            <div className="h-px bg-orange-200 my-4" />
            <p className="text-lg">
              <strong className="text-orange-800 text-xl block mb-2">He&apos;s not alone.</strong> 
              60% of restaurant owners feel stuck in a cycle of manual operations. They work 16-hour days. They can&apos;t scale. They can&apos;t innovate.
            </p>
            <p className="mt-6 text-center">
              <span className="text-orange-600 font-bold text-xl inline-block px-4 py-2 bg-white rounded-full border border-orange-200 shadow-sm animate-float">
                But what if it didn&apos;t have to be this way?
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
