'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Shield, 
  TrendingUp,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Credisomnia
              <span className="text-gradient"> Documentation</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how to build your DeFi credit score and leverage the power of 
              on-chain reputation with our comprehensive documentation.
            </p>
          </motion.div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Getting Started */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Getting Started
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Learn the basics of Credisomnia, from connecting your wallet to minting your first Credit NFT.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Quick Start Guide
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Wallet Setup
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → First Steps
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Credit Scoring */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Credit Scoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Understand how our dynamic credit scoring algorithm works and how to improve your score.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Scoring Algorithm
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Credit Factors
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Improving Your Score
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Smart Contracts */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Smart Contracts
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Technical documentation for developers integrating with Credisomnia smart contracts.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Contract Addresses
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → API Reference
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Integration Guide
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Learn about our security measures, audit reports, and best practices for users.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Security Overview
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Audit Reports
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Best Practices
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  FAQ
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Find answers to frequently asked questions about the Credisomnia platform.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → General FAQ
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Technical FAQ
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Troubleshooting
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Community */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
                  <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Join our community and get support from other Credisomnia users and developers.
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Discord Server
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → GitHub Repository
                  </Link>
                  <Link href="#" className="block text-primary-600 dark:text-primary-400 hover:underline">
                    → Support Center
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Concepts */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Key Concepts
            </h2>
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Soulbound NFTs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your Credit NFT is soulbound, meaning it cannot be transferred. This ensures that 
                    your credit score truly represents your financial behavior and cannot be sold or 
                    manipulated by others.
                  </p>
                  <Link href="#" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline">
                    Learn more about soulbound tokens
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Dynamic Scoring
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Unlike traditional credit scores, Credisomnia's scoring system updates in real-time 
                    based on your on-chain activities, providing a more accurate and current assessment 
                    of your creditworthiness.
                  </p>
                  <Link href="#" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline">
                    Understand the scoring algorithm
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Start Building Your Credit?
              </h2>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Connect your wallet and mint your first Credit NFT to begin your journey 
                in decentralized credit scoring.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Open Dashboard
                  </motion.button>
                </Link>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all"
                  >
                    Back to Home
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}