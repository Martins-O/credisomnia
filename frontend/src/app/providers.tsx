'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';

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
    default: { http: ['https://rpc.ankr.com/somnia_testnet/cc6c398a6a58ec4606b6694cdd5f950cd021df6bd998733fc2776f6b0e7664cc'] },
  },
  blockExplorers: {
    default: { 
      name: 'Somnia Explorer', 
      url: 'https://explorer-testnet.somnia.network',
    },
  },
  testnet: true,
});

// Simplified config without WalletConnect to avoid lit dependency issues

// Singleton wagmi config to prevent double initialization
let globalWagmiConfig: any = undefined;

function getWagmiConfig() {
  if (!globalWagmiConfig) {
    globalWagmiConfig = createConfig({
      chains: [somniaTestnet],
      transports: {
        [somniaTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/somnia_testnet/cc6c398a6a58ec4606b6694cdd5f950cd021df6bd998733fc2776f6b0e7664cc'),
      },
      ssr: true,
    });
  }
  return globalWagmiConfig;
}

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
  // Use memoized configurations to prevent multiple initializations
  const wagmiConfig = useMemo(() => getWagmiConfig(), []);
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}