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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          <header style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
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
