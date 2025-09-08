import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useCallback, useMemo } from 'react';
import { CONTRACTS } from '@/lib/contracts';
import { useContracts } from '@/lib/hooks/useContracts';

export interface CreditProfile {
  borrower: string;
  creditScore: bigint;
  totalBorrowed: bigint;
  totalRepayments: bigint;
  repaymentStreak: bigint;
  lastPaymentTime: bigint;
  defaultCount: bigint;
  isActive: boolean;
}

export function useCredisomnia() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { mintCreditNFT: mintNFT } = useContracts();

  // Read credit score
  const { data: creditScore } = useReadContract({
    address: CONTRACTS.CreditOracle.address,
    abi: CONTRACTS.CreditOracle.abi,
    functionName: 'getCreditScore',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read credit profile
  const { data: creditProfile } = useReadContract({
    address: CONTRACTS.CreditOracle.address,
    abi: CONTRACTS.CreditOracle.abi,
    functionName: 'getCreditProfile',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  }) as { data: CreditProfile | undefined };

  // Check if user has credit NFT
  const { data: hasCreditNFT } = useReadContract({
    address: CONTRACTS.CreditNFT.address,
    abi: CONTRACTS.CreditNFT.abi,
    functionName: 'hasCreditNFT',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read savings balance
  const { data: savingsBalance } = useReadContract({
    address: CONTRACTS.SavingsVault.address,
    abi: CONTRACTS.SavingsVault.abi,
    functionName: 'getBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get credit tier based on score
  const getCreditTier = useCallback((score: bigint) => {
    const scoreNum = Number(score);
    if (scoreNum >= 800) return 'Excellent';
    if (scoreNum >= 700) return 'Good'; 
    if (scoreNum >= 600) return 'Fair';
    if (scoreNum >= 500) return 'Poor';
    return 'No Credit';
  }, []);

  // Format balance for display
  const formatBalance = useCallback((balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return parseFloat(formatEther(balance)).toFixed(2);
  }, []);

  // Mint credit NFT wrapper
  const mintCreditNFT = useCallback(async (initialScore?: bigint | number) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const scoreAsBigInt = typeof initialScore === 'bigint' ? initialScore : BigInt(initialScore || 600);
      await mintNFT(address, scoreAsBigInt);
    } catch (error) {
      console.error('Error minting Credit NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, mintNFT]);

  // Get real contract data from lending pool
  const { data: userLoans } = useReadContract({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: totalSupplied } = useReadContract({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    functionName: 'getTotalValueLocked',
  });

  const { data: totalBorrowed } = useReadContract({
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
    functionName: 'totalBorrowed',
  });

  // Calculate real metrics from contract data
  const realData = useMemo(() => {
    const loans = userLoans as Array<any> || [];
    const activeLoans = loans.filter((loan: any) => loan?.status === 0);
    const totalOutstanding = activeLoans.reduce((sum: bigint, loan: any) => sum + (loan?.outstandingAmount || 0n), 0n);
    
    // Calculate health factor
    const totalCollateral = activeLoans.reduce((sum: bigint, loan: any) => sum + (loan?.collateralAmount || 0n), 0n);
    const healthFactor = totalOutstanding > 0n ? 
      (Number(totalCollateral) * 0.8 / Number(totalOutstanding)) : Infinity;
    
    // Find next payment due
    const nextPayment = activeLoans.reduce((earliest: bigint, loan: any) => {
      if (!loan?.dueTimestamp) return earliest;
      return earliest === 0n || loan.dueTimestamp < earliest ? loan.dueTimestamp : earliest;
    }, 0n);

    // Calculate APY (5% base rate)
    const baseAPY = 5.0;
    const utilizationRate = totalSupplied && totalSupplied > 0n ? Number(totalBorrowed || 0n) / Number(totalSupplied) : 0;
    const dynamicAPY = baseAPY + (utilizationRate * 2); // Add utilization bonus

    return {
      totalLoans: activeLoans.length,
      activeLiquidations: activeLoans.filter((loan: any) => healthFactor < 1.1).length,
      totalSaved: savingsBalance && typeof savingsBalance === 'bigint' ? formatBalance(savingsBalance) : '0.00',
      apy: `${dynamicAPY.toFixed(1)}%`,
      healthFactor: healthFactor === Infinity ? '∞' : healthFactor.toFixed(2),
      nextPaymentDue: nextPayment > 0n ? 
        new Date(Number(nextPayment) * 1000).toLocaleDateString() : 
        'No active loans'
    };
  }, [userLoans, savingsBalance, formatBalance, totalSupplied, totalBorrowed]);

  return {
    // Contract data
    creditScore,
    creditProfile,
    hasCreditNFT: hasCreditNFT || false,
    savingsBalance,
    
    // Computed values
    getCreditTier,
    formatBalance,
    
    // Actions
    mintCreditNFT,
    
    // States
    isLoading,
    isConnected,
    address,
    
    // Real contract data
    ...realData
  };
}