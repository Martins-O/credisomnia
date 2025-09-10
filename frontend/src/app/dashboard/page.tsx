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
  Zap,
  X,
  RefreshCw
} from 'lucide-react';
import { SimpleConnectButton as ConnectButton } from '@/components/ui/SimpleConnectButton';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCrediSom } from '@/hooks/useCrediSom';
import { formatError, getErrorSuggestions, isRecoverableError, getErrorColor, type FormattedError } from '@/lib/utils/errorHandling';

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

// Helper function to get error styling based on error type
const getErrorTypeStyles = (type: FormattedError['type']) => {
  switch (type) {
    case 'user':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'network':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    case 'contract':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  }
};

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [error, setError] = React.useState<FormattedError | null>(null);
  
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
  } = useCrediSom();

  const handleMintNFT = async () => {
    try {
      setError(null);
      await mintCreditNFT(creditScore || 600n);
    } catch (err: any) {
      const formattedError = formatError(err);
      setError(formattedError);
      console.error('Mint NFT error:', err);
    }
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path);
    } catch (err: any) {
      const formattedError = formatError(err);
      setError({
        ...formattedError,
        title: 'Navigation Error',
        message: 'Failed to navigate. Please try again or refresh the page.'
      });
      console.error('Navigation error:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Optionally trigger a retry of the last action
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
            Connect your wallet to access your CrediSom dashboard
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Your DeFi credit overview
                </p>
              </div>
              <div className="flex-shrink-0">
                <ConnectButton />
              </div>
            </div>
            {error && (
              <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border ${getErrorTypeStyles(error.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className={`text-sm font-semibold ${getErrorColor(error)}`}>
                        {error.title}
                      </h4>
                      {error.type === 'user' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${getErrorColor(error)}`}>
                      {error.message}
                    </p>
                    
                    {/* Error suggestions */}
                    {getErrorSuggestions(error).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Try this:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {getErrorSuggestions(error).slice(0, 2).map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    {isRecoverableError(error) && (
                      <button 
                        onClick={handleRetry}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Retry"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => setError(null)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Credit NFT Status */}
          {!hasCreditNFT && (
            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-2">Get Your Credit NFT</h2>
                    <p className="opacity-90 text-sm sm:text-base">
                      Mint your soulbound Credit NFT to start building reputation
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMintNFT}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base flex-shrink-0 min-h-[44px] flex items-center justify-center touch-manipulation"
                  >
                    {isLoading ? 'Minting...' : 'Mint NFT'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Credit Score */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">Credit Score</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tier}</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {creditScoreNum || '---'}
                </div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-500">+12 this month</span>
                </div>
              </div>
            </motion.div>

            {/* Savings Balance */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">Savings</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">STT Balance</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {savingsBalanceFormatted}
                </div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-500">+5.2% APY</span>
                </div>
              </div>
            </motion.div>

            {/* Repayment Streak */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">Streak</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">On-time payments</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {creditProfile ? Number(creditProfile.repaymentStreak) : '0'}
                </div>
                <div className="flex items-center text-xs">
                  <Activity className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
                  <span className="text-blue-500">payments</span>
                </div>
              </div>
            </motion.div>

            {/* Total Repayments */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">Repayments</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Total amount</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {creditProfile ? formatBalance(creditProfile.totalRepayments) : '0'}
                </div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="w-3 h-3 text-purple-500 mr-1 flex-shrink-0" />
                  <span className="text-purple-500">STT repaid</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              <motion.button
                onClick={() => handleNavigation('/dashboard/savings')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 h-full min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Start Saving
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  Earn {apy} APY
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/savings?tab=convert')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 h-full min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Convert STT
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  Convert to stablecoins
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/loans')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 h-full min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Get a Loan
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  Borrow based on credit score
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/nft')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 h-full min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  View NFT
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  View your Credit NFT
                </p>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/trading')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl transition-all duration-300 h-full min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Trading
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  Trading (coming soon)
                </p>
              </motion.button>
            </div>
          </motion.div>

          {/* Dashboard Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Main Dashboard Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Portfolio Overview */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6">
                    Portfolio
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg sm:rounded-xl">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 dark:text-primary-400 truncate">
                        {savingsBalanceFormatted}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Savings (STT)
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg sm:rounded-xl">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalLoans}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Active Loans
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg sm:rounded-xl">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {healthFactor}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Health Factor
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Credit History Chart */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6 gap-2">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                      Credit Trend
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">6 months</span>
                    </div>
                  </div>
                  
                  {/* Simplified Credit Score Chart */}
                  <div className="h-20 sm:h-24 lg:h-32 relative">
                    <div className="absolute inset-0 flex items-end justify-between px-1 sm:px-2 lg:px-4">
                      {[580, 620, 640, 680, 720, 750].map((score, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-2 sm:w-3 lg:w-6 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t"
                            style={{ height: `${Math.min((score - 500) / 4, 40)}px` }}
                          />
                          <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Recent Activity */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Activity
                  </h2>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Deposit
                        </div>
                        <div className="text-xs text-gray-500">
                          +500 STT • 2 days ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Credit Score Updated
                        </div>
                        <div className="text-xs text-gray-500">
                          +30 points • 1 week ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
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
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold">Payment Due</h3>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">
                    {nextPaymentDue}
                  </div>
                  <div className="text-orange-100 text-xs sm:text-sm">
                    Due in 7 days
                  </div>
                  <motion.button
                    onClick={() => handleNavigation('/dashboard/loans?tab=repay')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    Pay Now
                  </motion.button>
                </div>
              </motion.div>

              {/* Market Stats */}
              <motion.div variants={itemVariants}>
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Market
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Avg APY</span>
                      <span className="text-xs font-semibold text-green-600">5.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">TVL</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Active Users</span>
                      <span className="text-xs font-semibold text-primary-600">1,247</span>
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