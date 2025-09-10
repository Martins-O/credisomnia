'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAccount, useBalance, useChainId, usePublicClient, useWatchBlockNumber } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useSavingsVault, parseTokenAmount } from '@/lib/hooks/useContracts'
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
  const [lastFetchedBlock, setLastFetchedBlock] = useState<bigint | null>(null)
  const [rpcStatus, setRpcStatus] = useState<'connected' | 'error' | 'unknown'>('unknown')
  
  // Demo state for simulated balances
  const [simulatedSavingsBalance, setSimulatedSavingsBalance] = useState<bigint>(0n)
  const [simulatedWalletDeduction, setSimulatedWalletDeduction] = useState<bigint>(0n)

  // Watch for new blocks to trigger balance updates (with reliable Ankr RPC)
  useWatchBlockNumber({
    onBlockNumber(blockNumber) {
      console.log('New block detected:', blockNumber.toString())
      // Only fetch balance if we haven't fetched for this block yet
      if (address && isCorrectChain && (!lastFetchedBlock || blockNumber > lastFetchedBlock)) {
        console.log('Triggering balance fetch with Ankr RPC for new block:', blockNumber.toString())
        fetchBalanceWithFallbacks(blockNumber)
      }
    },
    enabled: !!address && isCorrectChain,
    poll: true,
    pollingInterval: 5000, // Back to 5 seconds with reliable RPC
  })

  // Fetch savings data
  const { data: accountInfo, refetch: refetchAccount } = savingsVault.useAccountInfo(address!)
  const { data: totalDeposits } = savingsVault.useTotalDeposits()
  const { data: pendingRewards } = savingsVault.useCalculateRewards(address!)

  // Calculate STT to USDC rate for display purposes
  const sttToUsdcRate = useMemo(() => {
    return getConversionRate('STT', 'USDC')
  }, [getConversionRate])

  // Calculate USDC equivalent for display (not used in actual transactions)
  const calculatedUsdcAmount = useMemo(() => {
    if (!depositForm.sttAmount || parseFloat(depositForm.sttAmount) <= 0) return '0'
    const sttAmount = parseFloat(depositForm.sttAmount)
    const usdcAmount = sttAmount * sttToUsdcRate
    return usdcAmount.toFixed(6)
  }, [depositForm.sttAmount, sttToUsdcRate])

  // Event-driven balance fetching function with silent operation
  const fetchEventDrivenBalance = useCallback(async (blockNumber?: bigint) => {
    if (!address || !publicClient || !isCorrectChain) return

    console.log('Silently fetching balance for block:', blockNumber?.toString() || 'current')
    
    try {
      // First try with specific block number, then fallback to latest
      let balance: bigint
      
      try {
        balance = await publicClient.getBalance({
          address: address as `0x${string}`,
          blockNumber: blockNumber ? blockNumber : undefined
        })
      } catch (blockError) {
        console.warn('Failed to fetch balance at specific block, trying latest:', blockError)
        // Fallback to latest block
        balance = await publicClient.getBalance({
          address: address as `0x${string}`,
        })
      }
      
      setCustomBalance(balance)
      if (blockNumber) setLastFetchedBlock(blockNumber)
      setRpcStatus('connected') // Mark RPC as working
      
      console.log('Silent balance update:', { 
        balance: balance.toString(),
        balanceFormatted: formatUnits(balance, 18),
        blockNumber: blockNumber?.toString() || 'latest'
      })
    } catch (error) {
      console.error('Silent balance fetch failed:', error)
      setRpcStatus('error') // Mark RPC as having issues
      
      // Silent operation - no user notifications, just console logs
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn('RPC endpoint unreachable, will try wallet fallback')
        } else if (error.message.includes('CORS')) {
          console.warn('CORS issue with RPC, will try wallet fallback')
        }
      }
      
      // Don't set balance to null if we already have one - keep the existing balance
      // setCustomBalance(null)
    }
  }, [address, publicClient, isCorrectChain])

  // Wallet-based balance fetching as ultimate fallback using window.ethereum
  const fetchWalletBalance = useCallback(async () => {
    if (!address) return null

    console.log('Trying wallet-based balance fetch via window.ethereum...')
    try {
      // Use window.ethereum directly as a fallback
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        })
        const balance = BigInt(balanceHex)
        console.log('Wallet balance fetch result:', { 
          balance: balance.toString(),
          balanceFormatted: formatUnits(balance, 18)
        })
        return balance
      }
      return null
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      return null
    }
  }, [address])

  // Enhanced balance fetching with multiple fallbacks (silent operation)
  const fetchBalanceWithFallbacks = useCallback(async (blockNumber?: bigint) => {
    // Silent loading - don't show loading states to user
    
    try {
      // Method 1: Try public RPC client
      if (publicClient) {
        await fetchEventDrivenBalance(blockNumber)
        return
      }
    } catch (error) {
      console.warn('Public client failed, trying wallet client')
    }
    
    try {
      // Method 2: Try wallet client as fallback
      const walletBalance = await fetchWalletBalance()
      if (walletBalance) {
        setCustomBalance(walletBalance)
        setRpcStatus('error') // Mark as fallback mode, but no user notification
        return
      }
    } catch (error) {
      console.warn('Wallet client also failed')
    }
    
    // Method 3: Silent failure - just log it, don't bother user
    console.warn('All balance fetch methods failed. Balance may not be current.')
    setRpcStatus('error')
  }, [publicClient, fetchEventDrivenBalance, fetchWalletBalance])

  // Legacy custom balance fetching function (for manual refresh)
  const fetchCustomBalance = async () => {
    return fetchBalanceWithFallbacks()
  }

  // Use custom balance as fallback if wagmi balance fails, minus simulated deductions
  const rawBalance = sttBalance?.value || customBalance
  const effectiveBalance = rawBalance ? rawBalance - simulatedWalletDeduction : null
  const effectiveBalanceLoading = balanceLoading || customBalanceLoading

  // Format STT balance (no loading states - update silently)
  const sttBalanceFormatted = useMemo(() => {
    if (!effectiveBalance) return '0'
    return formatUnits(effectiveBalance, 18)
  }, [effectiveBalance])

  // Initial balance fetch when component mounts or wallet connects
  useEffect(() => {
    if (address && isCorrectChain && !customBalance) {
      console.log('Initial balance fetch on wallet connection with Ankr RPC...')
      console.log('Using RPC URL:', process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/somnia_testnet/cc6c398a6a58ec4606b6694cdd5f950cd021df6bd998733fc2776f6b0e7664cc')
      fetchBalanceWithFallbacks()
    }
  }, [address, isCorrectChain, customBalance, fetchBalanceWithFallbacks])

  // Auto-fetch balance when wagmi balance is 0 or fails
  useEffect(() => {
    if (address && isCorrectChain && !balanceLoading && (!sttBalance?.value || sttBalance.value === 0n) && !customBalance) {
      console.log('Wagmi balance is 0 or null, trying enhanced balance fetch...')
      fetchBalanceWithFallbacks()
    }
  }, [address, isCorrectChain, balanceLoading, sttBalance?.value, customBalance, fetchBalanceWithFallbacks])

  // Listen for balance refresh events (e.g., after token conversions)
  useEffect(() => {
    const handleRefreshBalances = () => {
      console.log('Received balance refresh event, updating balances...')
      refetchBalance()
      fetchBalanceWithFallbacks()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('refreshBalances', handleRefreshBalances)
      return () => window.removeEventListener('refreshBalances', handleRefreshBalances)
    }
  }, [refetchBalance, fetchBalanceWithFallbacks])

  // Debug log to check balance data
  useEffect(() => {
    console.log('Balance data:', { 
      address, 
      chainId,
      isCorrectChain,
      lastFetchedBlock: lastFetchedBlock?.toString(),
      wagmiBalance: sttBalance, 
      wagmiBalanceValue: sttBalance?.value?.toString(),
      eventDrivenBalance: customBalance?.toString(),
      effectiveBalance: effectiveBalance?.toString(),
      balanceLoading, 
      eventBalanceLoading: customBalanceLoading,
      effectiveBalanceLoading,
      formatted: sttBalanceFormatted,
      balanceDecimals: sttBalance?.decimals,
      balanceSymbol: sttBalance?.symbol
    })
  }, [address, chainId, isCorrectChain, lastFetchedBlock, sttBalance, customBalance, effectiveBalance, balanceLoading, customBalanceLoading, effectiveBalanceLoading, sttBalanceFormatted])

  // Update store when account info changes, including simulated deposits
  useEffect(() => {
    if (accountInfo && Array.isArray(accountInfo) && accountInfo.length >= 4) {
      setSavingsAccount({
        totalDeposited: (accountInfo[0] as bigint) + simulatedSavingsBalance,
        rewardsEarned: accountInfo[1] as bigint,
        lastDepositTime: accountInfo[2] as bigint,
        isActive: accountInfo[3] as boolean || simulatedSavingsBalance > 0n,
      })
    } else if (simulatedSavingsBalance > 0n) {
      // If no account info but we have simulated deposits, create a mock account
      setSavingsAccount({
        totalDeposited: simulatedSavingsBalance,
        rewardsEarned: 0n,
        lastDepositTime: BigInt(Math.floor(Date.now() / 1000)),
        isActive: true,
      })
    }
  }, [accountInfo, setSavingsAccount, simulatedSavingsBalance])

  // Calculate APY (annual percentage yield)
  const calculateAPY = () => {
    // This would typically come from the contract or be calculated based on historical data
    // For now, we'll use a placeholder of 5% APY
    return 5.0
  }

  // Handle deposit form submission - Demo STT deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || isSubmitting) return

    const { sttAmount } = depositForm
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

    try {
      // Demo STT deposit simulation
      addNotification({
        type: 'info',
        title: 'Depositing STT',
        description: `Depositing ${sttAmount} STT to savings vault...`,
      })

      // Convert STT amount to Wei for simulation
      const sttAmountWei = parseUnits(sttAmount, 18) // STT has 18 decimals
      
      // Simulate transaction time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update simulated balances
      setSimulatedSavingsBalance(prev => prev + sttAmountWei)
      setSimulatedWalletDeduction(prev => prev + sttAmountWei)
      
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
      
      addNotification({
        type: 'success',
        title: 'Deposit Completed',
        description: `Successfully deposited ${sttAmount} STT to savings vault. Transaction: ${mockTxHash.substring(0, 10)}...`,
      })

      // Reset form
      setDepositForm({ sttAmount: '', usdcAmount: '' })
      
      // Trigger balance refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshBalances'))
      }
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchAccount()
        refetchBalance()
      }, 1000)

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

  // Handle withdraw form submission - Demo STT withdrawal
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

    if (savingsAccount && parseUnits(amount, 18) > savingsAccount.totalDeposited) {
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
      // Convert STT amount to Wei
      const amountWei = parseUnits(amount, 18)
      
      // Simulate transaction time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update simulated balances
      setSimulatedSavingsBalance(prev => prev - amountWei)
      setSimulatedWalletDeduction(prev => prev - amountWei)
      
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
      
      addNotification({
        type: 'success',
        title: 'Withdrawal Submitted',
        description: `Withdrawing ${amount} STT from savings vault. Transaction: ${mockTxHash.substring(0, 10)}...`,
      })

      // Reset form
      setWithdrawForm({ amount: '' })
      
      // Trigger balance refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshBalances'))
      }
      
      // Refresh data after transaction
      setTimeout(() => {
        refetchAccount()
        refetchBalance()
      }, 1000)

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

      {/* Demo Warning */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-5 h-5 text-yellow-600 mt-0.5">
            ⚠️
          </div>
          <div className="text-sm">
            <p className="text-yellow-800 font-medium">Demo Mode - Testnet Simulation</p>
            <p className="text-yellow-700 mt-1">
              Deposits and withdrawals are simulated for demo purposes. Your wallet balance changes are temporary and local to this session.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Your Balance</div>
            <div className="text-2xl font-bold text-blue-900">
              {savingsAccount ? formatUnits(savingsAccount.totalDeposited, 18) : '0'} STT
            </div>
            <div className="text-xs text-blue-600 mt-1">
              ~{savingsAccount ? (parseFloat(formatUnits(savingsAccount.totalDeposited, 18)) * sttToUsdcRate).toFixed(4) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Rewards Earned</div>
            <div className="text-2xl font-bold text-green-900">
              {savingsAccount ? formatUnits(savingsAccount.rewardsEarned, 18) : '0'} STT
            </div>
            <div className="text-xs text-green-600 mt-1">
              ~{savingsAccount ? (parseFloat(formatUnits(savingsAccount.rewardsEarned, 18)) * sttToUsdcRate).toFixed(4) : '0'} USDC
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Pending Rewards</div>
            <div className="text-2xl font-bold text-purple-900">
              {pendingRewards && typeof pendingRewards === 'bigint' ? formatUnits(pendingRewards, 18) : '0'} STT
            </div>
            <div className="text-xs text-purple-600 mt-1">
              ~{pendingRewards && typeof pendingRewards === 'bigint' ? (parseFloat(formatUnits(pendingRewards, 18)) * sttToUsdcRate).toFixed(4) : '0'} USDC
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
              <div className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                STT Balance
                {/* Silent background updates - no loading spinner */}
                {rpcStatus === 'error' && (
                  <span className="text-xs text-gray-400 opacity-50" title="Using wallet fallback">
                    •
                  </span>
                )}
                {rpcStatus === 'connected' && lastFetchedBlock && (
                  <span className="text-xs text-green-500 opacity-60" title={`Live updates from block ${lastFetchedBlock}`}>
                    •
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  refetchBalance()
                  fetchCustomBalance()
                }}
                className="text-xs text-indigo-500 hover:text-indigo-700 p-1"
                title="Manual refresh balance"
              >
                🔄
              </button>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {`${parseFloat(sttBalanceFormatted || '0').toFixed(4)} STT`}
            </div>
            <div className="text-xs text-indigo-600 mt-1">
              {`≈ $${(parseFloat(sttBalanceFormatted || '0') * sttToUsdcRate).toFixed(2)} USD`}
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
                    Available: {`${parseFloat(sttBalanceFormatted || '0').toFixed(6)} STT`}
                    {address && sttBalanceFormatted === '0' && (
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
                  <span>Reference: 1 STT = {sttToUsdcRate.toFixed(6)} USDC</span>
                </div>
              </div>

              {/* Deposit Preview */}
              {depositForm.sttAmount && parseFloat(depositForm.sttAmount) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Deposit Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Depositing:</span>
                      <span className="font-medium text-green-900">{depositForm.sttAmount} STT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Estimated APY:</span>
                      <span className="font-medium text-green-900">{calculateAPY().toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Value (USDC equivalent):</span>
                      <span className="font-medium text-green-900">~{calculatedUsdcAmount} USDC</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Projected Earnings */}
              {depositForm.sttAmount && parseFloat(depositForm.sttAmount) > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Projected Earnings (STT)</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">1 Month</p>
                      <p className="font-medium text-gray-900">
                        +{(parseFloat(depositForm.sttAmount) * (calculateAPY() / 100 / 12)).toFixed(6)} STT
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">6 Months</p>
                      <p className="font-medium text-gray-900">
                        +{(parseFloat(depositForm.sttAmount) * (calculateAPY() / 100 / 12) * 6).toFixed(6)} STT
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">1 Year</p>
                      <p className="font-medium text-gray-900">
                        +{(parseFloat(depositForm.sttAmount) * (calculateAPY() / 100)).toFixed(6)} STT
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      USDC equivalent: ~{calculateProjectedEarnings(calculatedUsdcAmount, 1).toFixed(4)} (1M), 
                      ~{calculateProjectedEarnings(calculatedUsdcAmount, 6).toFixed(4)} (6M), 
                      ~{calculateProjectedEarnings(calculatedUsdcAmount, 12).toFixed(4)} (1Y)
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !depositForm.sttAmount || parseFloat(depositForm.sttAmount) <= 0 || parseFloat(depositForm.sttAmount) > parseFloat(sttBalanceFormatted)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isSubmitting ? 'Depositing STT...' : `Deposit ${depositForm.sttAmount || '0'} STT`}
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
                  Withdrawal Amount (STT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    max={savingsAccount ? formatUnits(savingsAccount.totalDeposited, 18) : undefined}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ amount: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="0.000000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">STT</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Available: {savingsAccount ? formatUnits(savingsAccount.totalDeposited, 18) : '0'} STT
                  </p>
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ 
                      amount: savingsAccount ? formatUnits(savingsAccount.totalDeposited, 18) : '0' 
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
                    {savingsAccount ? formatUnits(savingsAccount.totalDeposited, 18) : '0'} STT
                  </p>
                  <p className="text-sm text-gray-500">
                    ~{savingsAccount ? (parseFloat(formatUnits(savingsAccount.totalDeposited, 18)) * sttToUsdcRate).toFixed(4) : '0'} USDC
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{savingsAccount ? formatUnits(savingsAccount.rewardsEarned, 18) : '0'} STT
                  </p>
                  <p className="text-sm text-gray-500">
                    ~{savingsAccount ? (parseFloat(formatUnits(savingsAccount.rewardsEarned, 18)) * sttToUsdcRate).toFixed(4) : '0'} USDC
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
                    {totalDeposits && typeof totalDeposits === 'bigint' ? formatUnits(totalDeposits, 18) : '0'} STT
                  </p>
                  <p className="text-sm text-gray-500">
                    ~{totalDeposits && typeof totalDeposits === 'bigint' ? (parseFloat(formatUnits(totalDeposits, 18)) * sttToUsdcRate).toFixed(2) : '0'} USDC
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