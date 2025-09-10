'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { SimpleConnectButton as ConnectButton } from '@/components/ui/SimpleConnectButton'
import { 
  ChevronRightIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ChartBarIcon,
  PhotoIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/ui/Logo'

const features = [
  {
    name: 'DeFi Credit Scoring',
    description: 'Build and track your on-chain credit score through responsible borrowing and saving behavior.',
    icon: ChartBarIcon,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Collateralized Lending',
    description: 'Borrow funds at competitive rates based on your credit score with flexible collateral options.',
    icon: CreditCardIcon,
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Savings Rewards',
    description: 'Earn attractive APY on deposits while building your credit history and improving your score.',
    icon: CurrencyDollarIcon,
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Soulbound Credit NFTs',
    description: 'Get dynamic NFTs that evolve with your credit score, serving as portable reputation tokens.',
    icon: PhotoIcon,
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Liquidation Protection',
    description: 'Advanced monitoring and early warning systems help protect your positions from liquidation.',
    icon: ShieldCheckIcon,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    name: 'Community Governance',
    description: 'Participate in protocol governance and help shape the future of decentralized credit.',
    icon: UserGroupIcon,
    color: 'from-pink-500 to-rose-500'
  }
]

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

const stats = [
  { label: 'Total Value Locked', value: '$2.4M', change: '+12%' },
  { label: 'Active Borrowers', value: '1,250', change: '+28%' },
  { label: 'Average Credit Score', value: '724', change: '+5%' },
  { label: 'Successful Repayments', value: '98.7%', change: '+2%' }
]

export default function HomePage() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect to dashboard when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo variant="full" size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-blue-600">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
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

            {/* Desktop Connect Button */}
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
                  className="text-base font-medium text-blue-600 px-3 py-2"
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
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
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

      {/* Main Content */}
      <div className="space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center">
              <div className="mb-6 sm:mb-8">
                <span className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Revolutionary DeFi Credit Platform
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Build Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  On-Chain Credit
                </span>
                {' '}Score
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                The first DeFi platform to combine credit scoring, collateralized lending, 
                and soulbound NFTs. Build reputation, access capital, and grow your wealth 
                in the decentralized economy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <ConnectButton />
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  <PlayCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Learn How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium">
                    {stat.change} this month
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for DeFi Credit
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Comprehensive tools and features designed to help you build, 
                manage, and leverage your on-chain financial reputation.
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${feature.color} p-2 sm:p-3 mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your Credit Score?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of users building their on-chain reputation and 
              accessing the future of decentralized finance.
            </p>
            <div className="flex justify-center px-4">
              <ConnectButton />
            </div>
          </div>
        </section>
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
