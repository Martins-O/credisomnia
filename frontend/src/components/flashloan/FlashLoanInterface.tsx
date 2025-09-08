'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import { useLendingPool, formatTokenAmount, parseTokenAmount } from '@/lib/hooks/useContracts'
import { CONTRACTS } from '@/lib/contracts'

interface FlashLoanInterfaceProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function FlashLoanInterface({ onSuccess, onError }: FlashLoanInterfaceProps) {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [customParams, setCustomParams] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const {
    useAvailableLiquidity,
    useFlashLoanPremiumRate,
    useFlashLoanFee,
    useTotalFlashLoanFees,
    executeFlashLoan
  } = useLendingPool()

  // Contract reads
  const { data: availableLiquidity } = useAvailableLiquidity()
  const { data: premiumRate } = useFlashLoanPremiumRate()
  const { data: totalFeesCollected } = useTotalFlashLoanFees()
  
  const amountBigInt = useMemo(() => {
    try {
      return amount ? parseTokenAmount(amount, 18) : 0n
    } catch {
      return 0n
    }
  }, [amount])
  
  const { data: flashLoanFee } = useFlashLoanFee(amountBigInt > 0n ? amountBigInt : undefined)

  // Get user's token balance
  const { data: userBalance } = useBalance({
    address,
    token: CONTRACTS.LendingPool.address as Address, // Using lending pool address as proxy for loan token
  })

  // Validation
  const isValidAmount = useMemo(() => {
    if (!amount || !availableLiquidity) return false
    try {
      const requestedAmount = parseTokenAmount(amount, 18)
      return requestedAmount > 0n && requestedAmount <= availableLiquidity
    } catch {
      return false
    }
  }, [amount, availableLiquidity])

  const isValidReceiver = useMemo(() => {
    if (!receiverAddress) return false
    try {
      // Basic address validation
      return receiverAddress.startsWith('0x') && receiverAddress.length === 42
    } catch {
      return false
    }
  }, [receiverAddress])

  const canExecute = useMemo(() => {
    return isConnected && isValidAmount && isValidReceiver && !isExecuting
  }, [isConnected, isValidAmount, isValidReceiver, isExecuting])

  // Calculate totals
  const totalRepayment = useMemo(() => {
    if (!amountBigInt || !flashLoanFee || typeof flashLoanFee !== 'bigint') return 0n
    return amountBigInt + flashLoanFee
  }, [amountBigInt, flashLoanFee])

  const handleExecuteFlashLoan = useCallback(async () => {
    if (!canExecute || !amountBigInt) return

    setIsExecuting(true)
    try {
      const params = customParams ? `0x${Buffer.from(customParams, 'utf-8').toString('hex')}` : '0x'
      
      await executeFlashLoan(
        receiverAddress as Address,
        CONTRACTS.LendingPool.address as Address, // Asset address (loan token)
        amountBigInt,
        params as `0x${string}`
      )
      
      onSuccess?.()
      
      // Reset form
      setAmount('')
      setReceiverAddress('')
      setCustomParams('')
      
    } catch (error) {
      console.error('Flash loan execution failed:', error)
      onError?.(error as Error)
    } finally {
      setIsExecuting(false)
    }
  }, [canExecute, amountBigInt, receiverAddress, customParams, executeFlashLoan, onSuccess, onError])

  const handleMaxAmount = useCallback(() => {
    if (availableLiquidity && typeof availableLiquidity === 'bigint') {
      setAmount(formatTokenAmount(availableLiquidity, 18))
    }
  }, [availableLiquidity])

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Please connect your wallet to access flash loans</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Flash Loan</h3>
        <div className="text-sm text-gray-400">
          Fee: {premiumRate && typeof premiumRate === 'bigint' ? `${Number(premiumRate) / 100}%` : '0.09%'}
        </div>
      </div>

      {/* Flash Loan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Available Liquidity</div>
          <div className="text-lg font-medium text-white">
            {availableLiquidity && typeof availableLiquidity === 'bigint' ? formatTokenAmount(availableLiquidity, 18) : '0'} USDC
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Premium Rate</div>
          <div className="text-lg font-medium text-white">
            {premiumRate && typeof premiumRate === 'bigint' ? `${Number(premiumRate) / 100}%` : '0.09%'}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Fees Collected</div>
          <div className="text-lg font-medium text-white">
            {totalFeesCollected && typeof totalFeesCollected === 'bigint' ? formatTokenAmount(totalFeesCollected, 18) : '0'} USDC
          </div>
        </div>
      </div>

      {/* Flash Loan Form */}
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Flash Loan Amount
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleMaxAmount}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300"
            >
              MAX
            </button>
          </div>
          {!isValidAmount && amount && (
            <p className="text-red-400 text-sm mt-1">
              Amount must be greater than 0 and not exceed available liquidity
            </p>
          )}
        </div>

        {/* Receiver Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Receiver Contract Address
          </label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!isValidReceiver && receiverAddress && (
            <p className="text-red-400 text-sm mt-1">
              Please enter a valid contract address
            </p>
          )}
        </div>

        {/* Custom Parameters */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custom Parameters (Optional)
          </label>
          <textarea
            value={customParams}
            onChange={(e) => setCustomParams(e.target.value)}
            placeholder="Additional parameters for the flash loan receiver..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fee Calculation */}
        {amountBigInt > 0n && flashLoanFee && typeof flashLoanFee === 'bigint' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Flash Loan Amount:</span>
              <span className="text-white">{formatTokenAmount(amountBigInt, 18)} USDC</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Fee ({premiumRate && typeof premiumRate === 'bigint' ? `${Number(premiumRate) / 100}%` : '0.09%'}):</span>
              <span className="text-white">{formatTokenAmount(flashLoanFee, 18)} USDC</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-700 pt-2">
              <span className="text-gray-300 font-medium">Total Repayment:</span>
              <span className="text-white font-medium">{formatTokenAmount(totalRepayment, 18)} USDC</span>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={handleExecuteFlashLoan}
          disabled={!canExecute}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            canExecute
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isExecuting ? 'Executing Flash Loan...' : 'Execute Flash Loan'}
        </button>

        {/* Warning */}
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="text-yellow-400 font-medium mb-2">⚠️ Warning</div>
          <p className="text-yellow-300 text-sm">
            Flash loans must be repaid within the same transaction. Ensure your receiver contract 
            implements proper logic to repay the loan plus fees, or the transaction will revert.
          </p>
        </div>
      </div>
    </div>
  )
}