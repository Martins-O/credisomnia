const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Credisomnia deployment to Somnia Testnet...\n");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deployment configuration
  const config = {
    // Security configuration
    admin: deployer.address,
    emergencyAddress: deployer.address, // In production, use a different address
    securityAddress: deployer.address,  // In production, use a different address
    maxDailyVolume: ethers.parseEther("1000000"), // 1M USDC equivalent

    // Token addresses (for testnet, we'll deploy mock tokens)
    // In production, these would be real token addresses
    depositTokenName: "Mock USDC",
    depositTokenSymbol: "mUSDC",
    depositTokenSupply: ethers.parseEther("100000000"), // 100M tokens

    // Interest and fee parameters
    savingsInterestRate: 500,        // 5% annual interest
    baseLendingRate: 800,           // 8% base lending rate
    liquidationThreshold: 8000,     // 80% liquidation threshold
    liquidationBonus: 500,          // 5% liquidation bonus
    maxLoanDuration: 365 * 24 * 60 * 60, // 1 year in seconds
    minDeposit: ethers.parseEther("10"),        // 10 USDC minimum deposit
    maxDeposit: ethers.parseEther("100000"),    // 100k USDC maximum deposit

    // Credit scoring parameters
    repaymentWeight: 4000,          // 40%
    savingsWeight: 2000,            // 20%
    stakingWeight: 1500,            // 15%
    streakWeight: 1500,             // 15%
    consistencyWeight: 1000,        // 10%
  };

  console.log("📋 Deployment Configuration:");
  console.log("- Admin Address:", config.admin);
  console.log("- Emergency Address:", config.emergencyAddress);
  console.log("- Security Address:", config.securityAddress);
  console.log("- Max Daily Volume:", ethers.formatEther(config.maxDailyVolume), "tokens");
  console.log("- Savings Interest Rate:", config.savingsInterestRate / 100, "%");
  console.log("- Base Lending Rate:", config.baseLendingRate / 100, "%\n");

  // Deploy Mock ERC20 tokens for testing
  console.log("📦 Deploying Mock Tokens...");

  const MockERC20 = await ethers.getContractFactory("MockERC20");

  // Deploy deposit/loan token (USDC equivalent)
  const depositToken = await MockERC20.deploy(
    config.depositTokenName,
    config.depositTokenSymbol,
    config.depositTokenSupply,
    18
  );
  await depositToken.waitForDeployment();
  console.log("✅ Mock USDC deployed to:", depositToken.target);

  // Deploy collateral token (could be the same or different)
  const collateralToken = await MockERC20.deploy(
    "Mock Collateral Token",
    "mCOL",
    config.depositTokenSupply,
    18
  );
  await collateralToken.waitForDeployment();
  console.log("✅ Mock Collateral Token deployed to:", collateralToken.target);

  // Deploy Credit Oracle
  console.log("\n🏛️ Deploying Credit Oracle...");
  const CreditOracle = await ethers.getContractFactory("CreditOracle");
  const creditOracle = await CreditOracle.deploy(
    config.admin,
    config.emergencyAddress,
    config.securityAddress,
    config.maxDailyVolume
  );
  await creditOracle.waitForDeployment();
  console.log("✅ Credit Oracle deployed to:", creditOracle.target);

  // Deploy Credit NFT
  console.log("\n🎨 Deploying Credit NFT...");
  const CreditNFT = await ethers.getContractFactory("CreditNFT");
  const creditNFT = await CreditNFT.deploy(
    config.admin,
    config.emergencyAddress,
    config.securityAddress,
    config.maxDailyVolume,
    creditOracle.target
  );
  await creditNFT.waitForDeployment();
  console.log("✅ Credit NFT deployed to:", creditNFT.target);

  // Deploy Savings Vault
  console.log("\n🏦 Deploying Savings Vault...");
  const SavingsVault = await ethers.getContractFactory("SavingsVault");
  const savingsVault = await SavingsVault.deploy(
    config.admin,
    config.emergencyAddress,
    config.securityAddress,
    config.maxDailyVolume,
    depositToken.target,
    creditOracle.target,
    config.savingsInterestRate,
    config.minDeposit,
    config.maxDeposit
  );
  await savingsVault.waitForDeployment();
  console.log("✅ Savings Vault deployed to:", savingsVault.target);

  // Deploy Lending Pool
  console.log("\n💰 Deploying Lending Pool...");
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    config.admin,
    config.emergencyAddress,
    config.securityAddress,
    config.maxDailyVolume,
    depositToken.target,
    collateralToken.target,
    creditOracle.target,
    config.liquidationThreshold,
    config.liquidationBonus,
    config.maxLoanDuration,
    config.baseLendingRate
  );
  await lendingPool.waitForDeployment();
  console.log("✅ Lending Pool deployed to:", lendingPool.target);

  // Setup contract permissions
  console.log("\n🔐 Setting up contract permissions...");

  // Authorize contracts to interact with Credit Oracle
  console.log("- Authorizing Savings Vault to update credit scores...");
  await creditOracle.setAuthorizedContract(savingsVault.target, true);

  console.log("- Authorizing Lending Pool to update credit scores...");
  await creditOracle.setAuthorizedContract(lendingPool.target, true);

  console.log("- Authorizing Credit NFT to read credit data...");
  await creditOracle.setAuthorizedContract(creditNFT.target, true);

  // Grant necessary roles
  console.log("- Setting up NFT minter role...");
  const MINTER_ROLE = await creditNFT.MINTER_ROLE();
  await creditNFT.grantRole(MINTER_ROLE, savingsVault.target);
  await creditNFT.grantRole(MINTER_ROLE, lendingPool.target);

  // Fund some tokens to deployer for testing
  console.log("\n💵 Funding deployer with test tokens...");
  const fundAmount = ethers.parseEther("10000");
  // These are mint functions in our mock tokens
  if (typeof depositToken.mint === "function") {
    await depositToken.mint(deployer.address, fundAmount);
    console.log("✅ Minted", ethers.formatEther(fundAmount), "mUSDC to deployer");
  }

  if (typeof collateralToken.mint === "function") {
    await collateralToken.mint(deployer.address, fundAmount);
    console.log("✅ Minted", ethers.formatEther(fundAmount), "mCOL to deployer");
  }

  // Create deployment summary
  const deploymentSummary = {
    network: "Somnia Testnet",
    chainId: 50312,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CreditOracle: {
        address: creditOracle.target,
        constructor: [config.admin, config.emergencyAddress, config.securityAddress, config.maxDailyVolume.toString()]
      },
      CreditNFT: {
        address: creditNFT.target,
        constructor: [config.admin, config.emergencyAddress, config.securityAddress, config.maxDailyVolume.toString(), creditOracle.address]
      },
      SavingsVault: {
        address: savingsVault.target,
        constructor: [config.admin, config.emergencyAddress, config.securityAddress, config.maxDailyVolume.toString(), depositToken.address, creditOracle.address, config.savingsInterestRate]
      },
      LendingPool: {
        address: lendingPool.target,
        constructor: [config.admin, config.emergencyAddress, config.securityAddress, config.maxDailyVolume.toString(), depositToken.address, collateralToken.address, creditOracle.address, config.baseLendingRate, config.liquidationThreshold]
      },
      MockTokens: {
        DepositToken: {
          address: depositToken.target,
          name: config.depositTokenName,
          symbol: config.depositTokenSymbol
        },
        CollateralToken: {
          address: collateralToken.target,
          name: "Mock Collateral Token",
          symbol: "mCOL"
        }
      }
    },
    config: config
  };

  // Save deployment info
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const deploymentFile = path.join(deploymentPath, `somnia-testnet-${Date.now()}.json`);
  // Custom JSON replacer to handle BigInt values
  const jsonReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, jsonReplacer, 2));

  const latestFile = path.join(deploymentPath, "somnia-testnet-latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(deploymentSummary, jsonReplacer, 2));

  // Create frontend constants file
  const frontendContractsPath = path.join(__dirname, "../../frontend/src/lib/contracts.ts");
  const contractsTs = `// Auto-generated contract addresses and ABIs
// Generated on: ${deploymentSummary.timestamp}

export const NETWORK = {
  name: "Somnia Testnet",
  chainId: 50312,
  rpcUrl: "https://rpc-testnet.somnia.network",
  explorerUrl: "https://explorer-testnet.somnia.network",
};

export const CONTRACTS = {
  CreditOracle: {
    address: "${creditOracle.target}",
    abi: [], // Import from generated ABIs
  },
  CreditNFT: {
    address: "${creditNFT.target}",
    abi: [], // Import from generated ABIs
  },
  SavingsVault: {
    address: "${savingsVault.target}",
    abi: [], // Import from generated ABIs
  },
  LendingPool: {
    address: "${lendingPool.target}",
    abi: [], // Import from generated ABIs
  },
  Tokens: {
    USDC: {
      address: "${depositToken.target}",
      symbol: "${config.depositTokenSymbol}",
      decimals: 18,
    },
    Collateral: {
      address: "${collateralToken.target}",
      symbol: "mCOL",
      decimals: 18,
    },
  },
};

export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentSummary, jsonReplacer, 2)};
`;

  // Ensure frontend directory exists
  const frontendLibPath = path.dirname(frontendContractsPath);
  if (!fs.existsSync(frontendLibPath)) {
    fs.mkdirSync(frontendLibPath, { recursive: true });
  }

  fs.writeFileSync(frontendContractsPath, contractsTs);

  console.log("\n🎉 Deployment Complete!");
  console.log("=====================================");
  console.log("📄 Deployment Summary:");
  console.log("- Credit Oracle:", creditOracle.target);
  console.log("- Credit NFT:", creditNFT.target);
  console.log("- Savings Vault:", savingsVault.target);
  console.log("- Lending Pool:", lendingPool.target);
  console.log("- Mock USDC:", depositToken.target);
  console.log("- Mock Collateral:", collateralToken.target);
  console.log("");
  console.log("📊 Files Created:");
  console.log("- Deployment Info:", deploymentFile);
  console.log("- Latest Deployment:", latestFile);
  console.log("- Frontend Contracts:", frontendContractsPath);
  console.log("");
  console.log("🔗 Next Steps:");
  console.log("1. Verify contracts on Somnia block explorer");
  console.log("2. Update frontend environment variables");
  console.log("3. Test all contract interactions");
  console.log("4. Run integration tests");
  console.log("=====================================");

  return deploymentSummary;
}

// Handle both direct execution and module imports
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;