'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function ProblemStory() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

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
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Sound Like Your Restaurant?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every restaurant owner faces these problems. Most think it's "just how restaurants work."
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
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
            >
              <div className="text-4xl mb-3">{problem.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-gray-700">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200"
        >
          <p className="text-lg text-gray-800 leading-relaxed">
            <strong className="text-orange-700">Meet Raj.</strong> He owns a 30-seat restaurant in Mumbai.
            Yesterday, he lost ₹8,000 due to a billing error. The waiter forgot to add 3 dishes.
            This week, his best staff member quit because payroll was calculated wrong.
            He's thinking of closing down.
            <br /><br />
            <strong className="text-orange-700">He's not alone.</strong> 60% of restaurant owners feel stuck in a cycle
            of manual operations. They work 16-hour days. They can't scale. They can't innovate.
            <br /><br />
            <span className="text-orange-600 font-semibold text-lg">
              But what if it didn't have to be this way?
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
