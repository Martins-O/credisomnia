'use client'

import { useAccount } from 'wagmi'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  const { address } = useAccount()

  // Mock analytics data - in a real app, this would come from your backend/subgraph
  const analyticsData = {
    creditScoreHistory: [
      { month: 'Jan', score: 580 },
      { month: 'Feb', score: 620 },
      { month: 'Mar', score: 650 },
      { month: 'Apr', score: 680 },
      { month: 'May', score: 720 },
      { month: 'Jun', score: 750 },
    ],
    loanHistory: [
      { date: '2024-01-15', amount: 1000, status: 'Repaid', onTime: true },
      { date: '2024-02-20', amount: 1500, status: 'Repaid', onTime: true },
      { date: '2024-03-10', amount: 2000, status: 'Active', onTime: true },
    ],
    savingsGrowth: [
      { month: 'Jan', balance: 500 },
      { month: 'Feb', balance: 750 },
      { month: 'Mar', balance: 1200 },
      { month: 'Apr', balance: 1800 },
      { month: 'May', balance: 2500 },
      { month: 'Jun', balance: 3200 },
    ]
  }

  const currentScore = 750
  const previousScore = 720
  const scoreChange = currentScore - previousScore
  const isScoreImproving = scoreChange > 0

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
              <p className="text-2xl font-bold text-gray-900 mt-2">{analyticsData.loanHistory.length}</p>
              <p className="text-sm text-green-600 mt-1">
                100% on-time repayment rate
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Savings Growth</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$3,200</p>
              <p className="text-sm text-blue-600 mt-1">
                +28% this month
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
            {analyticsData.creditScoreHistory.map((data, index) => (
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
            {analyticsData.savingsGrowth.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(data.balance / 3500) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16">${data.balance}</span>
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
              {analyticsData.loanHistory.map((loan, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(loan.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${loan.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'Repaid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
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
              ))}
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
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Savings Consistency (25%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-sm font-medium text-blue-600">Very Good</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Credit Utilization (20%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <span className="text-sm font-medium text-yellow-600">Good</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account Age (10%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <span className="text-sm font-medium text-purple-600">Fair</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Repayment Streak (5%)</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">Perfect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}