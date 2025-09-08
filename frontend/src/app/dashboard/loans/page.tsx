'use client';

import { useSearchParams } from 'next/navigation';
import LoanManagement from '@/components/loan/LoanManagement';

export default function LoansPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'borrow' | 'repay' | 'manage' || 'borrow';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
        <p className="text-gray-500 mt-1">
          Borrow, repay, and manage your loans based on your credit score
        </p>
      </div>
      
      <LoanManagement defaultTab={defaultTab} />
    </div>
  )
}