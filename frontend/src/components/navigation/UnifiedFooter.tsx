'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Logo } from '@/components/ui/Logo'

const platformLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Documentation', href: '/docs' },
]

const networkInfo = [
  { label: 'Somnia Testnet' },
  { label: 'Chain ID: 50312' },
]

export function UnifiedFooter() {
  const { isConnected } = useAccount()

  return (
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
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors min-h-[32px] flex items-center touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {isConnected && (
                <li>
                  <Link 
                    href="/dashboard" 
                    className="hover:text-white transition-colors min-h-[32px] flex items-center touch-manipulation"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Network</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {networkInfo.map((info, index) => (
                <li key={index}>{info.label}</li>
              ))}
              <li>
                <a 
                  href="https://explorer-testnet.somnia.network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors min-h-[32px] flex items-center touch-manipulation"
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
  )
}