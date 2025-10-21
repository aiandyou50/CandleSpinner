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
        // ==================== Telegram Mini App 환경 ====================
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
          {appMode === 'deposit' ? (
            <Deposit onBack={() => setAppMode('game')} />
          ) : (
            <Game onDepositClick={() => setAppMode('deposit')} />
          )}
        </div>
      ) : (
        // ==================== 일반 웹 브라우저 환경 ====================
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative' }}>
          {/* 고정 헤더: TonConnect 버튼 */}
          <header style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}>
            <a
              href="https://t.me/CandleSpinner_bot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              📱 Telegram Mini App
            </a>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '6px' }}>
              <TonConnectButton />
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
          }}>
            <div style={{ width: '100%', maxWidth: 720 }}>
              {appMode === 'deposit' ? (
                <Deposit onBack={() => setAppMode('game')} />
              ) : (
                <Game onDepositClick={() => setAppMode('deposit')} />
              )}
            </div>
          </main>
        </div>
      )}
    </TonConnectUIProvider>
  );
}

export default App;
