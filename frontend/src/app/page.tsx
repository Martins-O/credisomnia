'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
  PlayCircleIcon
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
    description: 'Start by connecting your Web3 wallet to the Credisomnia platform on Somnia Testnet.',
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
  const [activeSection, setActiveSection] = useState('home')

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

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveSection('home')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'home' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('about')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'about' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveSection('how-it-works')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'how-it-works' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                How It Works
              </button>
            </div>

            {/* Connect Button */}
            <div className="flex items-center space-x-4">
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
        </div>
      </nav>

      {/* Home Section */}
      {activeSection === 'home' && (
        <div className="space-y-16">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <div className="mb-8">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                    Revolutionary DeFi Credit Platform
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Build Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    On-Chain Credit
                  </span>
                  {' '}Score
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  The first DeFi platform to combine credit scoring, collateralized lending, 
                  and soulbound NFTs. Build reputation, access capital, and grow your wealth 
                  in the decentralized economy.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <ConnectButton />
                  <button
                    onClick={() => setActiveSection('how-it-works')}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <PlayCircleIcon className="h-5 w-5 mr-2" />
                    Learn How It Works
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {stat.change} this month
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need for DeFi Credit
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Comprehensive tools and features designed to help you build, 
                  manage, and leverage your on-chain financial reputation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.name}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build Your Credit Score?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users building their on-chain reputation and 
                accessing the future of decentralized finance.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* About Section */}
      {activeSection === 'about' && (
        <div className="min-h-screen py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About Credisomnia
              </h1>
              <p className="text-xl text-gray-600">
                Revolutionizing decentralized finance through innovative credit scoring 
                and reputation-based lending.
              </p>
            </div>

            <div className="space-y-16">
              {/* Mission */}
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Credisomnia is pioneering the next generation of DeFi by introducing 
                  comprehensive credit scoring to decentralized finance. We believe that 
                  financial reputation should be portable, verifiable, and reward responsible 
                  behavior. Our platform enables users to build on-chain credit scores through 
                  consistent savings and timely loan repayments, creating a more inclusive and 
                  efficient lending ecosystem.
                </p>
              </section>

              {/* Key Innovations */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Key Innovations
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                    <ChartBarIcon className="h-10 w-10 text-blue-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Dynamic Credit Scoring
                    </h3>
                    <p className="text-gray-600">
                      Our algorithmic credit scoring considers multiple factors including 
                      repayment history, savings consistency, account age, and on-time payment streaks 
                      to create a comprehensive financial profile.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                    <PhotoIcon className="h-10 w-10 text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Soulbound Credit NFTs
                    </h3>
                    <p className="text-gray-600">
                      Non-transferable NFTs that evolve with your credit score, creating 
                      portable reputation tokens that can be used across the DeFi ecosystem 
                      as proof of creditworthiness.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                    <ShieldCheckIcon className="h-10 w-10 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Advanced Risk Management
                    </h3>
                    <p className="text-gray-600">
                      Sophisticated liquidation monitoring, circuit breakers, and volume 
                      limits ensure platform stability while protecting user positions 
                      from unexpected market volatility.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
                    <CurrencyDollarIcon className="h-10 w-10 text-orange-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Yield-Generating Savings
                    </h3>
                    <p className="text-gray-600">
                      Earn competitive APY on deposits while building credit history. 
                      Your savings contribute to the lending pool and generate returns 
                      while improving your credit profile.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technology */}
              <section className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Built on Cutting-Edge Technology
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⛓️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Somnia Network</h3>
                    <p className="text-sm text-gray-600">
                      Deployed on Somnia Testnet for fast, low-cost transactions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Contracts</h3>
                    <p className="text-sm text-gray-600">
                      Audited contracts with advanced security features and circuit breakers
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Oracle Integration</h3>
                    <p className="text-sm text-gray-600">
                      Real-time credit scoring with transparent, verifiable algorithms
                    </p>
                  </div>
                </div>
              </section>

              {/* Values */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Our Values
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <CheckCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
                    <p className="text-gray-600">
                      All credit scoring algorithms and smart contracts are open source and verifiable
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircleIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Inclusivity</h3>
                    <p className="text-gray-600">
                      Everyone deserves access to credit and the opportunity to build financial reputation
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                    <p className="text-gray-600">
                      Continuously pushing the boundaries of what's possible in decentralized finance
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      {activeSection === 'how-it-works' && (
        <div className="min-h-screen py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How Credisomnia Works
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Building your on-chain credit score is simple and rewarding. 
                Follow these steps to start your journey toward financial reputation.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-16">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
                >
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {step.step}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-6xl">
                      {step.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Credit Score Factors */}
            <section className="mt-24">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Credit Score Factors
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">40%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Payment History</h4>
                    <p className="text-sm text-gray-600">
                      On-time loan repayments and consistency
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">25%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Savings Activity</h4>
                    <p className="text-sm text-gray-600">
                      Regular deposits and account balance growth
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">20%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Credit Utilization</h4>
                    <p className="text-sm text-gray-600">
                      Responsible borrowing relative to available credit
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">10%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Account Age</h4>
                    <p className="text-sm text-gray-600">
                      Length of credit history and platform engagement
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">5%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Repayment Streak</h4>
                    <p className="text-sm text-gray-600">
                      Consecutive on-time payments and consistency bonus
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="mt-16 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Building?
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet and begin your journey toward better credit today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ConnectButton />
                  {isConnected && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Logo variant="full" size="md" theme="dark" />
              <p className="text-gray-400 mt-4 max-w-md">
                Building the future of decentralized credit scoring and 
                reputation-based lending on the blockchain.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setActiveSection('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setActiveSection('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => setActiveSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                {isConnected && (
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Network</h3>
              <ul className="space-y-2 text-gray-400">
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
            <p>&copy; 2024 Credisomnia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}