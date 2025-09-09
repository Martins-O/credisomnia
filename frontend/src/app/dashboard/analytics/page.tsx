'use client'

import { useAccount } from 'wagmi'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useCredisomnia } from '@/hooks/useCredisomnia'
import { useLendingPool, formatTokenAmount } from '@/lib/hooks/useContracts'
import { useDefiStore } from '@/lib/store/defi-store'

export default function AnalyticsPage() {
  const { address } = useAccount()
  const { creditScore, creditProfile, savingsBalance, formatBalance } = useCredisomnia()
  const { userLoans } = useDefiStore()

  // Check if wallet is connected
  if (!address) {
    return (
      <div className="min-h-96 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Connect your wallet to view your analytics dashboard
          </p>
        </div>
      </div>
    )
  }
  
  // Generate historical data based on current credit profile
  const generateHistoricalData = () => {
    const currentScore = creditScore ? Number(creditScore) : 600
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const scoreHistory = months.map((month, index) => ({
      month,
      score: Math.max(300, currentScore - (months.length - index - 1) * 15)
    }))

    const savingsBalance_num = savingsBalance ? Number(formatBalance(savingsBalance as bigint)) : 0
    const savingsHistory = months.map((month, index) => ({
      month,
      balance: Math.max(0, savingsBalance_num - (months.length - index - 1) * (savingsBalance_num / 6))
    }))

    return { scoreHistory, savingsHistory }
  }

  const { scoreHistory, savingsHistory } = generateHistoricalData()
  const currentScore = creditScore ? Number(creditScore) : 600
  const previousScore = scoreHistory[scoreHistory.length - 2]?.score || currentScore - 30
  const scoreChange = currentScore - previousScore
  const isScoreImproving = scoreChange > 0

  // Process loan data safely
  const loanHistory = userLoans ? userLoans.map((loan) => {
    try {
      return {
        date: new Date(Number(loan.startTimestamp || 0n) * 1000).toISOString().split('T')[0],
        amount: Number(formatTokenAmount(loan.principalAmount || 0n)),
        status: loan.status === 0 ? 'Active' : loan.status === 1 ? 'Repaid' : 'Liquidated',
        onTime: loan.status !== 2 // Not liquidated means on time
      }
    } catch (error) {
      console.warn('Error processing loan data:', error)
      return {
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        status: 'Unknown',
        onTime: true
      }
    }
  }).filter(loan => loan.amount > 0) : []

  const onTimeRate = loanHistory.length > 0 ? 
    (loanHistory.filter(loan => loan.onTime).length / loanHistory.length * 100) : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track your DeFi credit journey and financial performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Credit Score Change</p>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-gray-900">{currentScore}</span>
                <div className={`ml-3 flex items-center ${isScoreImproving ? 'text-green-600' : 'text-red-600'}`}>
                  {isScoreImproving ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {isScoreImproving ? '+' : ''}{scoreChange} pts
                  </span>
                </div>
              </div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{loanHistory.length}</p>
              <p className="text-sm text-green-600 mt-1">
                {onTimeRate.toFixed(0)}% on-time repayment rate
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Savings Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {savingsBalance ? formatBalance(savingsBalance as bigint) : '0.00'} STT
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Current balance
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Score History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score History</h3>
          <div className="space-y-4">
            {scoreHistory.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(data.score / 850) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{data.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Growth</h3>
          <div className="space-y-4">
            {savingsHistory.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${savingsHistory.length > 0 ? (data.balance / Math.max(...savingsHistory.map(s => s.balance))) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16">{data.balance.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Loan History</h3>
          <p className="text-sm text-gray-500 mt-1">Your borrowing activity and repayment performance</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loanHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No loan history available. Get your first loan to start building credit!
                  </td>
                </tr>
              ) : (
                loanHistory.map((loan, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(loan.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.amount.toLocaleString()} USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        loan.status === 'Repaid' 
                          ? 'bg-green-100 text-green-800' 
                          : loan.status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        loan.onTime 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {loan.onTime ? 'On Time' : 'Late'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Factors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score Factors</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment History (40%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${onTimeRate}%` }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">
                {onTimeRate >= 90 ? 'Excellent' : onTimeRate >= 75 ? 'Good' : onTimeRate >= 50 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Savings Consistency (25%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ 
                  width: `${savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 0 ? 85 : 20}%` 
                }}></div>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 1000 ? 'Excellent' : 
                 savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 500 ? 'Good' : 
                 savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 0 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Credit Utilization (20%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ 
                  width: `${100 - Math.min(80, (loanHistory.filter(l => l.status === 'Active').length / Math.max(1, loanHistory.length)) * 100)}%` 
                }}></div>
              </div>
              <span className="text-sm font-medium text-yellow-600">
                {loanHistory.filter(l => l.status === 'Active').length === 0 ? 'Excellent' : 'Good'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account Activity (10%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ 
                  width: `${Math.min(100, (loanHistory.length + (savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 0 ? 1 : 0)) * 20)}%` 
                }}></div>
              </div>
              <span className="text-sm font-medium text-purple-600">
                {loanHistory.length > 2 || (savingsBalance && Number(formatBalance(savingsBalance as bigint)) > 500) ? 'Good' : 'Fair'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Repayment Streak (5%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ 
                  width: `${creditProfile ? Math.min(100, Number(creditProfile.repaymentStreak) * 10) : 0}%` 
                }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">
                {creditProfile && Number(creditProfile.repaymentStreak) >= 5 ? 'Perfect' : 
                 creditProfile && Number(creditProfile.repaymentStreak) >= 3 ? 'Good' : 'Building'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}