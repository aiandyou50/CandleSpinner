// src/hooks/useJettonWallet.ts
import { useState, useEffect } from 'react';
import { CSPIN_TOKEN_ADDRESS } from '../constants';

/**
 * Hook to derive the user's jetton wallet address from the master contract
 * This is required to send jetton transfer transactions
 */
export function useJettonWallet(userAddress: string | null) {
  const [jettonWalletAddress, setJettonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const deriveJettonWallet = async () => {
      if (!userAddress) {
        setJettonWalletAddress(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call RPC to get jetton wallet address
        const body = {
          rpcBody: {
            jsonrpc: '2.0',
            id: 1,
            method: 'runGetMethod',
            params: {
              address: CSPIN_TOKEN_ADDRESS,
              method: 'get_wallet_address',
              stack: [['tvm.Slice', userAddress]]
            }
          },
          rpcUrl: 'https://toncenter.com/api/v2/jsonRPC'
        };

        const resp = await fetch('/api/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          throw new Error(`RPC request failed: ${resp.status}`);
        }

        const data = await resp.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'RPC error');
        }

        if (data.result && data.result.stack && data.result.stack[0] && data.result.stack[0][1]) {
          const walletAddr = data.result.stack[0][1];
          setJettonWalletAddress(walletAddr);
        } else {
          throw new Error('Invalid RPC response format');
        }
      } catch (err) {
        console.error('Failed to derive jetton wallet:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setJettonWalletAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    deriveJettonWallet();
  }, [userAddress]);

  return { jettonWalletAddress, isLoading, error };
}
