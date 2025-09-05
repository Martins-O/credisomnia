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
    functionName: 'getUserBalance',
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
  const mintCreditNFT = useCallback(async (initialScore?: number) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await mintNFT(initialScore || 600);
    } catch (error) {
      console.error('Error minting Credit NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, mintNFT]);

  // Mock data for development (will be replaced by real contract data)
  const mockData = useMemo(() => ({
    totalLoans: 3,
    activeLiquidations: 0,
    totalSaved: savingsBalance ? formatBalance(savingsBalance) : '1,250.00',
    apy: '5.2%',
    healthFactor: '2.4',
    nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }), [savingsBalance, formatBalance]);

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
    
    // Mock data for UI
    ...mockData
  };
}