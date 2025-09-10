'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { SimpleConnectButton as ConnectButton } from '@/components/ui/SimpleConnectButton'
import { 
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation'
import { UnifiedFooter } from '@/components/navigation/UnifiedFooter'

const howItWorksSteps = [
  {
    step: 1,
    title: 'Connect Your Wallet',
    description: 'Start by connecting your Web3 wallet to the CrediSom platform on Somnia Testnet.',
    icon: '🔗'
  },
  {
    step: 2,
    title: 'Mint Your Credit NFT',
    description: 'Create your soulbound Credit NFT that will track and represent your on-chain credit history.',
    icon: '🖼️'
  },
  {
    step: 3,
    title: 'Start Building Credit',
    description: 'Deposit funds into the savings vault to earn rewards and begin establishing your credit profile.',
    icon: '💰'
  },
  {
    step: 4,
    title: 'Borrow Responsibly',
    description: 'Take loans based on your credit score, make timely repayments to improve your rating.',
    icon: '📈'
  },
  {
    step: 5,
    title: 'Grow Your Reputation',
    description: 'Watch your credit score and NFT evolve as you demonstrate financial responsibility.',
    icon: '🌟'
  }
]

export default function HowItWorksPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Navigation */}
      <UnifiedNavigation />

      {/* How It Works Content */}
      <div className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              How CrediSom Works
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Building your on-chain credit score is simple and rewarding. 
              Follow these steps to start your journey toward financial reputation.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12 sm:space-y-16">
            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}
              >
                <div className="flex-1 w-full">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                        {step.step}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-4xl sm:text-6xl">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Credit Score Factors */}
          <section className="mt-16 sm:mt-24">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Credit Score Factors
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm sm:text-base">40%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Payment History</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    On-time loan repayments and consistency
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm sm:text-base">25%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Savings Activity</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Regular deposits and account balance growth
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm sm:text-base">20%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Credit Utilization</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Responsible borrowing relative to available credit
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm sm:text-base">10%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Account Age</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Length of credit history and platform engagement
                  </p>
                </div>
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm sm:text-base">5%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Repayment Streak</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Consecutive on-time payments and consistency bonus
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 sm:mt-16 text-center">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Building?
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Connect your wallet and begin your journey toward better credit today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ConnectButton />
                {isConnected && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Go to Dashboard
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Unified Footer */}
      <UnifiedFooter />
    </div>
  )
}