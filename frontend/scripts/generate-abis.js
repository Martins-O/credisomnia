#!/usr/bin/env node
/**
 * Automated ABI Generator for Credisomnia DeFi Platform
 * Extracts ABIs from compiled contract artifacts and generates TypeScript files
 */

const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = '../contracts/artifacts/contracts';
const OUTPUT_DIR = './src/lib/abis';
const CONTRACTS_OUTPUT = './src/lib/contracts.ts';

// Contract names mapping
const CONTRACTS = {
  'CreditOracle': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  'CreditNFT': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', 
  'SavingsVault': '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  'LendingPool': '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
};

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function extractABI(contractName) {
  const artifactPath = path.join(CONTRACTS_DIR, contractName + '.sol', contractName + '.json');
  
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found: ${artifactPath}`);
    return null;
  }

  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    console.error(`Error reading artifact ${contractName}:`, error);
    return null;
  }
}

function generateABIFile(contractName, abi) {
  const content = `// Auto-generated ABI for ${contractName}
// Generated on: ${new Date().toISOString()}

export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)} as const;

export type ${contractName}ABI = typeof ${contractName}ABI;
`;

  const filePath = path.join(OUTPUT_DIR, `${contractName}.ts`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Generated ABI for ${contractName}`);
}

function generateIndexFile(contractNames) {
  const exports = contractNames
    .map(name => `export { ${name}ABI } from './${name}';`)
    .join('\n');

  const content = `// Auto-generated ABI exports
// Generated on: ${new Date().toISOString()}

${exports}

// ABI Types Export
${contractNames.map(name => `export type { ${name}ABI } from './${name}';`).join('\n')}
`;

  const filePath = path.join(OUTPUT_DIR, 'index.ts');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Generated ABI index file');
}

function generateContractsFile() {
  const content = `// Auto-generated contract addresses and ABIs
// Generated on: ${new Date().toISOString()}

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
    address: "${CONTRACTS.CreditOracle}" as const,
    abi: CreditOracleABI,
  },
  CreditNFT: {
    address: "${CONTRACTS.CreditNFT}" as const,
    abi: CreditNFTABI,
  },
  SavingsVault: {
    address: "${CONTRACTS.SavingsVault}" as const,
    abi: SavingsVaultABI,
  },
  LendingPool: {
    address: "${CONTRACTS.LendingPool}" as const,
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
  "timestamp": "${new Date().toISOString()}",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "CreditOracle": {
      "address": "${CONTRACTS.CreditOracle}",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "1000000000000000000000000"
      ]
    },
    "CreditNFT": {
      "address": "${CONTRACTS.CreditNFT}",
      "constructor": [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 
        "1000000000000000000000000",
        null
      ]
    },
    "SavingsVault": {
      "address": "${CONTRACTS.SavingsVault}",
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
      "address": "${CONTRACTS.LendingPool}",
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
`;

  fs.writeFileSync(CONTRACTS_OUTPUT, content, 'utf8');
  console.log('✅ Generated complete contracts.ts file');
}

function main() {
  console.log('🚀 Starting ABI generation process...\n');
  
  // Ensure output directory exists
  ensureDirectoryExists(OUTPUT_DIR);
  
  const generatedContracts = [];
  
  // Process each contract
  for (const contractName of Object.keys(CONTRACTS)) {
    console.log(`📄 Processing ${contractName}...`);
    
    const abi = extractABI(contractName);
    if (abi) {
      generateABIFile(contractName, abi);
      generatedContracts.push(contractName);
    } else {
      console.error(`❌ Failed to extract ABI for ${contractName}`);
    }
  }
  
  if (generatedContracts.length > 0) {
    generateIndexFile(generatedContracts);
    generateContractsFile();
    
    console.log(`\n✅ Successfully generated ABIs for ${generatedContracts.length} contracts:`);
    generatedContracts.forEach(name => console.log(`   - ${name}`));
    console.log('\n🎉 ABI generation complete!');
  } else {
    console.error('\n❌ No ABIs were generated successfully');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}