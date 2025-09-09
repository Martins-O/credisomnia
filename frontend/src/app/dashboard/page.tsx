'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  PiggyBank,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCredisomnia } from '@/hooks/useCredisomnia';

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

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  
  const { 
    creditScore, 
    creditProfile, 
    hasCreditNFT, 
    savingsBalance, 
    getCreditTier, 
    formatBalance,
    mintCreditNFT,
    isLoading,
    totalLoans,
    activeLiquidations,
    totalSaved,
    apy,
    healthFactor,
    nextPaymentDue
  } = useCredisomnia();

  const handleMintNFT = async () => {
    try {
      setError(null);
      await mintCreditNFT(creditScore || 600n);
    } catch (err) {
      setError('Failed to mint Credit NFT. Please try again.');
      console.error('Mint NFT error:', err);
    }
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path);
    } catch (err) {
      setError('Navigation failed. Please refresh the page.');
      console.error('Navigation error:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to access your Credisomnia dashboard
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  const creditScoreNum = creditScore ? Number(creditScore) : 0;
  const tier = getCreditTier(creditScore || BigInt(0));
  const savingsBalanceFormatted = formatBalance(savingsBalance as bigint | undefined);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Welcome to your DeFi credit overview
                </p>
              </div>
              <ConnectButton />
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
          </motion.div>

          {/* Credit NFT Status */}
          {!hasCreditNFT && (
            <motion.div variants={itemVariants} className="mb-8">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Get Your Credit NFT</h2>
                    <p className="opacity-90">
                      Mint your soulbound Credit NFT to start building your on-chain reputation
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMintNFT}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Minting...' : 'Mint NFT'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Credit Score */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Credit Score</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{tier}</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {creditScoreNum || '---'}
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+12 this month</span>
                </div>
              </div>
            </motion.div>

            {/* Savings Balance */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Savings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">STT Balance</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {savingsBalanceFormatted}
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+5.2% APY</span>
                </div>
              </div>
            </motion.div>

            {/* Repayment Streak */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Streak</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">On-time payments</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {creditProfile ? Number(creditProfile.repaymentStreak) : '0'}
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-500">payments</span>
                </div>
              </div>
            </motion.div>

            {/* Total Repayments */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Repayments</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total amount</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {creditProfile ? formatBalance(creditProfile.totalRepayments) : '0'}
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-500">STT repaid</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <motion.button
                onClick={() => handleNavigation('/dashboard/savings')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-4">
                  <PiggyBank className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Start Saving
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Deposit funds and earn {apy} APY while building credit
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/savings?tab=convert')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4">
                  <ArrowUpRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Convert STT
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Convert STT to stablecoins for stable savings yield
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/loans')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Get a Loan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Borrow at competitive rates based on your credit score
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/nft')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  View NFT
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Check your soulbound Credit NFT and its evolution
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/trading')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Trading
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Advanced trading platform coming soon
                </p>
              </motion.button>
            </div>
          </motion.div>

          {/* Dashboard Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main Dashboard Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Overview */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Portfolio Overview
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {savingsBalanceFormatted} STT
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Total Savings
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalLoans}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Active Loans
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {healthFactor}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Health Factor
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Credit History Chart */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Credit Score Trend
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Last 6 months</span>
                    </div>
                  </div>
                  
                  {/* Simplified Credit Score Chart */}
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex items-end justify-between px-4">
                      {[580, 620, 640, 680, 720, 750].map((score, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t"
                            style={{ height: `${(score - 500) / 3}px` }}
                          />
                          <div className="text-xs text-gray-500 mt-2">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Credit Score</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Deposit
                        </div>
                        <div className="text-xs text-gray-500">
                          +500 STT • 2 days ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Credit Score Updated
                        </div>
                        <div className="text-xs text-gray-500">
                          +30 points • 1 week ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          NFT Minted
                        </div>
                        <div className="text-xs text-gray-500">
                          Credit NFT #1 • 2 weeks ago
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Next Payment */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Next Payment</h3>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {nextPaymentDue}
                  </div>
                  <div className="text-orange-100 text-sm">
                    Payment due in 7 days
                  </div>
                  <motion.button
                    onClick={() => handleNavigation('/dashboard/loans?tab=repay')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Pay Now
                  </motion.button>
                </div>
              </motion.div>

              {/* Market Stats */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Market Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg APY</span>
                      <span className="text-sm font-semibold text-green-600">5.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">TVL</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                      <span className="text-sm font-semibold text-primary-600">1,247</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}