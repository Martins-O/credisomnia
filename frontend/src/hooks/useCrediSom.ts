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

export function useCrediSom() {
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

  // Calculate real or demo metrics from contract data
  const realData = useMemo(() => {
    const loans = userLoans as Array<any> || [];
    const activeLoans = loans.filter((loan: any) => loan?.status === 0);
    const totalOutstanding = activeLoans.reduce((sum: bigint, loan: any) => sum + (loan?.outstandingAmount || 0n), 0n);
    
    // Check if we have real contract data
    const hasRealData = loans.length > 0 || (savingsBalance && savingsBalance > 0n) || (creditScore && creditScore > 0n);
    
    if (hasRealData) {
      // Use real contract data
      const totalCollateral = activeLoans.reduce((sum: bigint, loan: any) => sum + (loan?.collateralAmount || 0n), 0n);
      const healthFactor = totalOutstanding > 0n ? 
        (Number(totalCollateral) * 0.8 / Number(totalOutstanding)) : Infinity;
      
      const nextPayment = activeLoans.reduce((earliest: bigint, loan: any) => {
        if (!loan?.dueTimestamp) return earliest;
        return earliest === 0n || loan.dueTimestamp < earliest ? loan.dueTimestamp : earliest;
      }, 0n);

      const baseAPY = 5.0;
      const utilizationRate = totalSupplied && totalSupplied > 0n ? Number(totalBorrowed || 0n) / Number(totalSupplied) : 0;
      const dynamicAPY = baseAPY + (utilizationRate * 2);

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
    } else {
      // Return demo data for demonstration purposes
      return {
        totalLoans: 2,
        activeLiquidations: 0,
        totalSaved: '1,250.75',
        apy: '5.2%',
        healthFactor: '2.45',
        nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 days from now
      };
    }
  }, [userLoans, savingsBalance, formatBalance, totalSupplied, totalBorrowed, creditScore]);

  // Provide demo data when contracts aren't available
  const demoData = useMemo(() => {
    const hasRealData = (creditScore && creditScore > 0n) || (savingsBalance && savingsBalance > 0n);
    
    if (hasRealData) {
      return {
        creditScore,
        creditProfile,
        savingsBalance
      };
    } else {
      // Demo values for demonstration
      const demoCreditScore = BigInt(745);
      const demoSavingsBalance = BigInt('1250750000000000000000'); // 1,250.75 STT in wei
      const demoCreditProfile = {
        borrower: address || '0x0000000000000000000000000000000000000000',
        creditScore: demoCreditScore,
        totalBorrowed: BigInt('2500000000000000000000'), // 2,500 USDC
        totalRepayments: BigInt('800000000000000000000'), // 800 USDC
        repaymentStreak: BigInt(8),
        lastPaymentTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15), // 15 days ago
        defaultCount: BigInt(0),
        isActive: true
      };
      
      return {
        creditScore: demoCreditScore,
        creditProfile: demoCreditProfile as CreditProfile,
        savingsBalance: demoSavingsBalance
      };
    }
  }, [creditScore, creditProfile, savingsBalance, address]);

  return {
    // Contract data (with demo fallbacks)
    creditScore: demoData.creditScore,
    creditProfile: demoData.creditProfile,
    hasCreditNFT: hasCreditNFT || false,
    savingsBalance: demoData.savingsBalance,
    
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