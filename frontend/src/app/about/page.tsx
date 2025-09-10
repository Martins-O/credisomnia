'use client'

import { 
  ChartBarIcon,
  PhotoIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation'
import { UnifiedFooter } from '@/components/navigation/UnifiedFooter'

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Navigation */}
      <UnifiedNavigation />

      {/* About Content */}
      <div className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              About CrediSom
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing decentralized finance through innovative credit scoring 
              and reputation-based lending.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {/* Mission */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                CrediSom is pioneering the next generation of DeFi by introducing 
                comprehensive credit scoring to decentralized finance. We believe that 
                financial reputation should be portable, verifiable, and reward responsible 
                behavior. Our platform enables users to build on-chain credit scores through 
                consistent savings and timely loan repayments, creating a more inclusive and 
                efficient lending ecosystem.
              </p>
            </section>

            {/* Key Innovations */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Key Innovations
              </h2>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                  <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Dynamic Credit Scoring
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Our algorithmic credit scoring considers multiple factors including 
                    repayment history, savings consistency, account age, and on-time payment streaks 
                    to create a comprehensive financial profile.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-purple-100">
                  <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Soulbound Credit NFTs
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Non-transferable NFTs that evolve with your credit score, creating 
                    portable reputation tokens that can be used across the DeFi ecosystem 
                    as proof of creditworthiness.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-green-100">
                  <ShieldCheckIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Advanced Risk Management
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Sophisticated liquidation monitoring, circuit breakers, and volume 
                    limits ensure platform stability while protecting user positions 
                    from unexpected market volatility.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 border border-orange-100">
                  <CurrencyDollarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Yield-Generating Savings
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Earn competitive APY on deposits while building credit history. 
                    Your savings contribute to the lending pool and generate returns 
                    while improving your credit profile.
                  </p>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Built on Cutting-Edge Technology
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl">⛓️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Somnia Network</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Deployed on Somnia Testnet for fast, low-cost transactions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Smart Contracts</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Audited contracts with advanced security features and circuit breakers
                  </p>
                </div>
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Oracle Integration</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Real-time credit scoring with transparent, verifiable algorithms
                  </p>
                </div>
              </div>
            </section>

            {/* Values */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Our Values
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    All credit scoring algorithms and smart contracts are open source and verifiable
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Inclusivity</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Everyone deserves access to credit and the opportunity to build financial reputation
                  </p>
                </div>
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Continuously pushing the boundaries of what's possible in decentralized finance
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Unified Footer */}
      <UnifiedFooter />
    </div>
  )
}