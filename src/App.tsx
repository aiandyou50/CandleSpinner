// src/App.tsx
import React, { useState } from 'react';
import Game from './components/Game';
import Deposit from './components/Deposit';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { TON_CONNECT_MANIFEST_URL } from './constants';

type AppMode = 'game' | 'deposit';

function App() {
  // TMA 환경 감지
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const [appMode, setAppMode] = useState<AppMode>('game');

  return (
    <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      {isTMA ? (
        // Telegram Mini App 환경
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
          {appMode === 'deposit' ? (
            <Deposit onBack={() => setAppMode('game')} />
          ) : (
            <>
              <Game onDepositClick={() => setAppMode('deposit')} />
            </>
          )}
        </div>
      ) : (
        // 일반 웹 브라우저 환경
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
          <header className="fixed top-4 right-4 z-50 flex items-center justify-end gap-3">
            <a
              href="https://t.me/CandleSpinner_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              📱 Telegram Mini App
            </a>
            <TonConnectButton />
          </header>
          {appMode === 'deposit' ? (
            <Deposit onBack={() => setAppMode('game')} />
          ) : (
            <>
              <main>
                <Game onDepositClick={() => setAppMode('deposit')} />
              </main>
            </>
          )}
        </div>
      )}
    </TonConnectUIProvider>
  );
}

export default App;
