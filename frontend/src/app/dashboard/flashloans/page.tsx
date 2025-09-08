'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { useAccount } from 'wagmi'
import { FlashLoanInterface, FlashLoanAnalytics } from '@/components/flashloan'
import NotificationSystem from '@/components/notifications/NotificationSystem'

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

export default function FlashLoansPage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'interface' | 'analytics'>('interface')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const handleFlashLoanSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Flash loan executed successfully!'
    })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleFlashLoanError = (error: Error) => {
    setNotification({
      type: 'error',
      message: `Flash loan failed: ${error.message}`
    })
    setTimeout(() => setNotification(null), 8000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            className="max-w-md mx-auto text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-gray-900 rounded-lg p-8">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Please connect your wallet to access flash loan functionality
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold">Flash Loans</h1>
                  <p className="text-gray-400 mt-1">
                    Uncollateralized loans repaid within the same transaction
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flash Loan Info Banner */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What are Flash Loans?</h3>
                  <p className="text-gray-300 mb-4">
                    Flash loans allow you to borrow funds without collateral, provided you repay the loan plus fees within the same transaction. 
                    They enable arbitrage, liquidations, and complex DeFi strategies.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-gray-300">No collateral required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-gray-300">Instant execution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-gray-300">0.09% fee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Warning Banner */}
          <motion.div variants={itemVariants}>
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-medium">Important Notice</h4>
                  <p className="text-yellow-200/80 text-sm mt-1">
                    Flash loans are advanced DeFi tools. Ensure your receiver contract properly handles the loan and repayment logic. 
                    Failed transactions will revert and consume gas fees.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants}>
            <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('interface')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'interface'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Flash Loans</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div variants={itemVariants}>
            {activeTab === 'interface' && (
              <FlashLoanInterface
                onSuccess={handleFlashLoanSuccess}
                onError={handleFlashLoanError}
              />
            )}
            {activeTab === 'analytics' && (
              <FlashLoanAnalytics />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Notification Display */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg p-4 shadow-lg ${
            notification.type === 'success' ? 'bg-green-900 border-green-600' :
            notification.type === 'error' ? 'bg-red-900 border-red-600' :
            'bg-blue-900 border-blue-600'
          } border`}>
            <p className="text-white text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem />
    </div>
  )
}