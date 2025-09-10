'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseUnits, formatUnits, Address } from 'viem'
import { useNotificationStore } from '@/lib/store/defi-store'
import { 
  TOKENS, 
  Token, 
  calculateConversionAmount, 
  validateConversion, 
  getPriceImpact,
  getStablecoins,
  getNativeToken 
} from '@/lib/tokens'

interface ConversionQuote {
  inputAmount: string
  outputAmount: string
  rate: number
  priceImpact: number
  slippage: number
  minimumReceived: string
  gasFee: string
  route: string[]
}

interface ConversionState {
  fromToken: Token
  toToken: Token
  inputAmount: string
  quote: ConversionQuote | null
  isLoading: boolean
  error: string | null
}

export function useTokenConversion() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { writeContractAsync } = useWriteContract()

  const [conversionState, setConversionState] = useState<ConversionState>({
    fromToken: getNativeToken(),
    toToken: getStablecoins()[0], // Default to USDC
    inputAmount: '',
    quote: null,
    isLoading: false,
    error: null,
  })

  // Get user's token balance
  const { data: tokenBalance } = useReadContract({
    address: conversionState.fromToken.address === '0x0000000000000000000000000000000000000000' 
      ? undefined 
      : conversionState.fromToken.address,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && conversionState.fromToken.address !== '0x0000000000000000000000000000000000000000' }
  })

  // Get native balance for STT using the same reliable method as SavingsVault
  const { data: nativeBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 50312, // Specify Somnia Testnet chain ID
    query: { 
      enabled: !!address && conversionState.fromToken.address === '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000, // Keep in sync with SavingsVault
      staleTime: 1000,
    }
  })

  // Calculate current balance
  const currentBalance = useMemo(() => {
    if (conversionState.fromToken.address === '0x0000000000000000000000000000000000000000') {
      return nativeBalance?.value ? formatUnits(nativeBalance.value, 18) : '0'
    }
    return tokenBalance ? formatUnits(tokenBalance as bigint, conversionState.fromToken.decimals) : '0'
  }, [tokenBalance, nativeBalance, conversionState.fromToken])

  // Get conversion quote
  const getQuote = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 0.5
  ): Promise<ConversionQuote | null> => {
    if (!amount || parseFloat(amount) <= 0) return null

    const validation = validateConversion(fromToken.symbol, toToken.symbol, parseFloat(amount))
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    setConversionState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const inputAmountNum = parseFloat(amount)
      const { outputAmount, rate, slippageAmount } = calculateConversionAmount(
        inputAmountNum,
        fromToken.symbol,
        toToken.symbol,
        slippage
      )

      const priceImpact = getPriceImpact(inputAmountNum, fromToken.symbol)
      const minimumReceived = outputAmount * (1 - slippage / 100)

      const quote: ConversionQuote = {
        inputAmount: amount,
        outputAmount: outputAmount.toFixed(toToken.decimals),
        rate,
        priceImpact,
        slippage,
        minimumReceived: minimumReceived.toFixed(toToken.decimals),
        gasFee: '0.001', // Mock gas fee
        route: [fromToken.symbol, toToken.symbol] // Direct route for simplicity
      }

      return quote
    } catch (error) {
      console.error('Error getting quote:', error)
      throw error
    } finally {
      setConversionState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Mock conversion transaction function
  const mockConversionTransaction = useCallback(async (
    method: string,
    params: any
  ): Promise<string> => {
    // In a real implementation, this would call the actual DEX/AMM contract
    // For now, we'll simulate a transaction hash
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
        resolve(mockHash as `0x${string}`)
      }, 1000)
    })
  }, [])

  // Execute conversion - Demo mode
  const executeConversion = useCallback(async (quote: ConversionQuote): Promise<string> => {
    if (!address) throw new Error('Wallet not connected')

    setConversionState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      addNotification({
        type: 'info',
        title: 'Token Conversion',
        description: `Converting ${quote.inputAmount} ${conversionState.fromToken.symbol} to ${quote.outputAmount} ${conversionState.toToken.symbol}...`,
      })

      // Simulate transaction time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`

      addNotification({
        type: 'success',
        title: 'Conversion Completed',
        description: `Successfully converted ${quote.inputAmount} ${conversionState.fromToken.symbol} to ${quote.outputAmount} ${conversionState.toToken.symbol}`,
      })

      // Dispatch balance refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshBalances'))
      }

      setConversionState(prev => ({ 
        ...prev, 
        isLoading: false,
        inputAmount: '',
        quote: null
      }))

      return mockTxHash

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Conversion failed'
      setConversionState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      addNotification({
        type: 'error',
        title: 'Conversion Failed',
        description: errorMessage,
      })
      throw error
    }
  }, [address, addNotification, conversionState.fromToken, conversionState.toToken])

  // Update conversion state
  const updateConversion = useCallback((updates: Partial<ConversionState>) => {
    setConversionState(prev => ({ ...prev, ...updates }))
  }, [])

  // Swap from and to tokens
  const swapTokens = useCallback(() => {
    setConversionState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      inputAmount: '',
      quote: null,
    }))
  }, [])

  // Set maximum amount (current balance)
  const setMaxAmount = useCallback(() => {
    const maxAmount = parseFloat(currentBalance) * 0.99 // Leave some for gas
    setConversionState(prev => ({
      ...prev,
      inputAmount: maxAmount.toFixed(prev.fromToken.decimals),
    }))
  }, [currentBalance])

  // Listen for balance refresh events
  useEffect(() => {
    const handleRefreshBalances = () => {
      console.log('TokenConversion: Received balance refresh event, refetching balance...')
      // Trigger refetch of balance hooks by updating the query
      if (typeof window !== 'undefined') {
        // Force a re-render to trigger balance refetch
        setConversionState(prev => ({ ...prev }))
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('refreshBalances', handleRefreshBalances)
      return () => window.removeEventListener('refreshBalances', handleRefreshBalances)
    }
  }, [])

  return {
    // State
    conversionState,
    currentBalance,
    isLoading: conversionState.isLoading,
    error: conversionState.error,

    // Actions
    getQuote,
    executeConversion,
    updateConversion,
    swapTokens,
    setMaxAmount,

    // Utilities
    supportedTokens: Object.values(TOKENS),
    stablecoins: getStablecoins(),
    nativeToken: getNativeToken(),
  }
}