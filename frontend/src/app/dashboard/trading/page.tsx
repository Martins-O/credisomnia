'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Shield, 
  ArrowUpDown,
  Target,
  Clock,
  Star,
  Coins,
  Activity,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const features = [
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Advanced Trading Interface",
    description: "Professional-grade charts with technical indicators, order book, and real-time price feeds.",
    status: "Development"
  },
  {
    icon: <ArrowUpDown className="w-8 h-8" />,
    title: "Automated Trading Strategies", 
    description: "Set up DCA, grid trading, and rebalancing strategies based on your credit score.",
    status: "Planning"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Credit-Based Leverage",
    description: "Access leveraged trading with rates determined by your on-chain credit history.",
    status: "Research"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Smart Order Management",
    description: "Stop-loss, take-profit, and conditional orders with credit score optimization.",
    status: "Planning"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Cross-Chain Trading",
    description: "Trade assets across multiple chains while maintaining unified credit scoring.",
    status: "Research"
  },
  {
    icon: <Activity className="w-8 h-8" />,
    title: "Portfolio Analytics",
    description: "Track P&L, risk metrics, and trading performance impact on credit score.",
    status: "Development"
  }
];

const tradingPairs = [
  { name: "STT/USDC", change: "+5.2%", volume: "$1.2M", apr: "8.5%" },
  { name: "ETH/STT", change: "-2.1%", volume: "$850K", apr: "12.3%" },
  { name: "BTC/USDC", change: "+1.8%", volume: "$2.1M", apr: "6.7%" },
  { name: "MATIC/STT", change: "+8.4%", volume: "$650K", apr: "15.2%" },
];

export default function TradingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trading Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              The future of DeFi trading powered by credit scoring. Trade smarter with personalized rates, 
              automated strategies, and cross-chain capabilities.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl">
              <Clock className="w-5 h-5 mr-2" />
              Coming Soon - Q2 2025
            </div>
          </motion.div>

          {/* Current Trading Opportunities */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available Trading Pairs
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Live on Somnia Network
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tradingPairs.map((pair, index) => (
                  <motion.div
                    key={pair.name}
                    variants={itemVariants}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {pair.name}
                      </h3>
                      <Coins className="w-4 h-4 text-primary-500" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>24h Change:</span>
                        <span className={`font-medium ${
                          pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {pair.change}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{pair.volume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>APR:</span>
                        <span className="font-medium text-primary-500">{pair.apr}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/dashboard/savings')}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Start with Savings
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Upcoming Trading Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                      {feature.icon}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'Development' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : feature.status === 'Planning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {feature.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Be Among the First Traders
              </h2>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Join our early access program and help shape the future of credit-based DeFi trading. 
                Get notified when trading features launch and receive special benefits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard/savings')}
                  className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Start Building Credit
                </button>
                <button
                  onClick={() => router.push('/dashboard/loans')}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Explore Lending
                </button>
              </div>
            </div>
          </motion.div>

          {/* Navigation Back */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}