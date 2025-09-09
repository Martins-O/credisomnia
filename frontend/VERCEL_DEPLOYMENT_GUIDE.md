# Vercel Deployment Guide

## Quick Fix for Common Issues

### 1. Wallet Disconnection Issue ✅ FIXED
**Problem**: Wallet keeps disconnecting on page refresh
**Solution**: Updated providers with proper persistence and reconnection

**Changes Made**:
- Added `storage: localStorage` to wagmi config
- Added `reconnectOnMount: true` to WagmiProvider
- Added `initialChain` to RainbowKitProvider

### 2. Vercel 404 Issue ✅ FIXED
**Problem**: Getting 404 pages on Vercel after deployment
**Solution**: Added proper routing configuration

**Changes Made**:
- Created `vercel.json` with proper rewrites
- Created `middleware.ts` for SPA routing
- Updated `next.config.js` for Vercel compatibility

## Deployment Steps

### Step 1: Environment Variables on Vercel
Set these environment variables in your Vercel dashboard:

```bash
NEXT_PUBLIC_APP_NAME=Credisomnia DeFi Platform
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.somnia.network
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_NETWORK_NAME=Somnia Testnet
```

### Step 2: Get WalletConnect Project ID
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add it to Vercel environment variables

### Step 3: Deploy to Vercel
```bash
# Option 1: Using Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: Using GitHub integration
# Push to GitHub and connect to Vercel dashboard
```

### Step 4: Verify Deployment
1. Check that the main page loads
2. Test wallet connection
3. Navigate to different routes (/dashboard, /dashboard/savings, etc.)
4. Confirm wallet stays connected after page refresh

## Troubleshooting

### If 404 errors persist:
1. Check that `vercel.json` exists in root directory
2. Verify `middleware.ts` is in `src/` directory
3. Ensure no conflicting routing rules

### If wallet keeps disconnecting:
1. Verify WalletConnect Project ID is set
2. Check browser console for errors
3. Try clearing browser cache/localStorage

### If build fails:
1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Check that all environment variables are set

## Files Modified/Created:
- ✅ `src/app/providers.tsx` - Fixed wallet persistence
- ✅ `vercel.json` - Added routing configuration  
- ✅ `src/middleware.ts` - Added SPA routing handler
- ✅ `next.config.js` - Updated for Vercel compatibility

## Testing Locally:
```bash
npm run build
npm start
# Test on http://localhost:3000
```

Your app should now work properly on Vercel with persistent wallet connections! 🚀