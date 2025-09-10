'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { SimpleConnectButton as ConnectButton } from '@/components/ui/SimpleConnectButton'
import { 
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/ui/Logo'

interface NavigationItem {
  name: string
  href: string
  showWhenConnected?: boolean
}

const mainNavigation: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Documentation', href: '/docs' },
]

const connectedNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', showWhenConnected: true },
]

export function UnifiedNavigation() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const allNavigation = [
    ...mainNavigation,
    ...(isConnected ? connectedNavigation : [])
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity min-h-[44px] flex items-center touch-manipulation">
              <Logo variant="full" size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors min-h-[44px] flex items-center touch-manipulation ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {allNavigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`font-medium px-3 py-3 min-h-[44px] flex items-center transition-colors touch-manipulation ${
                    isActive(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 px-3">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}