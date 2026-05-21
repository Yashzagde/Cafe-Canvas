'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function FeaturesStory() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const features = [
    {
      emoji: '🍽️',
      title: 'QR-Based Table Ordering',
      subtitle: 'Your Restaurant, Digitized',
      story: 'Instead of waiter confusion:\n• Customer scans QR at table\n• Browses menu on phone\n• Orders directly\n• Kitchen gets instant alert\n• Bill auto-calculated\n\nNo paper. No mistakes. No waiting.',
      benefits: ['Instant Orders', 'Zero Errors', 'Happy Customers'],
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300'
    },
    {
      emoji: '💰',
      title: 'Smart Billing System',
      subtitle: 'Accuracy You Can Trust',
      story: 'Every order is tracked perfectly:\n• GST calculated automatically\n• Discounts applied correctly\n• Payment methods recorded\n• Cash/Card/UPI/Wallet\n• Real-time reconciliation\n• Invoice printed/emailed instantly',
      benefits: ['Zero Errors', 'GST Compliant', 'Auto Reconciliation'],
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-300'
    },
    {
      emoji: '👥',
      title: 'Staff Management Done Right',
      subtitle: 'People Make the Restaurant',
      story: 'Manage your team effortlessly:\n• Auto attendance tracking\n• Performance ratings\n• Instant payroll calculation\n• Staff shifts management\n• Role-based permissions\n• Real-time productivity metrics',
      benefits: ['Happy Staff', 'Fair Pay', 'Zero Disputes'],
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300'
    },
    {
      emoji: '🎨',
      title: '52+ Beautiful Themes',
      subtitle: 'Brand Your Restaurant',
      story: 'Make your restaurant stand out:\n• Pre-designed themes for every style\n• Customize colors, fonts, images\n• Dark mode for late-night customers\n• Mobile-responsive always\n• Change themes in one click\n• No coding needed',
      benefits: ['Professional Look', 'Brand Identity', 'Customer WOW'],
      color: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-300'
    },
    {
      emoji: '📊',
      title: 'Real-Time Analytics',
      subtitle: 'See Your Business Clearly',
      story: 'Data that matters:\n• Top 10 dishes (by revenue)\n• Peak hours analysis\n• Customer preferences\n• Profit margins per item\n• Staff performance ranking\n• Forecast next month\'s trends',
      benefits: ['Smart Decisions', 'Spot Trends', 'Increase Profits'],
      color: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-300'
    },
    {
      emoji: '📈',
      title: 'Scale & Marketing Built-In',
      subtitle: 'Grow Without Growing Chaos',
      story: 'Built for growth from day one:\n• Email campaigns (targeted)\n• WhatsApp marketing\n• Loyalty program\n• Customer database\n• Repeat customer tracking\n• Promotional offers management',
      benefits: ['Grow Revenue', 'Keep Customers', 'Own Your Data'],
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300'
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Not Just Software. A Complete Solution.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every feature is built around one goal: <strong>Make your restaurant run itself</strong>
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -10 }}
              className={`p-8 bg-gradient-to-br ${feature.color} border-2 ${feature.borderColor} rounded-2xl`}
            >
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-orange-600 font-semibold mb-4">{feature.subtitle}</p>
              
              <p className="text-gray-800 whitespace-pre-line mb-6 leading-relaxed">
                {feature.story}
              </p>

              <div className="flex flex-wrap gap-2">
                {feature.benefits.map((benefit, j) => (
                  <span
                    key={j}
                    className="px-3 py-1 bg-white bg-opacity-60 text-gray-700 rounded-full text-sm font-medium"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
