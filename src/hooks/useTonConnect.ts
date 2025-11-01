/**
 * TON Connect Hook
 * 지갑 연결/해제 상태 관리
 */

import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!wallet);
  }, [wallet]);

  const connect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return {
    isConnected,
    walletAddress: userFriendlyAddress,
    wallet,
    connect,
    disconnect,
  };
}
