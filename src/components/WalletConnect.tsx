/**
 * WalletConnect 컴포넌트
 * TON Connect UI 지갑 연결 버튼
 */

import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';

export function WalletConnect() {
  const { isConnected, walletAddress } = useTonConnect();

  return (
    <div className="flex flex-col items-center gap-4">
      <TonConnectButton />
      
      {isConnected && walletAddress && (
        <div className="text-sm text-gray-300">
          <span className="font-semibold">Connected:</span>{' '}
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}
    </div>
  );
}
