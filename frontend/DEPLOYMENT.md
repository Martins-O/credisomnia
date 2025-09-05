# Credisomnia Frontend Deployment Guide

## 🚀 Quick Start for Hackathon

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Smart contracts deployed to Somnia testnet

### 1. Environment Setup

```bash
# Copy environment variables
cp .env.example .env.local

# Update with your values
nano .env.local
```

**Required Environment Variables:**
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
- Contract addresses (after smart contract deployment)

### 2. Install Dependencies

```bash
npm install
```

### 3. Update Contract Addresses

After deploying smart contracts:

```bash
# Edit the script with your deployed addresses
nano scripts/update-contract-addresses.js

# Run the update script
node scripts/update-contract-addresses.js
```

### 4. Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Smart Contract Integration

### Contract Addresses Required

Update these in your environment files after deployment:

```env
NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS="0xYourCreditOracleAddress"
NEXT_PUBLIC_CREDIT_NFT_ADDRESS="0xYourCreditNFTAddress"  
NEXT_PUBLIC_LENDING_POOL_ADDRESS="0xYourLendingPoolAddress"
NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS="0xYourSavingsVaultAddress"
```

### Contract ABIs

The frontend uses minimal ABI definitions in `hooks/useCredisomnia.ts`. For production, consider:

1. **Generating Type-Safe Hooks:**
   ```bash
   # Install wagmi CLI
   npm install -D @wagmi/cli
   
   # Generate hooks from deployed contracts
   npx wagmi generate
   ```

2. **Using Full ABIs:**
   - Copy ABIs from `contracts/artifacts/`
   - Update hook imports to use generated types

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository:**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Add frontend deployment config"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
   NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS
   NEXT_PUBLIC_CREDIT_NFT_ADDRESS
   NEXT_PUBLIC_LENDING_POOL_ADDRESS
   NEXT_PUBLIC_SAVINGS_VAULT_ADDRESS
   ```

### Option 2: Netlify

1. **Build Command:** `npm run build`
2. **Publish Directory:** `.next`
3. **Environment Variables:** Same as Vercel

### Option 3: Traditional Hosting

1. **Build Static Files:**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Upload `out/` or `.next/` Directory**

## 🔧 Configuration Files

### `next.config.js`
- Security headers configured
- Image optimization setup
- Webpack configuration for Web3 compatibility

### `tailwind.config.js`
- Custom design system
- Component utilities
- Responsive breakpoints

### `tsconfig.json`
- TypeScript configuration
- Path aliases for clean imports
- Strict type checking

## 🚦 Environment-Specific Settings

### Development (`.env.local`)
```env
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🧪 Testing

### Run Tests
```bash
npm run test
npm run test:coverage
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📱 Features Included

### ✅ Web3 Integration
- Wagmi v2 + RainbowKit v2
- Somnia network support
- Contract interaction hooks

### ✅ UI/UX
- Responsive design (mobile-first)
- Dark mode support
- Framer Motion animations
- Custom design system

### ✅ Pages
- **Landing Page** - Hero, features, stats
- **Dashboard** - User credit overview  
- **Documentation** - Help and guides

### ✅ Components
- Header with wallet connection
- Footer with social links
- Credit score display
- Transaction handling
- Loading states

## 🐛 Troubleshooting

### Common Issues

1. **WalletConnect Warnings:**
   - Get real project ID from WalletConnect Cloud
   - Update `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

2. **Contract Not Found Errors:**
   - Verify contract addresses are correct
   - Check network configuration
   - Ensure contracts are deployed

3. **Build Failures:**
   - Clear `.next` directory: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

4. **Network Issues:**
   - Verify Somnia testnet RPC is accessible
   - Check wallet network selection
   - Confirm contract deployment on correct network

## 📋 Hackathon Checklist

- [ ] Smart contracts deployed to Somnia testnet  
- [ ] Contract addresses updated in environment files
- [ ] WalletConnect project ID configured
- [ ] Frontend builds successfully
- [ ] Wallet connection works
- [ ] Basic contract interactions work
- [ ] App deployed to public URL
- [ ] Demo ready for judges!

## 🎯 Next Steps for Production

1. **Security Audit** - Review smart contracts
2. **Performance Optimization** - Bundle analysis
3. **Analytics Integration** - User behavior tracking  
4. **Error Monitoring** - Sentry or similar
5. **CI/CD Pipeline** - Automated deployments
6. **Domain Setup** - Custom domain configuration

## 📞 Support

- **Documentation:** [/docs](/docs)
- **GitHub Issues:** Create issues for bugs
- **Discord:** Community support channel

---

**Built for Somnia Hackathon 2024** 🏆

Ready to revolutionize DeFi credit scoring! 🚀