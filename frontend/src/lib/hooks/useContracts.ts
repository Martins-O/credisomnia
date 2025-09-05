'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, parseUnits, formatUnits } from 'viem'
import { CONTRACTS } from '../contracts'
import { useCallback } from 'react'

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

  const getCreditScore = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'getCreditScore',
      args: [userAddress],
    })
  }

  const getCreditProfile = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'getCreditProfile',
      args: [userAddress],
    })
  }

  const checkLoanEligibility = (userAddress: Address, loanAmount: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'checkLoanEligibility',
      args: [userAddress, loanAmount],
    })
  }

  const calculateCollateralRequirement = (userAddress: Address, loanAmount: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'calculateCollateralRequirement',
      args: [userAddress, loanAmount],
    })
  }

  const recordRepayment = useCallback(async (userAddress: Address, amount: bigint, onTime: boolean) => {
    return writeContractAsync({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'recordRepayment',
      args: [userAddress, amount, onTime],
    })
  }, [writeContractAsync])

  const recordSavingsActivity = useCallback(async (userAddress: Address, amount: bigint, isDeposit: boolean) => {
    return writeContractAsync({
      address: CONTRACTS.CreditOracle.address,
      abi: CONTRACTS.CreditOracle.abi,
      functionName: 'recordSavingsActivity',
      args: [userAddress, amount, isDeposit],
    })
  }, [writeContractAsync])

  return {
    getCreditScore,
    getCreditProfile,
    checkLoanEligibility,
    calculateCollateralRequirement,
    recordRepayment,
    recordSavingsActivity,
  }
}

// Lending Pool Hooks
export function useLendingPool() {
  const { writeContractAsync } = useWriteContract()

  const getLoan = (loanId: bigint) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getLoan',
      args: [loanId],
    })
  }

  const getUserLoans = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getUserLoans',
      args: [userAddress],
    })
  }

  const getActiveLoanIds = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getActiveLoanIds',
      args: [userAddress],
    })
  }

  const getTotalSupplied = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getTotalSupplied',
    })
  }

  const getTotalBorrowed = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getTotalBorrowed',
    })
  }

  const getAvailableLiquidity = () => {
    return useReadContract({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'getAvailableLiquidity',
    })
  }

  const borrow = useCallback(async (amount: bigint, collateralAmount: bigint, duration: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'borrow',
      args: [amount, collateralAmount, duration],
    })
  }, [writeContractAsync])

  const repay = useCallback(async (loanId: bigint, amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'repay',
      args: [loanId, amount],
    })
  }, [writeContractAsync])

  const liquidate = useCallback(async (loanId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'liquidate',
      args: [loanId],
    })
  }, [writeContractAsync])

  const addLiquidity = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'addLiquidity',
      args: [amount],
    })
  }, [writeContractAsync])

  const removeLiquidity = useCallback(async (amount: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: 'removeLiquidity',
      args: [amount],
    })
  }, [writeContractAsync])

  return {
    getLoan,
    getUserLoans,
    getActiveLoanIds,
    getTotalSupplied,
    getTotalBorrowed,
    getAvailableLiquidity,
    borrow,
    repay,
    liquidate,
    addLiquidity,
    removeLiquidity,
  }
}

// Savings Vault Hooks
export function useSavingsVault() {
  const { writeContractAsync } = useWriteContract()

  const getAccountInfo = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'getAccountInfo',
      args: [userAddress],
    })
  }

  const getTotalDeposits = () => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'getTotalDeposits',
    })
  }

  const calculateRewards = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'calculateRewards',
      args: [userAddress],
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

  const claimRewards = useCallback(async () => {
    return writeContractAsync({
      address: CONTRACTS.SavingsVault.address,
      abi: CONTRACTS.SavingsVault.abi,
      functionName: 'claimRewards',
    })
  }, [writeContractAsync])

  return {
    getAccountInfo,
    getTotalDeposits,
    calculateRewards,
    deposit,
    withdraw,
    claimRewards,
  }
}

// Credit NFT Hooks
export function useCreditNFT() {
  const { writeContractAsync } = useWriteContract()

  const balanceOf = (userAddress: Address) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'balanceOf',
      args: [userAddress],
    })
  }

  const ownerOf = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'ownerOf',
      args: [tokenId],
    })
  }

  const tokenURI = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'tokenURI',
      args: [tokenId],
    })
  }

  const mintCreditNFT = useCallback(async (to: Address, creditScore: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'mintCreditNFT',
      args: [to, creditScore],
    })
  }, [writeContractAsync])

  const updateCreditScore = useCallback(async (tokenId: bigint, newScore: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.CreditNFT.address,
      abi: CONTRACTS.CreditNFT.abi,
      functionName: 'updateCreditScore',
      args: [tokenId, newScore],
    })
  }, [writeContractAsync])

  return {
    balanceOf,
    ownerOf,
    tokenURI,
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