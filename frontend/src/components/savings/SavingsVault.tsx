'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useSavingsVault, formatTokenAmount, parseTokenAmount } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'
import { usePriceOracle } from '@/lib/hooks/usePriceOracle'
import { useTokenConversion } from '@/lib/hooks/useTokenConversion'
import { getNativeToken, getTokenBySymbol } from '@/lib/tokens'
import TokenConverter from '@/components/conversion/TokenConverter'
import ConversionAnalytics from '@/components/conversion/ConversionAnalytics'

interface DepositFormData {
  sttAmount: string
  usdcAmount: string
}

interface WithdrawFormData {
  amount: string
}

interface SavingsVaultProps {
  defaultTab?: 'deposit' | 'withdraw' | 'convert' | 'overview';
}

export default function SavingsVault({ defaultTab = 'deposit' }: SavingsVaultProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { addNotification } = useNotificationStore()
  const { savingsAccount, setSavingsAccount, setLoading } = useDefiStore()

  // Check if we're on the correct chain (Somnia Testnet)
  const isCorrectChain = chainId === 50312

  // Contract hooks
  const savingsVault = useSavingsVault()
  const { getConversionRate, getTokenPrice } = usePriceOracle()
  const tokenConversion = useTokenConversion()
  
  // Get user's STT balance (native token balance)
  const { data: sttBalance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 50312, // Specify Somnia Testnet chain ID
    query: { 
      enabled: !!address && isCorrectChain,
      refetchInterval: 5000, // Refresh every 5 seconds
      staleTime: 1000, // Consider stale after 1 second
    }
  })

  // Local state
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'convert' | 'overview'>(defaultTab)
  const [depositForm, setDepositForm] = useState<DepositFormData>({ sttAmount: '', usdcAmount: '' })
  const [withdrawForm, setWithdrawForm] = useState<WithdrawFormData>({ amount: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conversionLoading, setConversionLoading] = useState(false)
  const [customBalance, setCustomBalance] = useState<bigint | null>(null)
  const [customBalanceLoading, setCustomBalanceLoading] = useState(false)

  // Fetch savings data
  const { data: accountInfo, refetch: refetchAccount } = savingsVault.useAccountInfo(address!)
  const { data: totalDeposits } = savingsVault.useTotalDeposits()
  const { data: pendingRewards } = savingsVault.useCalculateRewards(address!)

  // Calculate STT to USDC conversion
  const sttToUsdcRate = useMemo(() => {
    return getConversionRate('STT', 'USDC')
  }, [getConversionRate])

  // Calculate USDC amount based on STT input
  const calculatedUsdcAmount = useMemo(() => {
    if (!depositForm.sttAmount || parseFloat(depositForm.sttAmount) <= 0) return '0'
    const sttAmount = parseFloat(depositForm.sttAmount)
    const usdcAmount = sttAmount * sttToUsdcRate
    return usdcAmount.toFixed(6)
  }, [depositForm.sttAmount, sttToUsdcRate])

  // Update USDC amount when STT amount changes
  useEffect(() => {
    setDepositForm(prev => ({ ...prev, usdcAmount: calculatedUsdcAmount }))
  }, [calculatedUsdcAmount])

  // Custom balance fetching function
  const fetchCustomBalance = async () => {
    if (!address || !publicClient || !isCorrectChain) return

    setCustomBalanceLoading(true)
    try {
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`
      })
      setCustomBalance(balance)
      console.log('Custom balance fetch result:', { balance: balance.toString() })
    } catch (error) {
      console.error('Error fetching custom balance:', error)
      setCustomBalance(null)
    } finally {
      setCustomBalanceLoading(false)
    }
  }

  // Use custom balance as fallback if wagmi balance fails
  const effectiveBalance = sttBalance?.value || customBalance
  const effectiveBalanceLoading = balanceLoading || customBalanceLoading

  // Format STT balance
  const sttBalanceFormatted = useMemo(() => {
    if (effectiveBalanceLoading) return '...'
    if (!effectiveBalance) return '0'
    return formatUnits(effectiveBalance, 18)
  }, [effectiveBalance, effectiveBalanceLoading])

  // Auto-fetch custom balance when wagmi balance is 0
  useEffect(() => {
    if (address && isCorrectChain && !balanceLoading && (!sttBalance?.value || sttBalance.value === 0n)) {
      console.log('Wagmi balance is 0 or null, trying custom balance fetch...')
      fetchCustomBalance()
    }
  }, [address, isCorrectChain, balanceLoading, sttBalance?.value])

  // Debug log to check balance data
  useEffect(() => {
    console.log('Balance data:', { 
      address, 
      chainId,
      isCorrectChain,
      wagmiBalance: sttBalance, 
      wagmiBalanceValue: sttBalance?.value?.toString(),
      customBalance: customBalance?.toString(),
      effectiveBalance: effectiveBalance?.toString(),
      balanceLoading, 
      customBalanceLoading,
      effectiveBalanceLoading,
      formatted: sttBalanceFormatted,
      balanceDecimals: sttBalance?.decimals,
      balanceSymbol: sttBalance?.symbol
    })
  }, [address, chainId, isCorrectChain, sttBalance, customBalance, effectiveBalance, balanceLoading, customBalanceLoading, effectiveBalanceLoading, sttBalanceFormatted])

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

    const { sttAmount, usdcAmount } = depositForm
    if (!sttAmount || parseFloat(sttAmount) <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        description: 'Please enter a valid STT amount',
      })
      return
    }

    // Check if user has sufficient STT balance
    const sttAmountNum = parseFloat(sttAmount)
    const availableSTT = parseFloat(sttBalanceFormatted)
    if (sttAmountNum > availableSTT) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        description: `You only have ${availableSTT.toFixed(4)} STT available`,
      })
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    setConversionLoading(true)

    try {
      // First convert STT to USDC
      addNotification({
        type: 'info',
        title: 'Converting STT to USDC',
        description: `Converting ${sttAmount} STT to ${usdcAmount} USDC...`,
      })

      // Simulate STT to USDC conversion (in real implementation, this would call the conversion contract)
      const nativeToken = getNativeToken()
      const usdcToken = getTokenBySymbol('USDC')!
      
      // Get conversion quote
      const quote = await tokenConversion.getQuote(nativeToken, usdcToken, sttAmount)
      if (!quote) {
        throw new Error('Unable to get conversion quote')
      }

      // Execute the conversion
      const conversionHash = await tokenConversion.executeConversion(quote)
      
      addNotification({
        type: 'success',
        title: 'Conversion Completed',
        description: `Converted ${sttAmount} STT to ${quote.outputAmount} USDC`,
      })

      // Now deposit the USDC to savings vault
      const usdcAmountWei = parseTokenAmount(quote.outputAmount)
      const depositHash = await savingsVault.deposit(usdcAmountWei)
      
      addNotification({
        type: 'success',
        title: 'Deposit Submitted',
        description: `Depositing ${quote.outputAmount} USDC to savings vault`,
      })

      // Reset form
      setDepositForm({ sttAmount: '', usdcAmount: '' })
      
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
      setConversionLoading(false)
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

  // Handle claim rewards - Note: Rewards auto-compound in this vault design
  const handleClaimRewards = async () => {
    if (!address || isSubmitting) return

    // Since rewards are auto-compounded, we inform the user and refresh their balance
    addNotification({
      type: 'info',
      title: 'Auto-Compounded Rewards',
      description: 'Your rewards are automatically compounded into your balance. No manual claim needed!',
    })

    // Refresh account data to show updated compounded balance
    setTimeout(() => {
      refetchAccount()
    }, 1000)
  }

  // Calculate projected earnings based on USDC amount
  const calculateProjectedEarnings = (usdcAmount: string, months: number) => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) return 0
    const principal = parseFloat(usdcAmount)
    const monthlyRate = calculateAPY() / 100 / 12
    return principal * monthlyRate * months
  }

  // Handle max STT button
  const handleMaxSTT = () => {
    const maxSTT = (parseFloat(sttBalanceFormatted) * 0.99).toFixed(6) // Leave some for gas
    setDepositForm(prev => ({ ...prev, sttAmount: maxSTT }))
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

  if (!isCorrectChain) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <p className="text-yellow-600 mb-4">
            Please switch to Somnia Testnet to use the savings vault
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
            <p><strong>Current Chain:</strong> {chainId}</p>
            <p><strong>Required Chain:</strong> 50312 (Somnia Testnet)</p>
            <p className="mt-2">Switch your wallet to the Somnia Testnet to see your STT balance and use the savings features.</p>
          </div>
        </div>
      </div>
    )
  }

  // Debug: Show connection info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Wallet connection debug:', {
      address,
      isConnected: !!address,
      sttBalance: sttBalance,
      balanceValue: sttBalance?.value?.toString(),
      decimals: sttBalance?.decimals,
      symbol: sttBalance?.symbol,
      formatted: sttBalanceFormatted
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['deposit', 'withdraw', 'convert', 'overview'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'convert' ? 'Convert' : tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
              {pendingRewards && typeof pendingRewards === 'bigint' ? formatTokenAmount(pendingRewards) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Current APY</div>
            <div className="text-2xl font-bold text-yellow-900">
              {calculateAPY()}%
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-indigo-600 font-medium">STT Balance</div>
              <button 
                onClick={() => {
                  refetchBalance()
                  fetchCustomBalance()
                }}
                className="text-xs text-indigo-500 hover:text-indigo-700 p-1"
                title="Refresh balance"
              >
                🔄
              </button>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {effectiveBalanceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${parseFloat(sttBalanceFormatted || '0').toFixed(4)} STT`
              )}
            </div>
            <div className="text-xs text-indigo-600 mt-1">
              {effectiveBalanceLoading ? (
                'Calculating...'
              ) : (
                `≈ $${(parseFloat(sttBalanceFormatted || '0') * sttToUsdcRate).toFixed(2)} USD`
              )}
            </div>
          </div>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (STT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={depositForm.sttAmount}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, sttAmount: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="0.000000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleMaxSTT}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded"
                    >
                      MAX
                    </button>
                    <span className="text-gray-500 text-sm">STT</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>
                    Available: {effectiveBalanceLoading ? 'Loading...' : `${parseFloat(sttBalanceFormatted || '0').toFixed(6)} STT`}
                    {address && !effectiveBalanceLoading && sttBalanceFormatted === '0' && (
                      <button 
                        onClick={() => {
                          refetchBalance()
                          fetchCustomBalance()
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-xs underline"
                      >
                        Refresh
                      </button>
                    )}
                  </span>
                  <span>Rate: 1 STT = {sttToUsdcRate.toFixed(6)} USDC</span>
                </div>
              </div>

              {/* Conversion Preview */}
              {depositForm.sttAmount && parseFloat(depositForm.sttAmount) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Conversion Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">STT Amount:</span>
                      <span className="font-medium text-blue-900">{depositForm.sttAmount} STT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">USDC Received:</span>
                      <span className="font-medium text-blue-900">{depositForm.usdcAmount} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Conversion Rate:</span>
                      <span className="font-medium text-blue-900">1 STT = {sttToUsdcRate.toFixed(6)} USDC</span>
                    </div>
                    {conversionLoading && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span>Processing conversion...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Projected Earnings */}
              {depositForm.usdcAmount && parseFloat(depositForm.usdcAmount) > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Projected Earnings (in USDC)</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">1 Month</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.usdcAmount, 1).toFixed(4)} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">6 Months</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.usdcAmount, 6).toFixed(4)} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">1 Year</p>
                      <p className="font-medium text-gray-900">
                        +{calculateProjectedEarnings(depositForm.usdcAmount, 12).toFixed(4)} USDC
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !depositForm.sttAmount || parseFloat(depositForm.sttAmount) <= 0 || parseFloat(depositForm.sttAmount) > parseFloat(sttBalanceFormatted)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting ? 'Converting & Depositing...' : `Convert ${depositForm.sttAmount || '0'} STT & Deposit`}
              </button>
            </form>
          </div>
        )}

        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Token Conversion</h4>
              <p className="text-blue-600 text-sm">
                Convert your STT to preferred stablecoins or manage your token portfolio. 
                The deposit feature automatically converts STT to USDC, but you can use this tool for other conversions.
              </p>
            </div>
            
            <TokenConverter />
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Why Convert?</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Stability:</strong> Reduce price volatility with stablecoins</li>
                <li>• <strong>Yield:</strong> Earn consistent returns on stable assets</li>
                <li>• <strong>Diversification:</strong> Spread risk across different stable assets</li>
                <li>• <strong>Flexibility:</strong> Choose your preferred stablecoin (USDC, USDT, DAI, FRAX)</li>
              </ul>
            </div>
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

            {/* Auto-Compounding Info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-blue-800">Auto-Compounding Rewards</h4>
                  <p className="text-blue-600">
                    Your rewards are automatically compounded into your balance every block
                  </p>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  Refresh Balance
                </button>
              </div>
            </div>

            {/* Protocol Stats and Conversion Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Total Protocol Deposits</h4>
                  <p className="text-xl font-bold text-blue-600">
                    {totalDeposits && typeof totalDeposits === 'bigint' ? formatTokenAmount(totalDeposits) : '0'} USDC
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Your Share</h4>
                  <p className="text-xl font-bold text-purple-600">
                    {savingsAccount && totalDeposits && typeof totalDeposits === 'bigint' && totalDeposits > 0n
                      ? ((Number(savingsAccount.totalDeposited) / Number(totalDeposits)) * 100).toFixed(2)
                      : '0'
                    }%
                  </p>
                </div>
              </div>
              
              <ConversionAnalytics />
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