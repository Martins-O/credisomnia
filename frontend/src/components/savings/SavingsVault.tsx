'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { useSavingsVault, formatTokenAmount, parseTokenAmount } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'

interface DepositFormData {
  amount: string
}

interface WithdrawFormData {
  amount: string
}

export default function SavingsVault() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { savingsAccount, setSavingsAccount, setLoading } = useDefiStore()

  // Contract hooks
  const savingsVault = useSavingsVault()

  // Local state
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'overview'>('deposit')
  const [depositForm, setDepositForm] = useState<DepositFormData>({ amount: '' })
  const [withdrawForm, setWithdrawForm] = useState<WithdrawFormData>({ amount: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch savings data
  const { data: accountInfo, refetch: refetchAccount } = savingsVault.getAccountInfo(address!)
  const { data: totalDeposits } = savingsVault.getTotalDeposits()
  const { data: pendingRewards } = savingsVault.calculateRewards(address!)

  // Update store when account info changes
  useEffect(() => {
    if (accountInfo && Array.isArray(accountInfo) && accountInfo.length >= 4) {
      setSavingsAccount({
        totalDeposited: accountInfo[0] as bigint,
        rewardsEarned: accountInfo[1] as bigint,
        lastDepositTime: accountInfo[2] as bigint,
        isActive: accountInfo[3] as boolean,
      })
    }
  }, [accountInfo, setSavingsAccount])

  // Calculate APY (annual percentage yield)
  const calculateAPY = () => {
    // This would typically come from the contract or be calculated based on historical data
    // For now, we'll use a placeholder of 5% APY
    return 5.0
  }

  // Handle deposit form submission
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || isSubmitting) return

    const { amount } = depositForm
    if (!amount || parseFloat(amount) <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        description: 'Please enter a valid deposit amount',
      })
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const amountWei = parseTokenAmount(amount)
      const hash = await savingsVault.deposit(amountWei)
      
      addNotification({
        type: 'success',
        title: 'Deposit Submitted',
        description: `Depositing ${amount} USDC to savings vault`,
      })

      // Reset form
      setDepositForm({ amount: '' })
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchAccount()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Deposit Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle withdraw form submission
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || isSubmitting) return

    const { amount } = withdrawForm
    if (!amount || parseFloat(amount) <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount',
      })
      return
    }

    if (savingsAccount && parseTokenAmount(amount) > savingsAccount.totalDeposited) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        description: 'Withdrawal amount exceeds deposited balance',
      })
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const amountWei = parseTokenAmount(amount)
      const hash = await savingsVault.withdraw(amountWei)
      
      addNotification({
        type: 'success',
        title: 'Withdrawal Submitted',
        description: `Withdrawing ${amount} USDC from savings vault`,
      })

      // Reset form
      setWithdrawForm({ amount: '' })
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchAccount()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle claim rewards
  const handleClaimRewards = async () => {
    if (!address || isSubmitting || !pendingRewards || pendingRewards === 0n) return

    setIsSubmitting(true)
    
    try {
      const hash = await savingsVault.claimRewards()
      
      addNotification({
        type: 'success',
        title: 'Rewards Claimed',
        description: `Claiming ${formatTokenAmount(pendingRewards)} USDC in rewards`,
      })

      setTimeout(() => {
        refetchAccount()
      }, 3000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Claim Failed',
        description: error?.message || 'Transaction failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate projected earnings
  const calculateProjectedEarnings = (amount: string, months: number) => {
    if (!amount || parseFloat(amount) <= 0) return 0
    const principal = parseFloat(amount)
    const monthlyRate = calculateAPY() / 100 / 12
    return principal * monthlyRate * months
  }

  if (!address) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Please connect your wallet to access the savings vault
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['deposit', 'withdraw', 'overview'] as const).map((tab) => (
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Your Balance</div>
            <div className="text-2xl font-bold text-blue-900">
              {savingsAccount ? formatTokenAmount(savingsAccount.totalDeposited) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Rewards Earned</div>
            <div className="text-2xl font-bold text-green-900">
              {savingsAccount ? formatTokenAmount(savingsAccount.rewardsEarned) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Pending Rewards</div>
            <div className="text-2xl font-bold text-purple-900">
              {pendingRewards ? formatTokenAmount(pendingRewards) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Current APY</div>
            <div className="text-2xl font-bold text-yellow-900">
              {calculateAPY()}%
            </div>
          </div>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({ amount: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              {/* Projected Earnings */}
              {depositForm.amount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Projected Earnings</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">1 Month</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.amount, 1).toFixed(4)} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">6 Months</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.amount, 6).toFixed(4)} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">1 Year</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.amount, 12).toFixed(4)} USDC
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !depositForm.amount || parseFloat(depositForm.amount) <= 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting ? 'Processing...' : 'Deposit'}
              </button>
            </form>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    max={savingsAccount ? formatTokenAmount(savingsAccount.totalDeposited) : undefined}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ amount: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">USDC</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Available: {savingsAccount ? formatTokenAmount(savingsAccount.totalDeposited) : '0'} USDC
                  </p>
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ 
                      amount: savingsAccount ? formatTokenAmount(savingsAccount.totalDeposited) : '0' 
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Max
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting ? 'Processing...' : 'Withdraw'}
              </button>
            </form>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Deposited</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {savingsAccount ? formatTokenAmount(savingsAccount.totalDeposited) : '0'} USDC
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{savingsAccount ? formatTokenAmount(savingsAccount.rewardsEarned) : '0'} USDC
                  </p>
                </div>
              </div>
            </div>

            {/* Claim Rewards */}
            {pendingRewards && pendingRewards > 0n && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-green-800">Rewards Available</h4>
                    <p className="text-green-600">
                      {formatTokenAmount(pendingRewards)} USDC ready to claim
                    </p>
                  </div>
                  <button
                    onClick={handleClaimRewards}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Claiming...' : 'Claim Rewards'}
                  </button>
                </div>
              </div>
            )}

            {/* Protocol Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Total Protocol Deposits</h4>
                <p className="text-xl font-bold text-blue-600">
                  {totalDeposits ? formatTokenAmount(totalDeposits) : '0'} USDC
                </p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Your Share</h4>
                <p className="text-xl font-bold text-purple-600">
                  {savingsAccount && totalDeposits && totalDeposits > 0n
                    ? ((Number(savingsAccount.totalDeposited) / Number(totalDeposits)) * 100).toFixed(2)
                    : '0'
                  }%
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Account Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    savingsAccount?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {savingsAccount?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {savingsAccount?.lastDepositTime && savingsAccount.lastDepositTime > 0n && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Deposit</span>
                    <span className="text-gray-900">
                      {new Date(Number(savingsAccount.lastDepositTime) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}