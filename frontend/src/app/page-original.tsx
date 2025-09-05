'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Award, Zap, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { StatsSection } from '../components/home/StatsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { CTASection } from '../components/home/CTASection';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Stats Section */}
        <StatsSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* CTA Section */}
        <CTASection />

        {/* Additional Benefits Section */}
        <motion.section
          variants={itemVariants}
          className="py-20 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
        >
          <div className="container-responsive">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Credisomnia?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the future of decentralized finance with our innovative credit scoring system
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card-hover text-center"
                  whileHover={{ y: -5 }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${benefit.colorClass}`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {benefit.description}
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                    {benefit.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Security & Trust Section */}
        <motion.section
          variants={itemVariants}
          className="py-20 bg-white dark:bg-gray-800"
        >
          <div className="container-responsive">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-8">
                <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Built for Security & Trust
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                Your assets and data are protected by industry-leading security measures and transparent smart contracts
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {securityFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

const benefits = [
  {
    icon: TrendingUp,
    title: "Dynamic Credit Scoring",
    description: "Real-time credit score updates based on your DeFi activities and repayment history",
    colorClass: "bg-gradient-to-r from-green-500 to-emerald-500",
    features: [
      "On-chain credit history tracking",
      "Real-time score updates",
      "Transparent scoring algorithm",
      "Multi-factor evaluation"
    ]
  },
  {
    icon: Award,
    title: "Soulbound NFT Identity",
    description: "Your credit score lives in a non-transferable NFT that represents your DeFi reputation",
    colorClass: "bg-gradient-to-r from-purple-500 to-indigo-500",
    features: [
      "Soulbound token technology",
      "Dynamic metadata updates",
      "Visual credit representation",
      "Cross-platform compatibility"
    ]
  },
  {
    icon: Zap,
    title: "High-Performance Network",
    description: "Built on Somnia's high-TPS blockchain for fast transactions and real-time updates",
    colorClass: "bg-gradient-to-r from-yellow-500 to-orange-500",
    features: [
      "2-second block times",
      "Low transaction fees",
      "Real-time interest accrual",
      "Instant liquidations"
    ]
  }
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Smart Contract Security",
    description: "Audited smart contracts with comprehensive security measures including reentrancy protection and access controls"
  },
  {
    icon: Shield,
    title: "Circuit Breaker Protection",
    description: "Built-in emergency mechanisms to halt operations in case of suspicious activity or security threats"
  },
  {
    icon: Users,
    title: "Multi-Role Access Control",
    description: "Granular permission system with separate roles for administration, emergency response, and security operations"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Monitoring",
    description: "Continuous monitoring of protocol health with automated alerts and daily volume limits for enhanced security"
  }
];