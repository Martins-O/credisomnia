'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAccount, useWatchContractEvent, useBlockNumber } from 'wagmi'
import { Address } from 'viem'
import { CONTRACTS } from '../contracts'
import { useDefiStore, useNotificationStore, useTransactionStore } from '../store/defi-store'
import { useCreditOracle, useLendingPool, useSavingsVault, useCreditNFT } from './useContracts'

export function useRealTimeUpdates() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { addTransaction, updateTransactionStatus } = useTransactionStore()
  const { 
    setUserLoans, 
    setCreditProfile, 
    setSavingsAccount,
    setTotalSupplied,
    setTotalBorrowed,
    setAvailableLiquidity,
    refreshAllData 
  } = useDefiStore()

  // Contract hooks for data fetching
  const creditOracle = useCreditOracle()
  const lendingPool = useLendingPool()
  const savingsVault = useSavingsVault()
  const creditNFT = useCreditNFT()

  // Track last update times to prevent excessive refreshes
  const lastUpdateRef = useRef({
    loans: 0,
    savings: 0,
    credit: 0,
    nft: 0,
  })

  // Get current block number for periodic updates
  const { data: blockNumber } = useBlockNumber({ watch: true })

  // Refresh data with debouncing
  const debouncedRefresh = useCallback((type: keyof typeof lastUpdateRef.current, delay = 2000) => {
    const now = Date.now()
    if (now - lastUpdateRef.current[type] < delay) return
    
    lastUpdateRef.current[type] = now
    
    setTimeout(() => {
      refreshAllData()
    }, 1000)
  }, [refreshAllData])

  // Watch for Loan events
  useWatchContractEvent({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    eventName: 'LoanCreated',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.borrower === address) {
          addNotification({
            type: 'success',
            title: 'Loan Created',
            description: `Your loan #${log.args.loanId?.toString()} has been created successfully`,
          })
          debouncedRefresh('loans')
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    eventName: 'LoanRepaid',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.borrower === address) {
          addNotification({
            type: 'success',
            title: 'Loan Repaid',
            description: `Loan #${log.args.loanId?.toString()} has been repaid`,
          })
          debouncedRefresh('loans')
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    eventName: 'LoanLiquidated',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.borrower === address) {
          addNotification({
            type: 'error',
            title: 'Loan Liquidated',
            description: `Your loan #${log.args.loanId?.toString()} has been liquidated`,
          })
          debouncedRefresh('loans')
        } else if (log.args.liquidator === address) {
          addNotification({
            type: 'success',
            title: 'Liquidation Successful',
            description: `You successfully liquidated loan #${log.args.loanId?.toString()}`,
          })
          debouncedRefresh('loans')
        }
      })
    },
  })

  // Watch for Savings events
  useWatchContractEvent({
    address: CONTRACTS.SavingsVault.address,
    abi: CONTRACTS.SavingsVault.abi,
    eventName: 'Deposit',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === address) {
          addNotification({
            type: 'success',
            title: 'Deposit Confirmed',
            description: `Your deposit has been confirmed on-chain`,
          })
          debouncedRefresh('savings')
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS.SavingsVault.address,
    abi: CONTRACTS.SavingsVault.abi,
    eventName: 'Withdrawal',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === address) {
          addNotification({
            type: 'info',
            title: 'Withdrawal Confirmed',
            description: `Your withdrawal has been processed`,
          })
          debouncedRefresh('savings')
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS.SavingsVault.address,
    abi: CONTRACTS.SavingsVault.abi,
    eventName: 'RewardsClaimed',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === address) {
          addNotification({
            type: 'success',
            title: 'Rewards Claimed',
            description: `Your rewards have been claimed successfully`,
          })
          debouncedRefresh('savings')
        }
      })
    },
  })

  // Watch for Credit Score events
  useWatchContractEvent({
    address: CONTRACTS.CreditOracle.address,
    abi: CONTRACTS.CreditOracle.abi,
    eventName: 'CreditScoreUpdated',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === address) {
          const oldScore = log.args.oldScore?.toString()
          const newScore = log.args.newScore?.toString()
          const isImprovement = Number(newScore) > Number(oldScore)
          
          addNotification({
            type: isImprovement ? 'success' : 'warning',
            title: 'Credit Score Updated',
            description: `Your credit score changed from ${oldScore} to ${newScore}`,
          })
          debouncedRefresh('credit')
        }
      })
    },
  })

  // Watch for NFT events
  useWatchContractEvent({
    address: CONTRACTS.CreditNFT.address,
    abi: CONTRACTS.CreditNFT.abi,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.to === address && log.args.from === '0x0000000000000000000000000000000000000000') {
          addNotification({
            type: 'success',
            title: 'NFT Minted',
            description: `Credit NFT #${log.args.tokenId?.toString()} has been minted to your wallet`,
          })
          debouncedRefresh('nft')
        }
      })
    },
  })

  // Periodic data refresh based on block number
  useEffect(() => {
    if (!blockNumber || !address) return
    
    // Refresh data every 10 blocks (approximately every 2 minutes on most chains)
    if (Number(blockNumber) % 10 === 0) {
      debouncedRefresh('loans', 5000)
    }
  }, [blockNumber, address, debouncedRefresh])

  // Health monitoring for loans
  const monitorLoanHealth = useCallback(async () => {
    if (!address) return

    try {
      // This would typically be done by fetching all user loans and checking health factors
      // For now, we'll simulate health monitoring
      const loans = await lendingPool.getUserLoans(address)
      
      if (loans.data && Array.isArray(loans.data)) {
        loans.data.forEach((loan: any) => {
          const healthFactor = Number(loan.collateralAmount) / Number(loan.outstandingAmount)
          
          if (healthFactor < 1.2 && healthFactor >= 1.0) {
            addNotification({
              type: 'warning',
              title: 'Loan Health Warning',
              description: `Loan #${loan.loanId?.toString()} is approaching liquidation threshold`,
            })
          } else if (healthFactor < 1.0) {
            addNotification({
              type: 'error',
              title: 'Loan Liquidation Risk',
              description: `Loan #${loan.loanId?.toString()} is at risk of liquidation!`,
            })
          }
        })
      }
    } catch (error) {
      console.error('Error monitoring loan health:', error)
    }
  }, [address, lendingPool, addNotification])

  // Monitor loan health every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      monitorLoanHealth()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [monitorLoanHealth])

  // Return utilities for manual refresh
  return {
    refreshLoans: () => debouncedRefresh('loans', 0),
    refreshSavings: () => debouncedRefresh('savings', 0),
    refreshCredit: () => debouncedRefresh('credit', 0),
    refreshNFT: () => debouncedRefresh('nft', 0),
    refreshAll: () => refreshAllData(),
  }
}

// Hook for managing WebSocket connections (for advanced real-time features)
export function useWebSocketUpdates() {
  const { addNotification } = useNotificationStore()
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback((address: Address) => {
    // In a real implementation, you'd connect to a WebSocket server
    // that provides real-time updates for DeFi events
    const wsUrl = `wss://api.credisomnia.com/ws/${address}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        addNotification({
          type: 'info',
          title: 'Real-time Updates Connected',
          description: 'You will receive live notifications for your activities',
        })
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'notification') {
            addNotification({
              type: data.level || 'info',
              title: data.title,
              description: data.message,
            })
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        addNotification({
          type: 'error',
          title: 'Connection Error',
          description: 'Lost connection to real-time updates',
        })
      }
      
      wsRef.current.onclose = () => {
        addNotification({
          type: 'warning',
          title: 'Connection Lost',
          description: 'Real-time updates disconnected',
        })
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [addNotification])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { connect, disconnect }
}

// Custom hook to combine all real-time features
export function useRealTimeSystem() {
  const { address } = useAccount()
  const updates = useRealTimeUpdates()
  const websocket = useWebSocketUpdates()

  useEffect(() => {
    if (address) {
      // Connect to WebSocket for advanced real-time features
      // websocket.connect(address) // Uncomment when WebSocket server is available
    } else {
      websocket.disconnect()
    }
  }, [address, websocket])

  return {
    ...updates,
    websocket,
  }
}