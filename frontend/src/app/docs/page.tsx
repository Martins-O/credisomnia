'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpenIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LogoFull } from '@/components/ui/Logo'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

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
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <LogoFull size="sm" />
            </Link>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <BookOpenIcon className="w-16 h-16 text-primary-600 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How CrediSom Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Build your on-chain credit score through savings and responsible borrowing. 
              Get better rates, lower collateral requirements, and access to DeFi lending.
            </p>
          </motion.div>

          {/* What is CrediSom */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">What is CrediSom?</h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg mb-6 opacity-90">
                  CrediSom is a revolutionary DeFi platform that brings traditional credit scoring to blockchain. 
                  Save money, build credit, and unlock better borrowing terms—all on-chain.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">600+</div>
                    <div className="text-sm opacity-80">Starting Credit Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">5.2%</div>
                    <div className="text-sm opacity-80">Savings APY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">60%</div>
                    <div className="text-sm opacity-80">Min Collateral (Best Credit)</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How It Works */}
          <motion.section variants={itemVariants} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              How It Works
            </h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Get Your Credit NFT
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Mint your unique Credit NFT that represents your on-chain reputation. 
                    This soulbound token evolves as you build credit and cannot be transferred.
                  </p>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                  <CreditCardIcon className="w-16 h-16 text-primary-600" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Start Saving & Earning
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Deposit STT tokens into your savings vault and earn 5.2%+ APY. 
                    Regular savings behavior improves your credit score over time.
                  </p>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-16 h-16 text-green-600" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Borrow with Better Terms
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    As your credit score improves, borrow money with lower interest rates 
                    and reduced collateral requirements. Pay on time to keep building credit.
                  </p>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-16 h-16 text-blue-600" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Key Features */}
          <motion.section variants={itemVariants} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Key Features
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Savings Vault */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Savings Vault</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Earn competitive APY on your STT deposits while building credit through consistent savings behavior.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />5.2%+ Annual Percentage Yield</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Withdraw anytime</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Credit score improvement</li>
                </ul>
              </div>

              {/* Smart Lending */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Lending</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Borrow with rates and collateral requirements based on your proven credit history.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Credit-based interest rates</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Lower collateral for good credit</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Flexible repayment terms</li>
                </ul>
              </div>

              {/* Token Conversion */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4">
                  <ArrowPathIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Token Conversion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Easily convert between STT and stablecoins with real-time rates and low fees.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />STT ↔ USDC conversion</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Real-time market rates</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Minimal fees</li>
                </ul>
              </div>

              {/* Credit Tracking */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                  <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Credit Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Monitor your credit score progress with detailed analytics and performance insights.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Real-time score updates</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Historical trends</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Factor breakdown</li>
                </ul>
              </div>

              {/* Credit NFT */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-4">
                  <CreditCardIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Credit NFT</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Your unique, evolving NFT that represents your on-chain credit reputation.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Soulbound (non-transferable)</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Evolving artwork</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Permanent reputation</li>
                </ul>
              </div>

              {/* Security */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secure & Audited</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Built on proven smart contract architecture with comprehensive security measures.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Smart contract security</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Transparent algorithms</li>
                  <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />Community verified</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Credit Score Factors */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                How Your Credit Score is Calculated
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary-600">40%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Payment History</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">On-time loan repayments</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-green-600">25%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Savings Consistency</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Regular deposits and balance</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-orange-600">20%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Credit Utilization</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Debt-to-credit ratio</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600">10%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Account Activity</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Platform engagement</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-purple-600">5%</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Repayment Streak</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Consecutive payments</p>
                </div>
              </div>
              
              <div className="text-center text-gray-600 dark:text-gray-300">
                <p className="text-sm">
                  Your credit score updates in real-time based on your financial behavior. 
                  Focus on making payments on time and maintaining consistent savings to improve your score.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Getting Started */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Building Credit?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join CrediSom today and start your journey to better DeFi lending rates. 
                Connect your wallet, mint your Credit NFT, and begin building your on-chain reputation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section variants={itemVariants} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What is a Credit NFT and why do I need one?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  A Credit NFT is your unique, non-transferable token that represents your on-chain credit reputation. 
                  It's required to participate in the platform and evolves as your credit score improves.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How do I improve my credit score?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Focus on making loan payments on time (most important), maintain consistent savings, 
                  keep your credit utilization low, stay active on the platform, and build a repayment streak.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What tokens does CrediSom support?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  CrediSom primarily uses STT (Somnia Test Token) for savings and USDC for lending. 
                  You can easily convert between STT and USDC using our built-in conversion tool.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Is my money safe on CrediSom?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, CrediSom is built on secure smart contracts with transparent, auditable code. 
                  Your funds are protected by blockchain security and you maintain full control of your assets.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I withdraw my savings anytime?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, your savings vault allows for instant withdrawals at any time. 
                  However, maintaining consistent balances helps improve your credit score over time.
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}