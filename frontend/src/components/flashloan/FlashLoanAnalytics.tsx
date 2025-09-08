'use client'

import React, { useMemo } from 'react'
import { useLendingPool, formatTokenAmount } from '@/lib/hooks/useContracts'
import { useRealTimeUpdates } from '@/lib/hooks/useRealTimeUpdates'

interface FlashLoanAnalyticsProps {
  className?: string
}

export function FlashLoanAnalytics({ className = '' }: FlashLoanAnalyticsProps) {
  const {
    useAvailableLiquidity,
    useFlashLoanPremiumRate,
    useTotalFlashLoanFees,
    useTotalSupplied,
  } = useLendingPool()

  // Contract reads
  const { data: availableLiquidity } = useAvailableLiquidity()
  const { data: premiumRate } = useFlashLoanPremiumRate()
  const { data: totalFeesCollected } = useTotalFlashLoanFees()
  const { data: totalSupplied } = useTotalSupplied()

  // Real-time updates
  const { flashLoanEvents } = useRealTimeUpdates()

  // Calculate metrics
  const metrics = useMemo(() => {
    const liquidity = availableLiquidity && typeof availableLiquidity === 'bigint' ? Number(formatTokenAmount(availableLiquidity, 18)) : 0
    const fees = totalFeesCollected && typeof totalFeesCollected === 'bigint' ? Number(formatTokenAmount(totalFeesCollected, 18)) : 0
    const supplied = totalSupplied && typeof totalSupplied === 'bigint' ? Number(formatTokenAmount(totalSupplied, 18)) : 0
    const rate = premiumRate && typeof premiumRate === 'bigint' ? Number(premiumRate) / 100 : 0.09

    // Calculate utilization rate for flash loans
    const utilizationRate = supplied > 0 ? ((supplied - liquidity) / supplied) * 100 : 0

    // Estimate potential returns
    const estimatedDailyVolume = liquidity * 0.1 // Assume 10% daily turnover
    const estimatedDailyRevenue = estimatedDailyVolume * (rate / 100)
    const estimatedMonthlyRevenue = estimatedDailyRevenue * 30

    return {
      availableLiquidity: liquidity,
      totalFeesCollected: fees,
      premiumRate: rate,
      utilizationRate: Math.max(0, utilizationRate),
      estimatedDailyRevenue,
      estimatedMonthlyRevenue,
      totalFlashLoanCount: flashLoanEvents?.length || 0,
    }
  }, [availableLiquidity, totalFeesCollected, totalSupplied, premiumRate, flashLoanEvents])

  // Recent flash loan activity
  const recentFlashLoans = useMemo(() => {
    if (!flashLoanEvents) return []
    return flashLoanEvents
      .slice(-5) // Last 5 flash loans
      .reverse() // Most recent first
  }, [flashLoanEvents])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Flash Loan Overview */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Flash Loan Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Available Liquidity</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(metrics.availableLiquidity)}
            </div>
            <div className="text-sm text-gray-500">
              Ready for flash loans
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Premium Rate</div>
            <div className="text-2xl font-bold text-green-400">
              {formatPercentage(metrics.premiumRate)}
            </div>
            <div className="text-sm text-gray-500">
              Per flash loan
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Fees Collected</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(metrics.totalFeesCollected)}
            </div>
            <div className="text-sm text-gray-500">
              All-time revenue
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Flash Loan Count</div>
            <div className="text-2xl font-bold text-purple-400">
              {metrics.totalFlashLoanCount}
            </div>
            <div className="text-sm text-gray-500">
              Total executed
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Revenue Projections</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Pool Utilization</div>
            <div className="text-xl font-bold text-white">
              {formatPercentage(metrics.utilizationRate)}
            </div>
            <div className="text-sm text-gray-500">
              Current usage rate
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Est. Daily Revenue</div>
            <div className="text-xl font-bold text-green-400">
              {formatCurrency(metrics.estimatedDailyRevenue)}
            </div>
            <div className="text-sm text-gray-500">
              From flash loans
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Est. Monthly Revenue</div>
            <div className="text-xl font-bold text-green-400">
              {formatCurrency(metrics.estimatedMonthlyRevenue)}
            </div>
            <div className="text-sm text-gray-500">
              Projected earnings
            </div>
          </div>
        </div>
      </div>

      {/* Recent Flash Loan Activity */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Recent Flash Loans</h4>
        
        {recentFlashLoans.length > 0 ? (
          <div className="space-y-3">
            {recentFlashLoans.map((loan, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">
                    {formatCurrency(Number(formatTokenAmount(loan.amount, 18)))}
                  </div>
                  <div className="text-sm text-gray-400">
                    Fee: {formatCurrency(Number(formatTokenAmount(loan.premium, 18)))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {loan.initiator.slice(0, 6)}...{loan.initiator.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Receiver: {loan.target.slice(0, 6)}...{loan.target.slice(-4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No flash loans yet</div>
            <div className="text-sm text-gray-500">
              Flash loan activity will appear here once users start utilizing the service
            </div>
          </div>
        )}
      </div>

      {/* Flash Loan Benefits */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Why Flash Loans Matter</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-white font-medium mb-2">For the Protocol</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Generate additional revenue from idle liquidity</li>
              <li>• Attract sophisticated DeFi users and developers</li>
              <li>• Enable complex DeFi strategies and arbitrage</li>
              <li>• Increase platform utility and adoption</li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-medium mb-2">For Users</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Access to uncollateralized capital</li>
              <li>• Enable arbitrage and liquidation opportunities</li>
              <li>• Complex DeFi strategy execution</li>
              <li>• Capital efficiency and advanced composability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}