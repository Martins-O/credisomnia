'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, parseUnits, formatUnits } from 'viem'
import { CONTRACTS } from '../contracts'
import { useCallback } from 'react'

// Error handling wrapper for contract calls
const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      console.error('Contract call failed:', error);
      const message = error?.message || error?.reason || 'Transaction failed';
      throw new Error(`Contract Error: ${message}`);
    }
  }) as T;
};

// Types for contract interactions
export interface CreditProfile {
  creditScore: bigint
  totalRepayments: bigint
  onTimeRepayments: bigint
  lateRepayments: bigint
  totalSavings: bigint
  totalStaked: bigint
  lastScoreUpdate: bigint
  repaymentStreak: bigint
  isInitialized: boolean
}

export interface LoanDetails {
  loanId: bigint
  borrower: Address
  principalAmount: bigint
  outstandingAmount: bigint
  collateralAmount: bigint
  interestRate: bigint
  startTimestamp: bigint
  dueTimestamp: bigint
  lastPaymentTime: bigint
  status: number // 0: Active, 1: Repaid, 2: Liquidated
}

export interface SavingsAccount {
  totalDeposited: bigint
  rewardsEarned: bigint
  lastDepositTime: bigint
  isActive: boolean
}

// Credit Oracle Hooks
export function useCreditOracle() {
  const { writeContractAsync } = useWriteContract()

  // Read hooks that can be used directly at component level
  const useCreditScore = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'getCreditScore',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useCreditProfile = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'getCreditProfile',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useLoanEligibility = (userAddress?: Address, loanAmount?: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'checkLoanEligibility',
      args: userAddress && loanAmount ? [userAddress, loanAmount] : undefined,
      query: { enabled: !!(userAddress && loanAmount) }
    })
  }

  const useCollateralRequirement = (userAddress?: Address, loanAmount?: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'calculateCollateralRequirement',
      args: userAddress && loanAmount ? [userAddress, loanAmount] : undefined,
      query: { enabled: !!(userAddress && loanAmount) }
    })
  }

  const recordRepayment = useCallback(withErrorHandling(async (userAddress: Address, amount: bigint, onTime: boolean) => {
    return writeContractAsync({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'recordRepayment',
      args: [userAddress, amount, onTime],
    })
  }), [writeContractAsync])

  const recordSavingsActivity = useCallback(withErrorHandling(async (userAddress: Address, amount: bigint, isDeposit: boolean) => {
    return writeContractAsync({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'recordSavingsActivity',
      args: [userAddress, amount, isDeposit],
    })
  }), [writeContractAsync])

  return {
    useCreditScore,
    useCreditProfile,
    useLoanEligibility,
    useCollateralRequirement,
    recordRepayment,
    recordSavingsActivity,
  }
}

// Lending Pool Hooks
export function useLendingPool() {
  const { writeContractAsync } = useWriteContract()

  const useLoan = (loanId?: bigint) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getLoan',
      args: loanId ? [loanId] : undefined,
      query: { enabled: !!loanId }
    })
  }

  const useUserLoans = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getUserLoans',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useActiveLoanIds = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getUserLoans',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useTotalSupplied = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getTotalValueLocked',
    })
  }

  const useTotalBorrowed = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'totalBorrowed',
    })
  }

  const useAvailableLiquidity = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getAvailableLiquidity',
    })
  }

  const requestLoan = useCallback(async (amount: bigint, collateralAmount: bigint, duration: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'requestLoan',
      args: [amount, collateralAmount, duration],
    })
  }, [writeContractAsync])

  const repay = useCallback(async (loanId: bigint, amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'repayLoan',
      args: [loanId, amount],
    })
  }, [writeContractAsync])

  const liquidate = useCallback(async (loanId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'liquidateLoan',
      args: [loanId],
    })
  }, [writeContractAsync])

  const addLiquidity = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'supplyLiquidity',
      args: [amount],
    })
  }, [writeContractAsync])

  const removeLiquidity = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'withdrawLiquidity',
      args: [amount],
    })
  }, [writeContractAsync])

  // Flash Loan functionality temporarily disabled for security

  return {
    useLoan,
    useUserLoans,
    useActiveLoanIds,
    useTotalSupplied,
    useTotalBorrowed,
    useAvailableLiquidity,
    requestLoan,
    repay,
    liquidate,
    addLiquidity,
    removeLiquidity,
  }
}

// Savings Vault Hooks
export function useSavingsVault() {
  const { writeContractAsync } = useWriteContract()

  const useAccountInfo = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'getSavingsAccount',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useTotalDeposits = () => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'getTotalValueLocked',
    })
  }

  const useCalculateRewards = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'calculateAccruedInterest',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const deposit = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'deposit',
      args: [amount],
    })
  }, [writeContractAsync])

  const withdraw = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'withdraw',
      args: [amount],
    })
  }, [writeContractAsync])

  // Note: This SavingsVault design auto-compounds rewards, no separate claim needed
  const claimRewards = useCallback(async () => {
    throw new Error('Rewards are automatically compounded. Use withdraw to access your balance.')
  }, [])

  return {
    useAccountInfo,
    useTotalDeposits,
    useCalculateRewards,
    deposit,
    withdraw,
    claimRewards,
  }
}

// Credit NFT Hooks
export function useCreditNFT() {
  const { writeContractAsync } = useWriteContract()

  const useBalanceOf = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: !!userAddress }
    })
  }

  const useOwnerOf = (tokenId?: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'ownerOf',
      args: tokenId ? [tokenId] : undefined,
      query: { enabled: !!tokenId }
    })
  }

  const useTokenURI = (tokenId?: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'tokenURI',
      args: tokenId ? [tokenId] : undefined,
      query: { enabled: !!tokenId }
    })
  }

  const mintCreditNFT = useCallback(withErrorHandling(async (to: Address, creditScore: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'mintCreditNFT',
      args: [to, creditScore],
    })
  }), [writeContractAsync])

  const updateCreditScore = useCallback(async (
    tokenId: bigint, 
    newScore: bigint, 
    totalRepayments: bigint = BigInt(0), 
    repaymentStreak: bigint = BigInt(0)
  ) => {
    return writeContractAsync({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'updateCreditScore',
      args: [tokenId, newScore, totalRepayments, repaymentStreak],
    })
  }, [writeContractAsync])

  return {
    useBalanceOf,
    useOwnerOf,
    useTokenURI,
    mintCreditNFT,
    updateCreditScore,
  }
}

// Transaction Management Hook
export function useTransactionStatus(hash?: `0x${string}`) {
  const { data: receipt, isLoading, isError, error } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    receipt,
    isConfirmed: !!receipt,
    isLoading,
    isError,
    error,
  }
}

// Utility Functions
export const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18): string => {
  if (!amount) return '0'
  return formatUnits(amount, decimals)
}

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return parseUnits(amount, decimals)
}

export const formatCreditScore = (score: bigint | undefined): string => {
  if (!score) return '0'
  return score.toString()
}

export const calculateHealthFactor = (collateral: bigint, debt: bigint, liquidationThreshold: number = 8000): number => {
  if (debt === 0n) return Infinity
  return Number(collateral * BigInt(liquidationThreshold)) / (Number(debt) * 10000)
}

export const isLoanHealthy = (healthFactor: number): boolean => {
  return healthFactor > 1.0
}

// Main useContracts hook that combines all contract hooks
export function useContracts() {
  const creditOracle = useCreditOracle()
  const lendingPool = useLendingPool()
  const savingsVault = useSavingsVault()
  const creditNFT = useCreditNFT()

  return {
    creditOracle,
    lendingPool,
    savingsVault,
    creditNFT,
    // For backward compatibility, expose some commonly used functions directly
    mintCreditNFT: creditNFT.mintCreditNFT,
  }
}