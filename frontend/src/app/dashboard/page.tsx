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
import { AccessibleButton, ScreenReaderOnly } from '@/components/ui/AccessibleButton';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { LoadingCard, LoadingButton } from '@/components/ui/LoadingSpinner';
import { useTransactionFeedback, TransactionFeedback } from '@/components/ui/TransactionFeedback';

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
  const [showWelcome, setShowWelcome] = React.useState(false);
  const { feedback, showPending, showSuccess, showError, clear } = useTransactionFeedback();

  // Check if user needs onboarding
  React.useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('credisomOnboardingCompleted')
    if (isConnected && !hasCompletedOnboarding) {
      setShowWelcome(true)
    }
  }, [isConnected])
  
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
      showPending('Minting your Credit NFT...');
      await mintCreditNFT(creditScore || 600n);
      showSuccess('Credit NFT minted successfully!');
    } catch (err: any) {
      const formattedError = formatError(err);
      setError(formattedError);
      showError('Failed to mint Credit NFT');
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
          {/* Header with improved hierarchy */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                    <ScreenReaderOnly>- CrediSom DeFi Credit Platform</ScreenReaderOnly>
                  </h1>
                  <HelpTooltip 
                    title="Dashboard Overview" 
                    content="Monitor your credit score, savings, and lending activity. Use quick actions to manage your DeFi credit profile."
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                  Your DeFi credit overview and quick actions
                </p>
              </div>
              <div className="flex-shrink-0">
                <LoadingCard isLoading={isLoading}>
                  <ConnectButton />
                </LoadingCard>
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

          {/* Credit NFT Status - Enhanced */}
          {!hasCreditNFT && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5" />
                      <h2 className="text-lg sm:text-xl font-bold">Get Your Credit NFT</h2>
                      <HelpTooltip 
                        title="Credit NFT" 
                        content="Your soulbound NFT represents your credit history and evolves with your score. It's non-transferable and unique to you."
                      />
                    </div>
                    <p className="opacity-90 text-sm sm:text-base">
                      Mint your soulbound Credit NFT to start building on-chain reputation
                    </p>
                  </div>
                  <LoadingButton
                    isLoading={isLoading}
                    onClick={handleMintNFT}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base flex-shrink-0 min-h-[44px] touch-manipulation"
                    ariaLabel="Mint your Credit NFT to start building credit history"
                  >
                    {isLoading ? 'Minting...' : 'Mint NFT'}
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Metrics - Enhanced Visual Hierarchy */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Key Metrics
              </h2>
              <HelpTooltip 
                title="Credit Metrics" 
                content="Your credit score and savings balance are the primary indicators of your DeFi credit health."
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* Credit Score - Primary Metric */}
              <LoadingCard isLoading={isLoading}>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Credit Score</h3>
                        <ScreenReaderOnly>Current credit score: {creditScoreNum || 'Not available'}</ScreenReaderOnly>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">{tier}</p>
                    </div>
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-5xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                    {creditScoreNum || '---'}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      <span>+12 this month</span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Excellent
                    </div>
                  </div>
                </div>
              </LoadingCard>

              {/* Savings Balance - Secondary Metric */}
              <LoadingCard isLoading={isLoading}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Total Savings</h3>
                        <ScreenReaderOnly>Current savings balance: {savingsBalanceFormatted} STT</ScreenReaderOnly>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Earning {apy} APY</p>
                    </div>
                    <div className="p-2 bg-green-600 rounded-lg">
                      <PiggyBank className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {savingsBalanceFormatted}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">STT</p>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Active
                    </div>
                  </div>
                </div>
              </LoadingCard>
            </div>
          </motion.div>

          {/* Essential Actions - Improved Organization */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <HelpTooltip 
                title="Quick Actions" 
                content="Start earning, borrow funds, or manage your Credit NFT with these essential actions."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.button
                onClick={() => handleNavigation('/dashboard/savings')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800 text-left hover:shadow-lg transition-all duration-300 min-h-[44px] touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                      Save & Earn
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {apy} APY
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/loans')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-left hover:shadow-lg transition-all duration-300 min-h-[44px] touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      Borrow
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Credit-based rates
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/nft')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-left hover:shadow-lg transition-all duration-300 min-h-[44px] touch-manipulation"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      Credit NFT
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View your profile
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Simplified Dashboard Layout */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Status Overview */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Account Status
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      All systems operational
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {totalLoans} Active Loans
                    </div>
                    <div className="text-xs text-gray-500">
                      Health: {healthFactor}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity - Enhanced Visual Hierarchy */}
            <motion.div variants={itemVariants}>
              <LoadingCard isLoading={isLoading}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Recent Activity
                    </h2>
                    <HelpTooltip 
                      title="Activity Feed" 
                      content="Your latest transactions and credit score changes are shown here to help track your DeFi credit progress."
                    />
                  </div>
                  
                  <div className="space-y-4" role="list" aria-label="Recent account activity">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" role="listitem">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Savings Deposit
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +500 STT • 2 days ago
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        +500
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" role="listitem">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Credit Score Increase
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Improved by 30 points • 1 week ago
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        +30
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigation('/dashboard/history')}
                        className="w-full justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        ariaLabel="View complete transaction history"
                      >
                        View All Activity
                        <ArrowUpRight className="w-4 h-4 ml-1" aria-hidden="true" />
                      </AccessibleButton>
                    </div>
                  </div>
                </div>
              </LoadingCard>
            </motion.div>

            {/* Payment Alert - Enhanced Visual Hierarchy */}
            {nextPaymentDue && (
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 sm:p-6 text-white shadow-lg border-2 border-orange-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Payment Due Soon</h3>
                        <p className="text-orange-100 text-sm">Don't miss your payment deadline</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{nextPaymentDue}</div>
                      <div className="text-sm text-orange-100 font-medium">STT • Due in 7 days</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <AccessibleButton
                      onClick={() => handleNavigation('/dashboard/loans?tab=repay')}
                      className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors text-sm shadow-sm"
                      ariaLabel={`Pay loan amount of ${nextPaymentDue} STT now to avoid late fees`}
                      motionProps={{
                        whileHover: { scale: 1.02, y: -1 },
                        whileTap: { scale: 0.98 }
                      }}
                    >
                      Pay Now
                      <ArrowUpRight className="w-4 h-4 ml-2 inline" aria-hidden="true" />
                    </AccessibleButton>
                    
                    <AccessibleButton
                      variant="ghost"
                      onClick={() => handleNavigation('/dashboard/loans')}
                      className="w-full text-white/90 hover:text-white hover:bg-white/10 py-2 text-xs"
                      ariaLabel="View detailed loan information and payment options"
                    >
                      View Loan Details
                    </AccessibleButton>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}