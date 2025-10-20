// src/App.tsx
import React from 'react';
import Game from './components/Game';
import { TMADeposit } from './components/TMADeposit';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { TON_CONNECT_MANIFEST_URL } from './constants';

function App() {
  // TMA 환경 감지
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  return (
    <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      {isTMA ? (
        // Telegram Mini App 환경
        <TMADeposit />
      ) : (
        // 일반 웹 브라우저 환경
        <div>
          <header style={{ position: 'absolute', top: 12, right: 12 }}>
            <TonConnectButton />
          </header>
          <main>
            <Game />
          </main>
        </div>
      )}
    </TonConnectUIProvider>
  );
}

export default App;
