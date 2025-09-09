'use client';

import { useSearchParams } from 'next/navigation';
import SavingsVault from '@/components/savings/SavingsVault';

export default function SavingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'deposit' | 'withdraw' | 'convert' | 'overview' || 'deposit';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Savings Vault</h1>
        <p className="text-gray-500 mt-1">
          Deposit funds, convert tokens, and earn competitive APY while building your credit score
        </p>
      </div>
      
      <SavingsVault defaultTab={defaultTab} />
    </div>
  )
}