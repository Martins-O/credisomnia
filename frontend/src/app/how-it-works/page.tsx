'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { SimpleConnectButton as ConnectButton } from '@/components/ui/SimpleConnectButton'
import { 
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/ui/Logo'
import { useState } from 'react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Logo variant="full" size="md" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-blue-600">
                How It Works
              </Link>
              <Link href="/docs" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Documentation
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Connect Button - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <ConnectButton />
              {isConnected && (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/how-it-works" 
                  className="text-base font-medium text-blue-600 px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link 
                  href="/docs" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <ConnectButton />
                  {isConnected && (
                    <Link
                      href="/dashboard"
                      className="mt-2 block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Logo variant="full" size="md" theme="dark" />
              <p className="text-gray-400 mt-4 max-w-md text-sm sm:text-base">
                Building the future of decentralized credit scoring and 
                reputation-based lending on the blockchain.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                {isConnected && (
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Network</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Somnia Testnet</li>
                <li>Chain ID: 50312</li>
                <li>
                  <a 
                    href="https://explorer-testnet.somnia.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Block Explorer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p className="text-sm">&copy; 2024 CrediSom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}