'use client'

import { useMemo } from 'react'
import { MOCK_PRICES, TOKENS } from '@/lib/tokens'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface ConversionAnalyticsProps {
  className?: string
}

export default function ConversionAnalytics({ className = '' }: ConversionAnalyticsProps) {
  const marketData = useMemo(() => {
    return Object.entries(MOCK_PRICES).map(([symbol, data]) => ({
      ...data,
      token: TOKENS[symbol],
    })).filter(item => item.token)
  }, [])

  const sttPrice = MOCK_PRICES.STT.priceUSD
  const totalStablecoinValue = marketData
    .filter(item => item.token.isStablecoin)
    .reduce((sum, item) => sum + item.priceUSD, 0) / 4 // Average price

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
        <div className="text-xs text-gray-500">Updated every 30s</div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">STT Price</h4>
              <div className="text-2xl font-bold text-blue-800">
                ${sttPrice.toFixed(3)}
              </div>
            </div>
            <div className={`flex items-center ${MOCK_PRICES.STT.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {MOCK_PRICES.STT.change24h >= 0 ? (
                <ArrowTrendingUpIcon className="w-5 h-5 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-5 h-5 mr-1" />
              )}
              <span className="text-sm font-medium">
                {MOCK_PRICES.STT.change24h > 0 ? '+' : ''}{MOCK_PRICES.STT.change24h}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Avg Stablecoin</h4>
              <div className="text-2xl font-bold text-green-800">
                ${totalStablecoinValue.toFixed(3)}
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Prices */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Supported Tokens</h4>
        <div className="space-y-2">
          {marketData.map((item) => (
            <div key={item.token.symbol} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                  {item.token.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.token.symbol}</div>
                  <div className="text-xs text-gray-500">{item.token.name}</div>
                </div>
                {item.token.isStablecoin && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Stable
                  </span>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  ${item.priceUSD.toFixed(item.token.isStablecoin ? 3 : 4)}
                </div>
                <div className={`text-xs ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change24h > 0 ? '+' : ''}{item.change24h}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Conversion Benefits</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-green-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              <span>Price Stability</span>
            </div>
            <div className="flex items-center text-blue-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              <span>Consistent Yields</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-purple-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              <span>Lower Volatility</span>
            </div>
            <div className="flex items-center text-orange-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              <span>Better Planning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}