import { Address } from 'viem'

export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
  icon?: string
  isStablecoin: boolean
  chainId: number
}

// Somnia Testnet Token Addresses (these would be real addresses on mainnet)
export const TOKENS: Record<string, Token> = {
  STT: {
    address: '0x0000000000000000000000000000000000000000', // Native token
    symbol: 'STT',
    name: 'Somnia Testnet Token',
    decimals: 18,
    icon: '/tokens/stt.svg',
    isStablecoin: false,
    chainId: 50312,
  },
  USDC: {
    address: '0xA0b86a33E6441dd3C3bb0f6B2bE3c5f14A4a5c9B', // Mock USDC address
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '/tokens/usdc.svg',
    isStablecoin: true,
    chainId: 50312,
  },
  USDT: {
    address: '0xB1c85a44E7A6c4Ea4f5f2F9c7D8E3F1A2B4c5D6E', // Mock USDT address
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: '/tokens/usdt.svg',
    isStablecoin: true,
    chainId: 50312,
  },
  DAI: {
    address: '0xC2d96b55E9F12A2c8F3D4E5F6a7B8C9D0E1F2A3B', // Mock DAI address
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: '/tokens/dai.svg',
    isStablecoin: true,
    chainId: 50312,
  },
  FRAX: {
    address: '0xD3e07c56F9B3A2c8F4D5E6F7a8B9C0D1E2F3A4B5', // Mock FRAX address
    symbol: 'FRAX',
    name: 'Frax',
    decimals: 18,
    icon: '/tokens/frax.svg',
    isStablecoin: true,
    chainId: 50312,
  }
}

// Get all stablecoins
export const getStablecoins = (): Token[] => {
  return Object.values(TOKENS).filter(token => token.isStablecoin)
}

// Get token by symbol
export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return TOKENS[symbol]
}

// Get native token
export const getNativeToken = (): Token => {
  return TOKENS.STT
}

// Mock price feeds (in a real app, these would come from oracles like Chainlink)
export interface PriceData {
  token: string
  priceUSD: number
  lastUpdated: number
  change24h: number
}

export const MOCK_PRICES: Record<string, PriceData> = {
  STT: {
    token: 'STT',
    priceUSD: 0.85, // Mock price for STT
    lastUpdated: Date.now(),
    change24h: 2.5,
  },
  USDC: {
    token: 'USDC',
    priceUSD: 1.0,
    lastUpdated: Date.now(),
    change24h: 0.01,
  },
  USDT: {
    token: 'USDT',
    priceUSD: 0.999,
    lastUpdated: Date.now(),
    change24h: -0.02,
  },
  DAI: {
    token: 'DAI',
    priceUSD: 1.001,
    lastUpdated: Date.now(),
    change24h: 0.05,
  },
  FRAX: {
    token: 'FRAX',
    priceUSD: 0.998,
    lastUpdated: Date.now(),
    change24h: -0.01,
  }
}

// Calculate conversion rate between two tokens
export const calculateConversionRate = (fromToken: string, toToken: string): number => {
  const fromPrice = MOCK_PRICES[fromToken]?.priceUSD || 0
  const toPrice = MOCK_PRICES[toToken]?.priceUSD || 1
  
  if (toPrice === 0) return 0
  return fromPrice / toPrice
}

// Calculate conversion amount
export const calculateConversionAmount = (
  amount: number,
  fromToken: string,
  toToken: string,
  slippage: number = 0.5 // 0.5% default slippage
): { outputAmount: number; rate: number; slippageAmount: number } => {
  const rate = calculateConversionRate(fromToken, toToken)
  const grossOutput = amount * rate
  const slippageAmount = grossOutput * (slippage / 100)
  const outputAmount = grossOutput - slippageAmount
  
  return {
    outputAmount,
    rate,
    slippageAmount
  }
}

// Get price impact for large trades (mock implementation)
export const getPriceImpact = (amount: number, token: string): number => {
  // Mock price impact calculation - larger trades have higher impact
  if (amount < 1000) return 0.1
  if (amount < 10000) return 0.3
  if (amount < 100000) return 0.8
  return 1.5 // 1.5% for very large trades
}

// Format token amount with proper decimals
export const formatTokenAmount = (amount: number, token: Token): string => {
  const decimals = token.isStablecoin ? 2 : 4
  return amount.toFixed(decimals)
}

// Validate if conversion is possible
export const validateConversion = (
  fromToken: string,
  toToken: string,
  amount: number
): { isValid: boolean; error?: string } => {
  if (fromToken === toToken) {
    return { isValid: false, error: 'Cannot convert to the same token' }
  }
  
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' }
  }
  
  if (!TOKENS[fromToken] || !TOKENS[toToken]) {
    return { isValid: false, error: 'Unsupported token pair' }
  }
  
  return { isValid: true }
}