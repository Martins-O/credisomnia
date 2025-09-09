'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

// Define Somnia testnet
const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.somnia.network'] },
  },
  blockExplorers: {
    default: { 
      name: 'Somnia Explorer', 
      url: 'https://explorer-testnet.somnia.network',
    },
  },
  testnet: true,
});

// Create wagmi config (singleton)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '2f8c6f1e6b0a5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d';
const isPlaceholderProjectId = projectId === '2f8c6f1e6b0a5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d';

// Warn in development about placeholder project ID
if (process.env.NODE_ENV === 'development' && isPlaceholderProjectId) {
  console.warn('⚠️  Using placeholder WalletConnect Project ID. Get a real one from https://cloud.walletconnect.com for production');
}

const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Credisomnia DeFi Platform',
  projectId,
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-testnet.somnia.network'),
  },
  ssr: true, // Enable SSR support
});

// Create query client (singleton)
let globalQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!globalQueryClient) globalQueryClient = makeQueryClient()
    return globalQueryClient
  }
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Use memoized query client to prevent multiple initializations
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={somniaTestnet}
          appInfo={{
            appName: 'Credisomnia',
            learnMoreUrl: 'https://docs.credisomnia.com',
          }}
          locale="en-US"
          coolMode={false}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}