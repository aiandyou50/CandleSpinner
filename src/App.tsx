import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { WalletConnect } from '@/components/WalletConnect';
import { Deposit } from '@/components/Deposit';
import { SlotMachine } from '@/components/SlotMachine';
import { SlotMachineV2 } from '@/features/slot';
import { Withdraw } from '@/components/Withdraw';
import { AdminWithdrawals } from '@/components/AdminWithdrawals';
import { LanguageSelector } from '@/components/LanguageSelector';

function GamePage() {
  const { t } = useTranslation();
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 헤더 */}
      <header className="w-full max-w-4xl mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🕯️ {t('app.title')}</h1>
              <p className="text-white/80">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <WalletConnect />
            </div>
          </div>
          
          {/* 크레딧 표시 */}
          {isConnected && (
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-1">{t('header.credit')}</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? t('header.loading') : credit} CSPIN
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
                🎰 {t('game.newVersion')}
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
            <p className="text-xl text-white/80">
              {t('wallet.connectPrompt')}
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-8 text-white/60 text-sm">
        <p>{t('app.footer')}</p>
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
  const { t } = useTranslation();
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 헤더 */}
      <header className="w-full max-w-4xl mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎰 {t('game.title')} V2</h1>
              <p className="text-white/80">{t('game.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <WalletConnect />
            </div>
          </div>
          
          {/* 크레딧 표시 */}
          {isConnected && (
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-1">{t('header.credit')}</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? t('header.loading') : credit} CSPIN
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
                {t('game.oldVersion')}
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
            <p className="text-xl text-white/80">
              {t('wallet.connectPrompt')}
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-8 text-white/60 text-sm">
        <p>{t('game.title')} {t('app.version')} - {t('game.subtitle')}</p>
      </footer>
    </div>
  );
}

export default App;
