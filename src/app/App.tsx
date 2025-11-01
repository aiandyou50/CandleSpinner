// src/app/App.tsx
import React, { useState, Suspense, lazy, useEffect } from 'react';
import ErrorBoundary from '../shared/components/ErrorBoundary';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';
import { TON_CONNECT_MANIFEST_URL } from '../constants';
import { logger } from '../shared/lib/logger';
import { DebugPanel } from '../shared/ui/DebugPanel';

// 동적 임포트: 번들 크기 최적화
const GameComplete = lazy(() => import('../features/game/GameComplete'));
const Deposit = lazy(() => import('../features/deposit/Deposit'));

type AppMode = 'game' | 'deposit';

// Suspense Fallback UI
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTop: '3px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ fontSize: '16px', fontWeight: '500' }}>로딩 중...</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  // TMA 환경 감지
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const [appMode, setAppMode] = useState<AppMode>('game');

  // 입금 완료 처리
  const handleDepositSuccess = (amount: number) => {
    logger.info('입금 완료', { amount }, 'App');
    // 게임 화면으로 복귀
    setAppMode('game');
  };

  // 페이지 언로드 시 크레딧을 강제 저장
  useEffect(() => {
    logger.debug('App 마운트', { environment: isTMA ? 'tma' : 'web' }, 'App');

    const handleBeforeUnload = () => {
      // 모든 localStorage 크레딧 데이터를 KV에 저장하려고 시도
      const walletAddresses = Object.keys(localStorage)
        .filter((key) => key.startsWith('gameCredit_'))
        .map((key) => key.replace('gameCredit_', ''));

      walletAddresses.forEach((addr) => {
        const credit = localStorage.getItem(`gameCredit_${addr}`);
        if (credit && addr !== 'backup') {
          // 비동기이지만 페이지 언로드 전에 최소한 시도
          fetch('/api/save-game-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: addr,
              credit: parseInt(credit),
              canDoubleUp: false,
              pendingWinnings: 0
            }),
            // keepalive 플래그로 페이지 언로드 후에도 완료될 수 있도록
            keepalive: true
          }).catch(() => {
            console.log('[App] 언로드 시 크레딧 저장 시도 (실패 무시)');
          });
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTMA]);
    logger.debug('App 마운트', { environment: isTMA ? 'tma' : 'web' }, 'App');

  return (
    <ErrorBoundary>
      <DebugPanel />
      <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      {isTMA ? (
        // ==================== Telegram Mini App 환경 ====================
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative' }}>
          {/* TMA 환경에서도 TonConnect 버튼 표시 */}
          <header style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}>
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
            <Suspense fallback={<LoadingScreen />}>
              <div style={{ width: '100%', maxWidth: 720 }}>
                {appMode === 'deposit' ? (
                  <Deposit 
                    onBack={() => setAppMode('game')}
                    onDepositSuccess={handleDepositSuccess}
                  />
                ) : (
                  <GameComplete onDepositClick={() => setAppMode('deposit')} />
                )}
              </div>
            </Suspense>
          </main>
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
            <Suspense fallback={<LoadingScreen />}>
              <div style={{ width: '100%', maxWidth: 720 }}>
                {appMode === 'deposit' ? (
                  <Deposit 
                    onBack={() => setAppMode('game')}
                    onDepositSuccess={handleDepositSuccess}
                  />
                ) : (
                  <GameComplete onDepositClick={() => setAppMode('deposit')} />
                )}
              </div>
            </Suspense>
          </main>
        </div>
      )}
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default App;
