#!/usr/bin/env node

/**
 * Script to update contract addresses in environment variables
 * Usage: node scripts/update-contract-addresses.js
 */

const fs = require('fs');
const path = require('path');

// Contract addresses - DEPLOYED TO LOCAL HARDHAT NETWORK
const DEPLOYED_ADDRESSES = {
  NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  NEXT_PUBLIC_CREDIT_NFT_ADDRESS: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  NEXT_PUBLIC_LENDING_POOL_ADDRESS: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

function updateEnvFile(filePath, addresses) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let envContent = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Update each contract address
    Object.entries(addresses).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
        updated = true;
        console.log(`✅ Updated ${key} in ${path.basename(filePath)}`);
      } else {
        envContent += `\n${newLine}`;
        updated = true;
        console.log(`➕ Added ${key} to ${path.basename(filePath)}`);
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, envContent);
      console.log(`💾 Saved changes to ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Updating contract addresses...\n');

  // Check if addresses are still default/empty
  const hasRealAddresses = Object.values(DEPLOYED_ADDRESSES).some(
    addr => addr !== '0x0000000000000000000000000000000000000000'
  );

  if (!hasRealAddresses) {
    console.log('⚠️  WARNING: All addresses are still default values!');
    console.log('📝 Please update the DEPLOYED_ADDRESSES in this script with real deployment addresses.\n');
  }

  // Update environment files
  const envFiles = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env.production'),
  ];

  envFiles.forEach(filePath => {
    updateEnvFile(filePath, DEPLOYED_ADDRESSES);
  });

  console.log('\n✨ Contract address update completed!');
  
  if (hasRealAddresses) {
    console.log('🎯 Next steps:');
    console.log('1. npm run build - Rebuild the frontend');
    console.log('2. npm run dev - Test locally');
    console.log('3. Deploy to production');
  } else {
    console.log('📋 Next steps:');
    console.log('1. Deploy smart contracts to Somnia testnet');
    console.log('2. Update DEPLOYED_ADDRESSES in this script');
    console.log('3. Run this script again');
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateEnvFile, DEPLOYED_ADDRESSES };