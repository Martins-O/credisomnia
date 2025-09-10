import { Address } from 'viem'

// Somnia Testnet DEX Configuration
export const DEX_CONFIG = {
  // Router contract address - replace with actual Somnia DEX router
  ROUTER_ADDRESS: '0x1234567890123456789012345678901234567890' as Address,
  
  // Factory contract address - replace with actual Somnia DEX factory
  FACTORY_ADDRESS: '0x0987654321098765432109876543210987654321' as Address,
  
  // WETH (Wrapped STT) contract address on Somnia
  WETH_ADDRESS: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address,
  
  // Default slippage tolerance (1%)
  DEFAULT_SLIPPAGE: 0.01,
  
  // Default deadline (20 minutes)
  DEFAULT_DEADLINE: 1200,
  
  // Gas estimates for different operations
  GAS_ESTIMATES: {
    SWAP_ETH_FOR_TOKENS: 150000n,
    SWAP_TOKENS_FOR_ETH: 150000n,
    SWAP_TOKENS_FOR_TOKENS: 180000n,
    ADD_LIQUIDITY: 200000n,
    REMOVE_LIQUIDITY: 150000n,
  }
}

// Uniswap V2-compatible Router ABI (most DEXs use this interface)
export const ROUTER_ABI = [
  {
    name: 'swapExactETHForTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactTokensForETH',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'getAmountsOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'WETH',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
] as const

// ERC20 Token ABI for approvals
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const