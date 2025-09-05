'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useLendingPool, useCreditOracle, formatTokenAmount, parseTokenAmount, calculateHealthFactor } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'

interface BorrowFormData {
  amount: string
  duration: string
  collateralAmount: string
}

interface RepayFormData {
  loanId: string
  amount: string
}

export default function LoanManagement() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { userLoans, creditScore, setUserLoans, setLoading } = useDefiStore()

  // Contract hooks
  const lendingPool = useLendingPool()
  const creditOracle = useCreditOracle()

  // Local state
  const [activeTab, setActiveTab] = useState<'borrow' | 'repay' | 'manage'>('borrow')
  const [borrowForm, setBorrowForm] = useState<BorrowFormData>({
    amount: '',
    duration: '30',
    collateralAmount: '',
  })
  const [repayForm, setRepayForm] = useState<RepayFormData>({
    loanId: '',
    amount: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch user loans
  const { data: loansData, refetch: refetchLoans } = lendingPool.getUserLoans(address!)
  const { data: activeLoanIds } = lendingPool.getActiveLoanIds(address!)
  const { data: eligibilityCheck } = creditOracle.checkLoanEligibility(
    address!,
    borrowForm.amount ? parseTokenAmount(borrowForm.amount) : 0n
  )
  const { data: collateralRequired } = creditOracle.calculateCollateralRequirement(
    address!,
    borrowForm.amount ? parseTokenAmount(borrowForm.amount) : 0n
  )

  // Update store when loans data changes
  useEffect(() => {
    if (loansData && Array.isArray(loansData)) {
      setUserLoans(loansData)
    }
  }, [loansData, setUserLoans])

  // Handle borrow form submission
  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || isSubmitting) return

    const { amount, duration, collateralAmount } = borrowForm
    if (!amount || !collateralAmount) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        description: 'Please fill in all required fields',
      })
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const amountWei = parseTokenAmount(amount)
      const collateralWei = parseTokenAmount(collateralAmount)
      const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60) // days to seconds

      const hash = await lendingPool.borrow(amountWei, collateralWei, durationSeconds)
      
      addNotification({
        type: 'success',
        title: 'Loan Request Submitted',
        description: `Borrowing ${amount} tokens with ${collateralAmount} collateral`,
      })

      // Reset form
      setBorrowForm({ amount: '', duration: '30', collateralAmount: '' })
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchLoans()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Loan Request Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle repay form submission
  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || isSubmitting) return

    const { loanId, amount } = repayForm
    if (!loanId || !amount) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        description: 'Please select a loan and enter amount',
      })
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const amountWei = parseTokenAmount(amount)
      const hash = await lendingPool.repay(BigInt(loanId), amountWei)
      
      addNotification({
        type: 'success',
        title: 'Repayment Submitted',
        description: `Repaying ${amount} tokens for loan #${loanId}`,
      })

      // Reset form
      setRepayForm({ loanId: '', amount: '' })
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchLoans()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Repayment Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const handleLiquidate = async (loanId: bigint) => {
    if (!address || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const hash = await lendingPool.liquidate(loanId)
      
      addNotification({
        type: 'success',
        title: 'Liquidation Submitted',
        description: `Liquidating loan #${loanId.toString()}`,
      })

      setTimeout(() => {
        refetchLoans()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Liquidation Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!address) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Please connect your wallet to manage loans
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['borrow', 'repay', 'manage'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Borrow Tab */}
        {activeTab === 'borrow' && (
          <form onSubmit={handleBorrow} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={borrowForm.amount}
                  onChange={(e) => setBorrowForm({ ...borrowForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {eligibilityCheck && !eligibilityCheck[0] && (
                  <p className="mt-1 text-sm text-red-600">{eligibilityCheck[1]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Amount (COL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={borrowForm.collateralAmount}
                  onChange={(e) => setBorrowForm({ ...borrowForm, collateralAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {collateralRequired && (
                  <p className="mt-1 text-sm text-gray-500">
                    Required: {formatTokenAmount(collateralRequired)} COL
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Days)
                </label>
                <select
                  value={borrowForm.duration}
                  onChange={(e) => setBorrowForm({ ...borrowForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="365">365 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Credit Score
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className={`font-medium ${
                    creditScore >= 750 ? 'text-green-600' :
                    creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {creditScore}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !eligibilityCheck?.[0]}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Processing...' : 'Request Loan'}
            </button>
          </form>
        )}

        {/* Repay Tab */}
        {activeTab === 'repay' && (
          <form onSubmit={handleRepay} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loan
                </label>
                <select
                  value={repayForm.loanId}
                  onChange={(e) => setRepayForm({ ...repayForm, loanId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a loan...</option>
                  {userLoans
                    .filter(loan => loan.status === 0) // Active loans only
                    .map((loan) => (
                      <option key={loan.loanId.toString()} value={loan.loanId.toString()}>
                        Loan #{loan.loanId.toString()} - {formatTokenAmount(loan.outstandingAmount)} USDC
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={repayForm.amount}
                  onChange={(e) => setRepayForm({ ...repayForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !repayForm.loanId || !repayForm.amount}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Processing...' : 'Repay Loan'}
            </button>
          </form>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {userLoans.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No loans found. Request your first loan using the Borrow tab.
              </p>
            ) : (
              <div className="space-y-4">
                {userLoans.map((loan) => {
                  const healthFactor = calculateHealthFactor(
                    loan.collateralAmount,
                    loan.outstandingAmount
                  )
                  const isHealthy = healthFactor > 1.0
                  
                  return (
                    <div
                      key={loan.loanId.toString()}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Loan #{loan.loanId.toString()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Status: {
                              loan.status === 0 ? 'Active' :
                              loan.status === 1 ? 'Repaid' : 'Liquidated'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatTokenAmount(loan.outstandingAmount)} USDC
                          </p>
                          <p className="text-sm text-gray-500">Outstanding</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Principal</p>
                          <p className="font-medium">{formatTokenAmount(loan.principalAmount)} USDC</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Collateral</p>
                          <p className="font-medium">{formatTokenAmount(loan.collateralAmount)} COL</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Interest Rate</p>
                          <p className="font-medium">{Number(loan.interestRate) / 100}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Health Factor</p>
                          <p className={`font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                            {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {loan.status === 0 && (
                        <div className="flex space-x-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => setRepayForm({
                              loanId: loan.loanId.toString(),
                              amount: formatTokenAmount(loan.outstandingAmount)
                            })}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                          >
                            Repay Full
                          </button>
                          {!isHealthy && (
                            <button
                              onClick={() => handleLiquidate(loan.loanId)}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                            >
                              Liquidate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}