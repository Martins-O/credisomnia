// Auto-generated contract addresses and ABIs
// Generated on: 2025-09-05T17:17:34.194Z

import {
  CreditOracleABI,
  CreditNFTABI,
  SavingsVaultABI,
  LendingPoolABI
} from './abis';

export const NETWORK = {
  name: "Somnia Testnet",
  chainId: 50312,
  rpcUrl: "https://rpc-testnet.somnia.network",
  explorerUrl: "https://explorer-testnet.somnia.network",
} as const;

export const CONTRACTS = {
  CreditOracle: {
    address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const,
    abi: CreditOracleABI,
  },
  CreditNFT: {
    address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as const,
    abi: CreditNFTABI,
  },
  SavingsVault: {
    address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as const,
    abi: SavingsVaultABI,
  },
  LendingPool: {
    address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as const,
    abi: LendingPoolABI,
  },
  Tokens: {
    USDC: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const,
      symbol: "mUSDC",
      decimals: 18,
    },
    Collateral: {
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const,
      symbol: "mCOL",
      decimals: 18,
    },
  },
} as const;

// Contract Functions Export for Easy Access
export const CONTRACT_FUNCTIONS = {
  // Credit Oracle Functions
  CREDIT_ORACLE: {
    getCreditScore: 'getCreditScore',
    getCreditProfile: 'getCreditProfile',
    checkLoanEligibility: 'checkLoanEligibility',
    calculateCollateralRequirement: 'calculateCollateralRequirement',
    recordRepayment: 'recordRepayment',
    recordSavingsActivity: 'recordSavingsActivity',
    updateScoringWeights: 'updateScoringWeights',
  },

  // Lending Pool Functions
  LENDING_POOL: {
    borrow: 'borrow',
    repay: 'repay',
    liquidate: 'liquidate',
    getLoan: 'getLoan',
    getUserLoans: 'getUserLoans',
    getActiveLoanIds: 'getActiveLoanIds',
    addLiquidity: 'addLiquidity',
    removeLiquidity: 'removeLiquidity',
    getTotalSupplied: 'getTotalSupplied',
    getTotalBorrowed: 'getTotalBorrowed',
    getAvailableLiquidity: 'getAvailableLiquidity',
  },

  // Savings Vault Functions
  SAVINGS_VAULT: {
    deposit: 'deposit',
    withdraw: 'withdraw',
    getAccountInfo: 'getAccountInfo',
    getTotalDeposits: 'getTotalDeposits',
    calculateRewards: 'calculateRewards',
    claimRewards: 'claimRewards',
  },

  // Credit NFT Functions
  CREDIT_NFT: {
    mintCreditNFT: 'mintCreditNFT',
    updateCreditScore: 'updateCreditScore',
    tokenURI: 'tokenURI',
    balanceOf: 'balanceOf',
    ownerOf: 'ownerOf',
  },
} as const;

export const DEPLOYMENT_INFO = {
  "network": "Somnia Testnet",
  "chainId": 50312,
  "timestamp": "2025-09-05T17:17:34.194Z",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "CreditOracle": {
      "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "1000000000000000000000000"
      ]
    },
    "CreditNFT": {
      "address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "1000000000000000000000000",
        null
      ]
    },
    "SavingsVault": {
      "address": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "1000000000000000000000000",
        null,
        null,
        500
      ]
    },
    "LendingPool": {
      "address": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "1000000000000000000000000",
        null,
        null,
        null,
        800,
        8000
      ]
    }
  }
} as const;
