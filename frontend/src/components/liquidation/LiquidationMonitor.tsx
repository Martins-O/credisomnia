'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { useLendingPool, calculateHealthFactor, formatTokenAmount, parseTokenAmount } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'
import { LoanDetails } from '@/lib/hooks/useContracts'

interface LiquidationCandidate extends LoanDetails {
  healthFactor: number
  liquidationReward: bigint
  isLiquidatable: boolean
}

export default function LiquidationMonitor() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { liquidationTargets, setLiquidationTargets, setLoading } = useDefiStore()

  // Contract hooks
  const lendingPool = useLendingPool()

  // Local state
  const [selectedLoan, setSelectedLoan] = useState<LiquidationCandidate | null>(null)
  const [isLiquidating, setIsLiquidating] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch all loans for liquidation monitoring
  // Note: In a real application, you'd have an endpoint or event logs to get all loans
  const [allLoans, setAllLoans] = useState<LoanDetails[]>([])

  // Transform loans into liquidation candidates
  const liquidationCandidates = useMemo((): LiquidationCandidate[] => {
    return allLoans
      .filter(loan => loan.status === 0) // Only active loans
      .map(loan => {
        const healthFactor = calculateHealthFactor(loan.collateralAmount, loan.outstandingAmount)
        const isLiquidatable = healthFactor < 1.0
        
        // Calculate liquidation reward (typically 5-10% bonus)
        const liquidationBonus = 500 // 5% in basis points
        const liquidationReward = (loan.collateralAmount * BigInt(liquidationBonus)) / 10000n
        
        return {
          ...loan,
          healthFactor,
          liquidationReward,
          isLiquidatable,
        }
      })
      .sort((a, b) => a.healthFactor - b.healthFactor) // Sort by health factor (worst first)
  }, [allLoans])

  // Filter for only liquidatable loans
  const liquidatableLoans = liquidationCandidates.filter(loan => loan.isLiquidatable)

  // Mock function to refresh liquidation data
  const refreshLiquidationData = useCallback(async () => {
    // TODO: Implement actual loan fetching from contract events or indexer
    // For now, this would require either:
    // 1. Adding a getAllLoans function to the contract
    // 2. Using event logs to track all loans
    // 3. Using a backend service/subgraph to index loan data
    
    // Demo data for development/demonstration purposes
    const demoLoans: LoanDetails[] = [
      {
        loanId: 1n,
        borrower: '0x1234567890123456789012345678901234567890' as Address,
        principalAmount: parseTokenAmount('1000'),
        outstandingAmount: parseTokenAmount('1100'),
        collateralAmount: parseTokenAmount('800'), // Undercollateralized - liquidatable
        interestRate: 500n, // 5%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30), // 30 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30 + 86400 * 60), // Due in 30 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
        status: 0 // Active
      },
      {
        loanId: 2n,
        borrower: '0x2345678901234567890123456789012345678901' as Address,
        principalAmount: parseTokenAmount('2500'),
        outstandingAmount: parseTokenAmount('2650'),
        collateralAmount: parseTokenAmount('1500'), // Barely undercollateralized
        interestRate: 600n, // 6%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 45), // 45 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 45 + 86400 * 90), // Due in 45 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 45),
        status: 0 // Active
      },
      {
        loanId: 3n,
        borrower: '0x3456789012345678901234567890123456789012' as Address,
        principalAmount: parseTokenAmount('500'),
        outstandingAmount: parseTokenAmount('520'),
        collateralAmount: parseTokenAmount('750'), // Well collateralized
        interestRate: 400n, // 4%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15), // 15 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15 + 86400 * 30), // Due in 15 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15),
        status: 0 // Active
      },
      {
        loanId: 4n,
        borrower: '0x4567890123456789012345678901234567890123' as Address,
        principalAmount: parseTokenAmount('3000'),
        outstandingAmount: parseTokenAmount('3200'),
        collateralAmount: parseTokenAmount('2800'), // Very close to liquidation
        interestRate: 700n, // 7%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 60), // 60 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 60 + 86400 * 90), // Due in 30 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 60),
        status: 0 // Active
      },
      {
        loanId: 5n,
        borrower: '0x5678901234567890123456789012345678901234' as Address,
        principalAmount: parseTokenAmount('1500'),
        outstandingAmount: parseTokenAmount('1580'),
        collateralAmount: parseTokenAmount('1200'), // Liquidatable
        interestRate: 550n, // 5.5%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 40), // 40 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 40 + 86400 * 60), // Due in 20 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 40),
        status: 0 // Active
      },
      {
        loanId: 6n,
        borrower: '0x6789012345678901234567890123456789012345' as Address,
        principalAmount: parseTokenAmount('800'),
        outstandingAmount: parseTokenAmount('820'),
        collateralAmount: parseTokenAmount('1600'), // Very safe
        interestRate: 350n, // 3.5%
        startTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10), // 10 days ago
        dueTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10 + 86400 * 180), // Due in 170 days
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10),
        status: 0 // Active
      }
    ]
    
    setAllLoans(demoLoans)
    setLiquidationTargets(demoLoans.filter(loan => 
      calculateHealthFactor(loan.collateralAmount, loan.outstandingAmount) < 1.0
    ))
  }, [setLiquidationTargets])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Refresh liquidation data
        refreshLiquidationData()
      }, 30000) // Refresh every 30 seconds

      setRefreshInterval(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }, [autoRefresh, refreshInterval, refreshLiquidationData])

  // Initialize data
  useEffect(() => {
    refreshLiquidationData()
  }, [refreshLiquidationData])

  // Handle liquidation
  const handleLiquidate = async (loan: LiquidationCandidate) => {
    if (!address || isLiquidating) return

    setIsLiquidating(true)
    setLoading(true)

    try {
      const hash = await lendingPool.liquidate(loan.loanId)
      
      addNotification({
        type: 'success',
        title: 'Liquidation Submitted',
        description: `Liquidating loan #${loan.loanId.toString()} - Reward: ${formatTokenAmount(loan.liquidationReward)} COL`,
      })

      // Refresh data after transaction
      setTimeout(() => {
        refreshLiquidationData()
      }, 5000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Liquidation Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsLiquidating(false)
      setLoading(false)
    }
  }

  // Get health factor color
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-600'
    if (healthFactor >= 1.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get health factor background color
  const getHealthFactorBg = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'bg-green-50 border-green-200'
    if (healthFactor >= 1.0) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (!address) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Please connect your wallet to access liquidation monitoring
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Liquidation Monitor</h2>
            <p className="text-gray-500 mt-1">
              Monitor and liquidate unhealthy loans to earn rewards
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            <button
              onClick={refreshLiquidationData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">Liquidatable Loans</div>
          <div className="text-2xl font-bold text-red-900">
            {liquidatableLoans.length}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Total Reward Pool</div>
          <div className="text-2xl font-bold text-green-900">
            {formatTokenAmount(
              liquidatableLoans.reduce((sum, loan) => sum + loan.liquidationReward, 0n)
            )} COL
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">At Risk Loans</div>
          <div className="text-2xl font-bold text-yellow-900">
            {liquidationCandidates.filter(loan => loan.healthFactor < 1.5 && loan.healthFactor >= 1.0).length}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Monitored</div>
          <div className="text-2xl font-bold text-blue-900">
            {liquidationCandidates.length}
          </div>
        </div>
      </div>

      {/* Liquidation Candidates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liquidation Opportunities</h3>
          <p className="text-sm text-gray-500 mt-1">
            Loans with health factor below 1.0 can be liquidated for rewards
          </p>
        </div>

        {liquidationCandidates.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <p className="text-gray-500">No loans to monitor at the moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding Debt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collateral
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liquidationCandidates.map((loan) => (
                  <tr
                    key={loan.loanId.toString()}
                    className={`hover:bg-gray-50 ${loan.isLiquidatable ? 'bg-red-25' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{loan.loanId.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${loan.borrower.slice(0, 6)}...${loan.borrower.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTokenAmount(loan.outstandingAmount)} USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTokenAmount(loan.collateralAmount)} COL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getHealthFactorBg(loan.healthFactor)} ${getHealthFactorColor(loan.healthFactor)}`}
                      >
                        {loan.healthFactor === Infinity ? '∞' : loan.healthFactor.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      +{formatTokenAmount(loan.liquidationReward)} COL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {loan.isLiquidatable ? (
                        <button
                          onClick={() => handleLiquidate(loan)}
                          disabled={isLiquidating}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium text-sm"
                        >
                          {isLiquidating ? 'Liquidating...' : 'Liquidate'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Not liquidatable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Liquidation Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Liquidation Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Loan ID</span>
                <span className="font-medium">#{selectedLoan.loanId.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding Debt</span>
                <span className="font-medium">{formatTokenAmount(selectedLoan.outstandingAmount)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Collateral</span>
                <span className="font-medium">{formatTokenAmount(selectedLoan.collateralAmount)} COL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Health Factor</span>
                <span className={`font-medium ${getHealthFactorColor(selectedLoan.healthFactor)}`}>
                  {selectedLoan.healthFactor.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Your Reward</span>
                <span className="font-medium text-green-600">+{formatTokenAmount(selectedLoan.liquidationReward)} COL</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedLoan(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLiquidate(selectedLoan)
                  setSelectedLoan(null)
                }}
                disabled={isLiquidating || !selectedLoan.isLiquidatable}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                Liquidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}