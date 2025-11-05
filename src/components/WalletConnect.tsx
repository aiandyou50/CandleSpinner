/**
 * WalletConnect 컴포넌트
 * TON Connect UI 지갑 연결 버튼
 * 지갑 연결 시 주소를 표시하고 연결 해제 기능을 제공
 */

import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';

export function WalletConnect() {
  const { isConnected, walletAddress, disconnect } = useTonConnect();

  return (
    <div className="flex flex-col items-center gap-2">
      {/* TonConnect 버튼은 항상 표시 */}
      <div className="ton-connect-wrapper">
        <TonConnectButton />
      </div>
      
      {/* 연결된 경우 추가 정보와 연결 해제 버튼 표시 */}
      {isConnected && walletAddress && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <span className="font-semibold">Connected:</span>{' '}
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
          <button
            onClick={disconnect}
            className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
            title="Disconnect wallet"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
