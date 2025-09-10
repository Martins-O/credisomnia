'use client';

import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

export function SimpleConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
      } else {
        setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Connection rejected. Please try again.');
      } else if (error.code === -32002) {
        setError('Connection pending. Please check your wallet.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setError(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation flex items-center justify-center"
        >
          {isConnecting ? 'Connecting...' : 'Try Again'}
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Wifi className="w-4 h-4 text-green-500" />
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation flex items-center justify-center"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation flex items-center justify-center"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}