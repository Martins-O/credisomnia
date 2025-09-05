'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Award, 
  TrendingUp, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect Wallet",
    description: "Connect your Web3 wallet to get started with Credisomnia platform",
    details: [
      "Support for all major wallets",
      "Secure connection process",
      "No personal data required"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02",
    icon: Award,
    title: "Mint Credit NFT",
    description: "Get your unique soulbound NFT that will track your credit score evolution",
    details: [
      "Non-transferable identity",
      "Dynamic visual updates",
      "Permanent on-chain record"
    ],
    color: "from-purple-500 to-indigo-500"
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Build Credit",
    description: "Participate in DeFi activities to build your credit score over time",
    details: [
      "Lending and borrowing",
      "Timely repayments",
      "Savings and staking"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    number: "04",
    icon: Zap,
    title: "Unlock Benefits",
    description: "Enjoy better rates and access to premium DeFi services",
    details: [
      "Lower borrowing costs",
      "Higher yields",
      "Exclusive opportunities"
    ],
    color: "from-yellow-500 to-orange-500"
  }
];

export function HowItWorksSection() {
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
              <CheckCircle className="w-4 h-4 mr-2" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Start Building Your
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                DeFi Reputation
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started with Credisomnia in just four simple steps. Build your on-chain credit 
              score and unlock the future of decentralized finance.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200 dark:from-primary-800 dark:via-secondary-800 dark:to-primary-800 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    {/* Step Number */}
                    <div className="text-6xl font-bold text-gray-100 dark:text-gray-700 mb-4">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl mb-6 relative -mt-12`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {step.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full mr-3 flex-shrink-0`}></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-primary-200 dark:border-primary-700 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Your DeFi Credit Journey?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Connect your wallet now and mint your first Credit NFT. Start building your 
                on-chain reputation and unlock better DeFi opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  View Demo
                  <Zap className="ml-2 w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}