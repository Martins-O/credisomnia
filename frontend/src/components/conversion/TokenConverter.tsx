'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDownIcon, ArrowsUpDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useTokenConversion } from '@/lib/hooks/useTokenConversion'
import { Token, formatTokenAmount } from '@/lib/tokens'

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token
  onSelect: (token: Token) => void
  label: string
  excludeToken?: Token
}

function TokenSelector({ tokens, selectedToken, onSelect, label, excludeToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const availableTokens = excludeToken 
    ? tokens.filter(token => token.symbol !== excludeToken.symbol)
    : tokens

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
            {selectedToken.symbol.charAt(0)}
          </div>
          <span className="font-medium">{selectedToken.symbol}</span>
          <span className="text-gray-500 text-sm">{selectedToken.name}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {availableTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => {
                onSelect(token)
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                {token.symbol.charAt(0)}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-gray-500">{token.name}</div>
              </div>
              {token.isStablecoin && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Stable
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TokenConverter() {
  const {
    conversionState,
    currentBalance,
    isLoading,
    getQuote,
    executeConversion,
    updateConversion,
    swapTokens,
    setMaxAmount,
    supportedTokens,
    stablecoins
  } = useTokenConversion()

  const [slippage, setSlippage] = useState(0.5)
  const [isExecuting, setIsExecuting] = useState(false)

  // Get quote when input changes
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (conversionState.inputAmount && parseFloat(conversionState.inputAmount) > 0) {
        try {
          const quote = await getQuote(
            conversionState.fromToken,
            conversionState.toToken,
            conversionState.inputAmount,
            slippage
          )
          updateConversion({ quote })
        } catch (error: any) {
          updateConversion({ error: error.message, quote: null })
        }
      } else {
        updateConversion({ quote: null, error: null })
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [conversionState.inputAmount, conversionState.fromToken, conversionState.toToken, slippage, getQuote, updateConversion])

  const handleExecuteConversion = useCallback(async () => {
    if (!conversionState.quote) return

    setIsExecuting(true)
    try {
      await executeConversion(conversionState.quote)
      // Reset form after successful conversion
      updateConversion({ inputAmount: '', quote: null })
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }, [conversionState.quote, executeConversion, updateConversion])

  const handleSwapTokens = useCallback(() => {
    swapTokens()
    updateConversion({ quote: null, error: null })
  }, [swapTokens, updateConversion])

  const isInsufficientBalance = parseFloat(conversionState.inputAmount || '0') > parseFloat(currentBalance || '0')
  const canExecute = conversionState.quote && !isInsufficientBalance && !isLoading && !isExecuting

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Token Conversion</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <InformationCircleIcon className="w-4 h-4" />
          <span>Convert STT to your preferred stablecoin</span>
        </div>
      </div>

      {/* Demo Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium">Demo Mode - Testnet Simulation</p>
            <p className="text-yellow-700 mt-1">
              This conversion is simulated for demo purposes. In production, this would interact with real DEX/AMM contracts.
              Balances will refresh automatically after conversion.
            </p>
          </div>
        </div>
      </div>

      {/* From Token */}
      <div className="space-y-4 mb-6">
        <TokenSelector
          tokens={supportedTokens}
          selectedToken={conversionState.fromToken}
          onSelect={(token) => updateConversion({ fromToken: token, quote: null })}
          label="From"
          excludeToken={conversionState.toToken}
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="text-xs text-gray-500">
              Balance: {parseFloat(currentBalance || '0').toFixed(4)} {conversionState.fromToken.symbol}
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              value={conversionState.inputAmount}
              onChange={(e) => updateConversion({ inputAmount: e.target.value })}
              placeholder="0.0"
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={setMaxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
            >
              MAX
            </button>
          </div>
          {isInsufficientBalance && (
            <p className="mt-1 text-sm text-red-600">Insufficient balance</p>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSwapTokens}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* To Token */}
      <div className="space-y-4 mb-6">
        <TokenSelector
          tokens={stablecoins}
          selectedToken={conversionState.toToken}
          onSelect={(token) => updateConversion({ toToken: token, quote: null })}
          label="To"
          excludeToken={conversionState.fromToken}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">You'll receive</label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="text-lg font-medium text-gray-900">
              {conversionState.quote 
                ? `${conversionState.quote.outputAmount} ${conversionState.toToken.symbol}`
                : `0.00 ${conversionState.toToken.symbol}`
              }
            </div>
            {conversionState.quote && (
              <div className="text-sm text-gray-500 mt-1">
                Rate: 1 {conversionState.fromToken.symbol} = {conversionState.quote.rate.toFixed(6)} {conversionState.toToken.symbol}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Details */}
      {conversionState.quote && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price Impact</span>
            <span className={`font-medium ${conversionState.quote.priceImpact > 1 ? 'text-red-600' : 'text-green-600'}`}>
              {conversionState.quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Slippage Tolerance</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{slippage}%</span>
              <select
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="text-xs border border-gray-300 rounded px-1 py-0.5"
              >
                <option value={0.1}>0.1%</option>
                <option value={0.5}>0.5%</option>
                <option value={1.0}>1.0%</option>
                <option value={2.0}>2.0%</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minimum Received</span>
            <span className="font-medium">
              {conversionState.quote.minimumReceived} {conversionState.toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gas Fee</span>
            <span className="font-medium">{conversionState.quote.gasFee} STT</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {conversionState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{conversionState.error}</p>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleExecuteConversion}
        disabled={!canExecute}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExecuting ? 'Converting...' : isLoading ? 'Getting Quote...' : 'Convert'}
      </button>

      {/* Conversion Info */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
        <p>Conversions are executed through automated market makers (AMM)</p>
        <p>Rates are updated in real-time and include slippage protection</p>
      </div>
    </div>
  )
}