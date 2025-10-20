// src/App.tsx
import React, { useState } from 'react';
import Game from './components/Game';
import { TMADeposit } from './components/TMADeposit';
import { DepositDirect } from './components/DepositDirect';
import { DepositAuto } from './components/DepositAuto';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { TON_CONNECT_MANIFEST_URL } from './constants';

type DepositMode = 'main' | 'direct' | 'auto';

function App() {
  // TMA 환경 감지
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const [depositMode, setDepositMode] = useState<DepositMode>('main');

  // 웹 모드: 입금 방식 선택
  if (!isTMA && depositMode !== 'main') {
    return (
      <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
        {depositMode === 'direct' ? (
          <DepositDirect onBack={() => setDepositMode('main')} />
        ) : depositMode === 'auto' ? (
          <DepositAuto onBack={() => setDepositMode('main')} />
        ) : (
          <div>Unknown mode</div>
        )}
      </TonConnectUIProvider>
    );
  }

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
          <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-12 text-blue-400">
                🎮 CandleSpinner
              </h1>

              {/* 입금 방식 선택 UI */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <button
                  onClick={() => setDepositMode('direct')}
                  className="p-6 bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-lg"
                >
                  <p className="font-bold mb-2">💳 방식 A</p>
                  <p className="text-sm">TonConnect 직접 서명</p>
                  <p className="text-xs text-blue-200 mt-2">지갑에서 직접 전송</p>
                </button>

                <button
                  onClick={() => setDepositMode('auto')}
                  className="p-6 bg-green-600 hover:bg-green-500 rounded-lg transition shadow-lg"
                >
                  <p className="font-bold mb-2">🚀 방식 B</p>
                  <p className="text-sm">자동 입금 (Ankr RPC)</p>
                  <p className="text-xs text-green-200 mt-2">백엔드 자동 처리</p>
                </button>
              </div>

              {/* 게임 시작 */}
              <button
                onClick={() => setDepositMode('main')}
                className="w-full py-4 mb-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-lg transition"
              >
                ▶️ 게임 시작
              </button>

              <Game />
            </div>
          </main>
        </div>
      )}
    </TonConnectUIProvider>
  );
}

export default App;
