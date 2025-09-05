'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Shield, 
  Award, 
  Zap, 
  Users, 
  BarChart3,
  Wallet,
  Clock
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const features = [
  {
    icon: TrendingUp,
    title: "Dynamic Credit Scoring",
    description: "Real-time credit scores that update based on your DeFi activities, repayment history, and on-chain behavior.",
    benefits: [
      "Multi-factor credit evaluation",
      "Real-time score updates",
      "Transparent scoring algorithm",
      "Cross-protocol reputation"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Award,
    title: "Soulbound NFT Identity",
    description: "Your credit score lives in a non-transferable NFT that represents your unique DeFi reputation and history.",
    benefits: [
      "Non-transferable identity",
      "Visual credit representation",
      "Dynamic metadata",
      "Cross-platform compatibility"
    ],
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Zap,
    title: "High-Performance Network",
    description: "Built on Somnia's blazing-fast blockchain for instant transactions and real-time interest calculations.",
    benefits: [
      "2-second block times",
      "Ultra-low fees",
      "Real-time accrual",
      "Instant liquidations"
    ],
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with circuit breakers, multi-sig controls, and comprehensive audit coverage.",
    benefits: [
      "Smart contract audits",
      "Circuit breaker protection",
      "Multi-role access control",
      "Emergency safeguards"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive dashboards and analytics to track your DeFi performance and credit score evolution.",
    benefits: [
      "Performance tracking",
      "Credit score history",
      "Risk analysis",
      "Portfolio insights"
    ],
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Wallet,
    title: "Optimized Rates",
    description: "Better credit scores unlock lower borrowing rates and higher lending yields across the platform.",
    benefits: [
      "Dynamic rate pricing",
      "Credit-based discounts",
      "Premium tier access",
      "Loyalty rewards"
    ],
    color: "from-teal-500 to-green-500"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-4">
              <Users className="w-4 h-4 mr-2" />
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                DeFi Credit Building
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Credisomnia combines cutting-edge blockchain technology with innovative credit scoring 
              to create the future of decentralized finance.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
                <span className="text-primary-600 dark:text-primary-400 font-medium">Ready to get started?</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Build Your DeFi Credit Score Today
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of users already building their on-chain reputation and accessing better DeFi rates.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Start Building Credit
                <TrendingUp className="ml-2 w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}