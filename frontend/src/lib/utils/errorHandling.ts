import { BaseError, ContractFunctionRevertedError } from 'viem'

export interface FormattedError {
  title: string
  message: string
  code?: string
  type: 'user' | 'network' | 'contract' | 'unknown'
}

// Contract-specific error messages
const CONTRACT_ERRORS = {
  // Credit Oracle errors
  'CreditOracle: Caller not authorized': {
    title: 'Authorization Error',
    message: 'You are not authorized to perform this action',
    type: 'user' as const,
  },
  'CreditOracle: Invalid user address': {
    title: 'Invalid Address',
    message: 'The provided address is invalid',
    type: 'user' as const,
  },
  'CreditOracle: Amount must be positive': {
    title: 'Invalid Amount',
    message: 'Please enter a positive amount',
    type: 'user' as const,
  },
  
  // Lending Pool errors
  'LendingPool: Insufficient collateral': {
    title: 'Insufficient Collateral',
    message: 'You need to provide more collateral for this loan amount',
    type: 'user' as const,
  },
  'LendingPool: Loan not found': {
    title: 'Loan Not Found',
    message: 'The specified loan does not exist',
    type: 'user' as const,
  },
  'LendingPool: Loan not active': {
    title: 'Inactive Loan',
    message: 'This loan is no longer active',
    type: 'user' as const,
  },
  'LendingPool: Insufficient liquidity': {
    title: 'Insufficient Liquidity',
    message: 'Not enough funds available in the pool for this loan',
    type: 'contract' as const,
  },
  'LendingPool: Credit score too low': {
    title: 'Credit Score Too Low',
    message: 'Your credit score is too low for this loan amount',
    type: 'user' as const,
  },
  'LendingPool: Loan not liquidatable': {
    title: 'Cannot Liquidate',
    message: 'This loan is not eligible for liquidation',
    type: 'user' as const,
  },
  
  // Savings Vault errors
  'SavingsVault: Insufficient balance': {
    title: 'Insufficient Balance',
    message: 'You do not have enough balance for this withdrawal',
    type: 'user' as const,
  },
  'SavingsVault: Minimum deposit not met': {
    title: 'Minimum Deposit Required',
    message: 'Deposit amount is below the minimum required',
    type: 'user' as const,
  },
  'SavingsVault: No rewards to claim': {
    title: 'No Rewards Available',
    message: 'You do not have any rewards to claim at this time',
    type: 'user' as const,
  },
  
  // Credit NFT errors
  'CreditNFT: Token does not exist': {
    title: 'NFT Not Found',
    message: 'The requested NFT does not exist',
    type: 'user' as const,
  },
  'CreditNFT: Not token owner': {
    title: 'Not NFT Owner',
    message: 'You do not own this NFT',
    type: 'user' as const,
  },
  'CreditNFT: Already minted': {
    title: 'NFT Already Exists',
    message: 'You have already minted a Credit NFT',
    type: 'user' as const,
  },

  // Common ERC20 errors
  'ERC20: insufficient allowance': {
    title: 'Insufficient Allowance',
    message: 'Please approve the contract to spend your tokens first',
    type: 'user' as const,
  },
  'ERC20: transfer amount exceeds balance': {
    title: 'Insufficient Balance',
    message: 'You do not have enough tokens for this transaction',
    type: 'user' as const,
  },
  'ERC20: transfer to the zero address': {
    title: 'Invalid Recipient',
    message: 'Cannot transfer to an invalid address',
    type: 'user' as const,
  },
}

// Network-specific error messages
const NETWORK_ERRORS = {
  'User rejected the request': {
    title: 'Transaction Rejected',
    message: 'You cancelled the transaction in your wallet',
    type: 'user' as const,
  },
  'insufficient funds': {
    title: 'Insufficient Funds',
    message: 'You do not have enough ETH to pay for gas fees',
    type: 'user' as const,
  },
  'nonce too low': {
    title: 'Nonce Error',
    message: 'Transaction nonce is too low. Please try again.',
    type: 'network' as const,
  },
  'network changed': {
    title: 'Network Changed',
    message: 'Please switch back to the Somnia Testnet',
    type: 'network' as const,
  },
  'execution reverted': {
    title: 'Transaction Failed',
    message: 'The transaction was reverted by the contract',
    type: 'contract' as const,
  },
  'gas estimation failed': {
    title: 'Gas Estimation Failed',
    message: 'Unable to estimate gas for this transaction',
    type: 'network' as const,
  },
}

/**
 * Format blockchain/contract errors into user-friendly messages
 */
export function formatError(error: unknown): FormattedError {
  // Handle viem BaseError
  if (error instanceof BaseError) {
    // Handle contract function reverted errors
    if (error instanceof ContractFunctionRevertedError) {
      const revertReason = error.data?.errorName || error.reason || 'Unknown error'
      
      // Check for contract-specific errors
      for (const [pattern, errorInfo] of Object.entries(CONTRACT_ERRORS)) {
        if (revertReason.includes(pattern) || error.message.includes(pattern)) {
          return {
            ...errorInfo,
            code: error.name,
          }
        }
      }
      
      return {
        title: 'Transaction Failed',
        message: `Contract error: ${revertReason}`,
        type: 'contract',
        code: error.name,
      }
    }
    
    // Check for network errors in the base error
    for (const [pattern, errorInfo] of Object.entries(NETWORK_ERRORS)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return {
          ...errorInfo,
          code: error.name,
        }
      }
    }
    
    // Handle specific viem error types
    if (error.name === 'UserRejectedRequestError') {
      return {
        title: 'Transaction Rejected',
        message: 'You cancelled the transaction in your wallet',
        type: 'user',
        code: error.name,
      }
    }
    
    if (error.name === 'InsufficientFundsError') {
      return {
        title: 'Insufficient Funds',
        message: 'You do not have enough ETH to pay for gas fees',
        type: 'user',
        code: error.name,
      }
    }
    
    if (error.name === 'ChainMismatchError') {
      return {
        title: 'Wrong Network',
        message: 'Please switch to the Somnia Testnet in your wallet',
        type: 'network',
        code: error.name,
      }
    }
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    // Check for contract-specific errors in the message
    for (const [pattern, errorInfo] of Object.entries(CONTRACT_ERRORS)) {
      if (error.message.includes(pattern)) {
        return {
          ...errorInfo,
          code: error.name,
        }
      }
    }
    
    // Check for network errors in the message
    for (const [pattern, errorInfo] of Object.entries(NETWORK_ERRORS)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return {
          ...errorInfo,
          code: error.name,
        }
      }
    }
    
    return {
      title: 'Unexpected Error',
      message: error.message || 'An unknown error occurred',
      type: 'unknown',
      code: error.name,
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    for (const [pattern, errorInfo] of Object.entries(CONTRACT_ERRORS)) {
      if (error.includes(pattern)) {
        return errorInfo
      }
    }
    
    for (const [pattern, errorInfo] of Object.entries(NETWORK_ERRORS)) {
      if (error.toLowerCase().includes(pattern.toLowerCase())) {
        return errorInfo
      }
    }
    
    return {
      title: 'Error',
      message: error,
      type: 'unknown',
    }
  }
  
  // Handle unknown error types
  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown',
  }
}

/**
 * Get user-friendly suggestions based on error type
 */
export function getErrorSuggestions(error: FormattedError): string[] {
  const suggestions: string[] = []
  
  switch (error.type) {
    case 'user':
      if (error.message.includes('allowance')) {
        suggestions.push('Try approving the token spend first')
        suggestions.push('Check that you have enough token balance')
      } else if (error.message.includes('balance')) {
        suggestions.push('Check your wallet balance')
        suggestions.push('Make sure you have enough tokens')
      } else if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        suggestions.push('Try the transaction again')
        suggestions.push('Make sure you approve the transaction in your wallet')
      } else if (error.message.includes('collateral')) {
        suggestions.push('Add more collateral to your loan')
        suggestions.push('Reduce the loan amount')
      } else if (error.message.includes('credit score')) {
        suggestions.push('Improve your credit score by making timely repayments')
        suggestions.push('Try depositing into the savings vault to boost your score')
      }
      break
      
    case 'network':
      suggestions.push('Check your internet connection')
      suggestions.push('Try switching to a different RPC endpoint')
      suggestions.push('Wait a few minutes and try again')
      if (error.message.includes('network') || error.message.includes('chain')) {
        suggestions.push('Switch to the Somnia Testnet in your wallet')
        suggestions.push('Check that your wallet is connected to the correct network')
      }
      break
      
    case 'contract':
      suggestions.push('The smart contract prevented this transaction')
      suggestions.push('Check the contract conditions and try again')
      if (error.message.includes('liquidity')) {
        suggestions.push('Try a smaller amount')
        suggestions.push('Wait for more liquidity to be added to the pool')
      }
      break
      
    case 'unknown':
      suggestions.push('Try refreshing the page')
      suggestions.push('Check your wallet connection')
      suggestions.push('Contact support if the problem persists')
      break
  }
  
  return suggestions
}

/**
 * Log errors for debugging and monitoring
 */
export function logError(error: unknown, context?: string) {
  const formattedError = formatError(error)
  
  console.group(`🚨 Error${context ? ` in ${context}` : ''}`)
  console.error('Original error:', error)
  console.log('Formatted error:', formattedError)
  console.log('Suggestions:', getErrorSuggestions(formattedError))
  console.groupEnd()
  
  // In production, you would send this to an error tracking service
  // like Sentry, LogRocket, or your own analytics
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { contexts: { formatted: formattedError } })
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Don't retry user errors
      const formattedError = formatError(error)
      if (formattedError.type === 'user') {
        throw error
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Validate transaction parameters before sending
 */
export function validateTransactionParams(params: {
  amount?: string
  address?: string
  gasLimit?: bigint
}) {
  const errors: string[] = []
  
  if (params.amount) {
    const amount = parseFloat(params.amount)
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number')
    }
  }
  
  if (params.address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(params.address)) {
      errors.push('Invalid Ethereum address format')
    }
  }
  
  if (params.gasLimit) {
    if (params.gasLimit <= 0n) {
      errors.push('Gas limit must be positive')
    }
  }
  
  return errors
}

/**
 * Check if error is recoverable (user can try again)
 */
export function isRecoverableError(error: FormattedError): boolean {
  const nonRecoverablePatterns = [
    'not authorized',
    'not owner',
    'already exists',
    'does not exist',
    'invalid address',
  ]
  
  return !nonRecoverablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  )
}

/**
 * Get appropriate error color for UI
 */
export function getErrorColor(error: FormattedError): string {
  switch (error.type) {
    case 'user': return 'text-yellow-600'
    case 'network': return 'text-blue-600'
    case 'contract': return 'text-red-600'
    case 'unknown': return 'text-gray-600'
  }
}