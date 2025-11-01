import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { WalletConnect } from '@/components/WalletConnect';
import { Deposit } from '@/components/Deposit';
import { SlotMachine } from '@/components/SlotMachine';
import { Withdraw } from '@/components/Withdraw';

function App() {
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 헤더 */}
      <header className="w-full max-w-4xl mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🕯️ CandleSpinner</h1>
              <p className="text-white/80">TON 블록체인 슬롯머신</p>
            </div>
            <TonConnectButton />
          </div>
          
          {/* 크레딧 표시 */}
          {isConnected && (
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-1">보유 크레딧</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? '...' : credit} CSPIN
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="w-full max-w-4xl space-y-6">
        {isConnected && walletAddress ? (
          <>
            {/* 입금 & 인출 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Deposit walletAddress={walletAddress} onSuccess={refreshCredit} />
              <Withdraw walletAddress={walletAddress} currentCredit={credit} onSuccess={refreshCredit} />
            </div>

            {/* 슬롯 머신 */}
            <SlotMachine 
              walletAddress={walletAddress} 
              currentCredit={credit} 
              onSuccess={refreshCredit} 
            />
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
            <p className="text-xl text-white/80">
              TON 지갑을 연결하여 게임을 시작하세요!
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-8 text-white/60 text-sm">
        <p>MVP v2.0.0 - TON 블록체인 기반</p>
      </footer>
    </div>
  );
}

export default App;
