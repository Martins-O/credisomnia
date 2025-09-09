'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export function SimpleConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}