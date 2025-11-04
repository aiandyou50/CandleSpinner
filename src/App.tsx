import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { WalletConnect } from '@/components/WalletConnect';
import { Deposit } from '@/components/Deposit';
import { SlotMachine } from '@/components/SlotMachine';
import { SlotMachineV2 } from '@/features/slot';
import { Withdraw } from '@/components/Withdraw';
import { AdminWithdrawals } from '@/components/AdminWithdrawals';

function GamePage() {
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

            {/* 신버전 링크 */}
            <div className="text-center">
              <Link 
                to="/slot-v2" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                🎰 신버전 슬롯머신 체험하기 (Provably Fair)
              </Link>
            </div>
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/slot-v2" element={<SlotV2Page />} />
        <Route path="/admin" element={<AdminWithdrawals />} />
      </Routes>
    </BrowserRouter>
  );
}

function SlotV2Page() {
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 헤더 */}
      <header className="w-full max-w-4xl mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎰 슬롯머신 V2</h1>
              <p className="text-white/80">Provably Fair 공정한 게임</p>
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

            {/* 슬롯머신 V2 */}
            <SlotMachineV2 
              walletAddress={walletAddress} 
              currentCredit={credit} 
              onCreditChange={refreshCredit} 
            />

            {/* 구버전 링크 */}
            <div className="text-center">
              <Link 
                to="/" 
                className="text-purple-400 hover:text-purple-300 underline"
              >
                구버전 슬롯머신으로 돌아가기
              </Link>
            </div>
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
        <p>슬롯머신 V2.0.0 - Provably Fair 알고리즘</p>
      </footer>
    </div>
  );
}

export default App;
