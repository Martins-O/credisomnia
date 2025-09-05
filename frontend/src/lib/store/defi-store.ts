'use client'

import { create } from 'zustand'
import { Address } from 'viem'
import { LoanDetails, CreditProfile, SavingsAccount } from '../hooks/useContracts'

export interface DefiState {
  // User Data
  userAddress: Address | null
  creditProfile: CreditProfile | null
  creditScore: number
  savingsAccount: SavingsAccount | null
  userLoans: LoanDetails[]
  activeLoanIds: bigint[]
  nftBalance: number

  // Protocol Data
  totalSupplied: bigint
  totalBorrowed: bigint
  availableLiquidity: bigint
  totalDeposits: bigint
  liquidationTargets: LoanDetails[]

  // Transaction States
  isLoading: boolean
  pendingTxHash: string | null
  lastError: string | null

  // UI State
  selectedLoanId: bigint | null
  showLiquidationModal: boolean
  refreshTimestamp: number

  // Actions
  setUserAddress: (address: Address | null) => void
  setCreditProfile: (profile: CreditProfile | null) => void
  setCreditScore: (score: number) => void
  setSavingsAccount: (account: SavingsAccount | null) => void
  setUserLoans: (loans: LoanDetails[]) => void
  setActiveLoanIds: (ids: bigint[]) => void
  setNftBalance: (balance: number) => void

  setTotalSupplied: (amount: bigint) => void
  setTotalBorrowed: (amount: bigint) => void
  setAvailableLiquidity: (amount: bigint) => void
  setTotalDeposits: (amount: bigint) => void
  setLiquidationTargets: (loans: LoanDetails[]) => void

  setLoading: (loading: boolean) => void
  setPendingTxHash: (hash: string | null) => void
  setLastError: (error: string | null) => void

  setSelectedLoanId: (id: bigint | null) => void
  setShowLiquidationModal: (show: boolean) => void
  
  // Computed Actions
  refreshAllData: () => Promise<void>
  getLoanById: (loanId: bigint) => LoanDetails | undefined
  getUserHealthFactor: () => number
  getTotalBorrowCapacity: () => bigint
  getUtilizationRate: () => number
}

export const useDefiStore = create<DefiState>((set, get) => ({
  // Initial State
  userAddress: null,
  creditProfile: null,
  creditScore: 0,
  savingsAccount: null,
  userLoans: [],
  activeLoanIds: [],
  nftBalance: 0,

  totalSupplied: 0n,
  totalBorrowed: 0n,
  availableLiquidity: 0n,
  totalDeposits: 0n,
  liquidationTargets: [],

  isLoading: false,
  pendingTxHash: null,
  lastError: null,

  selectedLoanId: null,
  showLiquidationModal: false,
  refreshTimestamp: Date.now(),

  // Basic Setters
  setUserAddress: (address) => set({ userAddress: address }),
  setCreditProfile: (profile) => set({ 
    creditProfile: profile,
    creditScore: profile ? Number(profile.creditScore) : 0
  }),
  setCreditScore: (score) => set({ creditScore: score }),
  setSavingsAccount: (account) => set({ savingsAccount: account }),
  setUserLoans: (loans) => set({ userLoans: loans }),
  setActiveLoanIds: (ids) => set({ activeLoanIds: ids }),
  setNftBalance: (balance) => set({ nftBalance: balance }),

  setTotalSupplied: (amount) => set({ totalSupplied: amount }),
  setTotalBorrowed: (amount) => set({ totalBorrowed: amount }),
  setAvailableLiquidity: (amount) => set({ availableLiquidity: amount }),
  setTotalDeposits: (amount) => set({ totalDeposits: amount }),
  setLiquidationTargets: (loans) => set({ liquidationTargets: loans }),

  setLoading: (loading) => set({ isLoading: loading }),
  setPendingTxHash: (hash) => set({ pendingTxHash: hash }),
  setLastError: (error) => set({ lastError: error }),

  setSelectedLoanId: (id) => set({ selectedLoanId: id }),
  setShowLiquidationModal: (show) => set({ showLiquidationModal: show }),

  // Computed Actions
  refreshAllData: async () => {
    set({ 
      isLoading: true, 
      lastError: null,
      refreshTimestamp: Date.now()
    })
    
    try {
      // This will be called by components to trigger data refresh
      // Actual data fetching happens in the components using the hooks
      set({ isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        lastError: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  },

  getLoanById: (loanId) => {
    const { userLoans } = get()
    return userLoans.find(loan => loan.loanId === loanId)
  },

  getUserHealthFactor: () => {
    const { userLoans, creditProfile } = get()
    
    if (!userLoans.length || !creditProfile) return Infinity
    
    const totalCollateral = userLoans.reduce((sum, loan) => sum + loan.collateralAmount, 0n)
    const totalDebt = userLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0n)
    
    if (totalDebt === 0n) return Infinity
    
    // Liquidation threshold is typically 80% (8000 basis points)
    const liquidationThreshold = 8000
    return Number(totalCollateral * BigInt(liquidationThreshold)) / (Number(totalDebt) * 10000)
  },

  getTotalBorrowCapacity: () => {
    const { creditScore, userLoans } = get()
    
    const baseCapacity = BigInt(creditScore) * BigInt(1000) // 1000 tokens per credit score point
    const usedCapacity = userLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0n)
    
    return baseCapacity > usedCapacity ? baseCapacity - usedCapacity : 0n
  },

  getUtilizationRate: () => {
    const { totalSupplied, totalBorrowed } = get()
    
    if (totalSupplied === 0n) return 0
    
    return Number(totalBorrowed) / Number(totalSupplied) * 100
  },
}))

// Selectors for better performance
export const selectUserData = (state: DefiState) => ({
  userAddress: state.userAddress,
  creditProfile: state.creditProfile,
  creditScore: state.creditScore,
  savingsAccount: state.savingsAccount,
  userLoans: state.userLoans,
  activeLoanIds: state.activeLoanIds,
  nftBalance: state.nftBalance,
})

export const selectProtocolData = (state: DefiState) => ({
  totalSupplied: state.totalSupplied,
  totalBorrowed: state.totalBorrowed,
  availableLiquidity: state.availableLiquidity,
  totalDeposits: state.totalDeposits,
  liquidationTargets: state.liquidationTargets,
  utilizationRate: state.getUtilizationRate(),
})

export const selectTransactionState = (state: DefiState) => ({
  isLoading: state.isLoading,
  pendingTxHash: state.pendingTxHash,
  lastError: state.lastError,
})

export const selectUIState = (state: DefiState) => ({
  selectedLoanId: state.selectedLoanId,
  showLiquidationModal: state.showLiquidationModal,
  refreshTimestamp: state.refreshTimestamp,
})

// Notification Store for Toast Messages
interface NotificationState {
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    description?: string
    timestamp: number
  }>
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp: Date.now() }
      ]
    }))
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }, 5000)
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearAll: () => set({ notifications: [] }),
}))

// Transaction Store for Managing Transaction Flow
interface TransactionState {
  transactions: Array<{
    hash: string
    type: 'borrow' | 'repay' | 'liquidate' | 'deposit' | 'withdraw' | 'supply' | 'mint_nft'
    status: 'pending' | 'confirmed' | 'failed'
    timestamp: number
    amount?: bigint
    token?: string
  }>
  addTransaction: (tx: Omit<TransactionState['transactions'][0], 'timestamp'>) => void
  updateTransactionStatus: (hash: string, status: 'confirmed' | 'failed') => void
  getRecentTransactions: () => TransactionState['transactions']
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  
  addTransaction: (tx) => set((state) => ({
    transactions: [
      { ...tx, timestamp: Date.now() },
      ...state.transactions
    ].slice(0, 50) // Keep only last 50 transactions
  })),
  
  updateTransactionStatus: (hash, status) => set((state) => ({
    transactions: state.transactions.map(tx =>
      tx.hash === hash ? { ...tx, status } : tx
    )
  })),
  
  getRecentTransactions: () => {
    return get().transactions.slice(0, 10)
  },
}))

// Hook for easy data synchronization
export function useDataSync() {
  const store = useDefiStore()
  
  return {
    syncUserData: async (userAddress: Address) => {
      // This will be implemented by components that use contract hooks
      store.setUserAddress(userAddress)
    },
    
    syncProtocolData: async () => {
      // This will be implemented by components that use contract hooks
    },
    
    handleTransactionUpdate: (hash: string, type: string, status: 'pending' | 'confirmed' | 'failed') => {
      const txStore = useTransactionStore.getState()
      
      if (status === 'pending') {
        txStore.addTransaction({
          hash,
          type: type as any,
          status: 'pending',
        })
      } else {
        txStore.updateTransactionStatus(hash, status)
        
        // Refresh data after confirmed transaction
        if (status === 'confirmed') {
          setTimeout(() => store.refreshAllData(), 2000)
        }
      }
    }
  }
}