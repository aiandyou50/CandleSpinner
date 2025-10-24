// src/components/GameComplete.tsx - MVP 완전 테스트 UI (v3.0)
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useGameState } from '../hooks/useGameState';
import { useToast } from '../hooks/useToast';
import { useDeveloperMode } from '../hooks/useDeveloperMode';

interface GameProps {
  onDepositClick?: () => void;
}

type GameScreen = 'main' | 'result' | 'doubleup' | 'collect' | 'withdraw';

const GameComplete: React.FC<GameProps> = ({ onDepositClick }) => {
  // TonConnect 지갑 및 UI
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  
  // 게임 상태
  const { userCredit, betAmount, lastWinnings, isSpinning, updateCredit, setBet, endSpin, setLastWinnings, refreshCreditFromKV, saveGameState } = useGameState();
  const { toast, showToast } = useToast();
  
  // 개발자 모드
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode();
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // UI 상태
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('main');
  const [withdrawAmount, setWithdrawAmount] = useState(userCredit);
  const [spinResult, setSpinResult] = useState<{ symbols: string[]; winnings: number; isWin: boolean }>({
    symbols: [],
    winnings: 0,
    isWin: false
  });

  // 더블업 상태 (컴포넌트 top-level에 선언)
  const [doubleupChoice, setDoubleupChoice] = useState<'red' | 'blue' | null>(null);
  const [doubleupResult, setDoubleupResult] = useState<'win' | 'lose' | null>(null);

  // 스핀 핸들러 (useCallback 최적화)
  const handleSpin = useCallback(() => {
    if (userCredit < betAmount) {
      showToast('크레딧이 부족합니다. 입금해주세요.', 'error');
      onDepositClick?.();
      return;
    }

    // API 호출 (시뮬레이션)
    try {
      // Step 1: 베팅액 차감 (스핀 시 크레딧 소비)
      updateCredit(-betAmount);
      
      const symbols = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑'];
      const result = Array(3)
        .fill(0)
        .map(() => symbols[Math.floor(Math.random() * symbols.length)] || '🍎') as string[];

      // 개발자 모드: 100% 승리, 일반 모드: 30% 승률
      const isWin = isDeveloperMode ? true : Math.random() < 0.3;
      const winnings = isWin ? betAmount * 2 : 0;

      setSpinResult({ symbols: result, winnings, isWin });
      setCurrentScreen('result');

      showToast(isWin ? `${isDeveloperMode ? '🔧 개발자 모드: ' : ''}승리! +${winnings} CSPIN 획득` : '다시 시도해주세요', isWin ? 'success' : 'error');
      
      if (isWin) {
        setLastWinnings(winnings);
      }
    } catch (error) {
      showToast('스핀 실패', 'error');
      console.error('Spin error:', error);
    }
  }, [userCredit, betAmount, onDepositClick, showToast, endSpin, setLastWinnings, isDeveloperMode]);

  // 베팅액 버튼 (useMemo 최적화)
  const betAmountButtons = useMemo(() => {
    return [50, 100, 500, 1000].map((amount) => (
      <button
        key={amount}
        onClick={() => setBet(amount)}
        style={{
          padding: '10px 20px',
          border: betAmount === amount ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.3)',
          background: betAmount === amount ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = betAmount === amount ? 'rgba(96, 165, 250, 0.2)' : 'transparent';
        }}
      >
        {amount}
      </button>
    ));
  }, [betAmount, setBet]);

  /**
   * 화면 전환 시 자동으로 현재 크레딧 저장
   * 모든 화면 이동에서 KV 동기화 (상금 손실 방지)
   * 주의: 뒤로가기 시에도 저장되도록 즉시 호출 (100ms 딜레이 제거)
   */
  useEffect(() => {
    if (currentScreen !== 'main') {
      console.log('[GameComplete] 💾 화면 전환 감지 (즉시 저장):', currentScreen, userCredit);
      // 즉시 저장 (딜레이 없음 - 뒤로가기 시에도 완료됨)
      saveGameState();
    }
  }, [currentScreen, userCredit, saveGameState]);

  /**
   * 페이지 언로드 시 강제 저장 (뒤로가기 포함)
   * beforeunload 이벤트로 마지막 기회 확보
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('[GameComplete] 🚪 페이지 언로드 감지 (강제 저장):', currentScreen, userCredit);
      // 동기적으로 localStorage에 저장 (KV 저장은 비동기지만 최소한 로컬에 저장)
      if (currentScreen !== 'main' && userCredit > 0) {
        localStorage.setItem('lastGameState_emergency', JSON.stringify({
          credit: userCredit,
          currentScreen,
          timestamp: Date.now()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentScreen, userCredit]);

  /**
   * 입금 성공 후 크레딧 새로고침
   * localStorage depositSuccess_ 변화 감지 또는 주기적 새로고침
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'depositSuccess_') {
        console.log('[GameComplete] 📢 입금 완료 이벤트 감지! 크레딧 새로고침 시작...');
        // 200ms 후 새로고침 (입금 처리 완료 대기)
        setTimeout(() => {
          refreshCreditFromKV();
        }, 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCreditFromKV]);

  // ==================== 메인 게임 화면 ====================
  if (currentScreen === 'main') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #60a5fa, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Candle Spinner
          </h1>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: '0' }}>
            v2.5.0 - MVP 테스트
          </p>
          
          {/* 개발자 모드 버튼 (상단 우측) */}
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: isDeveloperMode ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              background: isDeveloperMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
              color: isDeveloperMode ? '#10b981' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDeveloperMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDeveloperMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)';
            }}
          >
            {isDeveloperMode ? '🔴 개발자 모드 ON' : '⚪ 개발자 모드'}
          </button>
        </header>

        {/* 메인 콘텐츠 */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* 크레딧 표시 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '300px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '0 0 10px 0' }}>
              현재 크레딧
            </p>
            <p style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#60a5fa',
              margin: '0',
              fontFamily: 'monospace'
            }}>
              {userCredit.toLocaleString()}
            </p>
            <p style={{ fontSize: '12px', opacity: 0.6, margin: '10px 0 0 0' }}>
              CSPIN
            </p>
          </div>

          {/* 베팅액 선택 */}
          <div style={{
            width: '100%',
            maxWidth: '400px'
          }}>
            <label style={{ fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '12px' }}>
              베팅액 선택
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}>
              {betAmountButtons}
            </div>
            <p style={{
              fontSize: '12px',
              opacity: 0.6,
              marginTop: '12px',
              textAlign: 'center'
            }}>
              선택됨: <strong style={{ color: '#60a5fa', fontSize: '14px' }}>{betAmount.toLocaleString()} CSPIN</strong>
            </p>
          </div>

          {/* 스핀 버튼 */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || userCredit < betAmount}
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              background: isSpinning || userCredit < betAmount
                ? 'rgba(107, 114, 128, 0.5)'
                : 'linear-gradient(135deg, #3b82f6, #ec4899)',
              color: 'white',
              cursor: isSpinning || userCredit < betAmount ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: isSpinning ? 'none' : '0 8px 20px rgba(59, 130, 246, 0.3)',
              opacity: isSpinning ? 0.7 : 1,
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              if (!isSpinning && userCredit >= betAmount) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
            }}
          >
            {isSpinning ? '🎡 스핀 중...' : '🎯 스핀!'}
          </button>

          {/* 입금 버튼 */}
          <button
            onClick={() => {
              // 입금 전에 현재 크레딧을 명시적으로 저장
              console.log('[GameComplete] 💾 입금 페이지 이동 전 크레딧 저장:', userCredit);
              saveGameState();
              // 약간의 딜레이 후 입금 페이지로 이동
              setTimeout(() => {
                onDepositClick?.();
              }, 50);
            }}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '2px solid #10b981',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            💰 CSPIN 입금
          </button>

          {/* 기타 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            maxWidth: '400px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {lastWinnings > 0 && (
              <button
                onClick={() => setCurrentScreen('doubleup')}
                style={{
                  flex: '1',
                  minWidth: '90px',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                }}
              >
                🎰 더블업
              </button>
            )}

            {lastWinnings > 0 && (
              <button
                onClick={() => setCurrentScreen('collect')}
                style={{
                  flex: '1',
                  minWidth: '90px',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #8b5cf6',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
              >
                🎁 수령
              </button>
            )}

            <button
              onClick={() => setCurrentScreen('withdraw')}
              style={{
                flex: '1',
                minWidth: '90px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              📤 인출
            </button>
          </div>
        </main>

        {/* 토스트 메시지 */}
        {toast && toast.message && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
          }}>
            {toast.message}
          </div>
        )}

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>

        {/* 비밀번호 입력 모달 */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001
          }} onClick={() => {
            setShowPasswordModal(false);
            setPasswordInput('');
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '300px',
              width: '90%',
              backdropFilter: 'blur(10px)'
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                textAlign: 'center',
                color: '#60a5fa'
              }}>
                개발자 모드
              </h2>

              <p style={{
                fontSize: '12px',
                opacity: 0.7,
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {isDeveloperMode ? '현재 개발자 모드가 켜져있습니다.' : '비밀번호를 입력하여 개발자 모드를 활성화하세요.'}
              </p>

              {!isDeveloperMode ? (
                <>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        toggleDeveloperMode(passwordInput);
                        setPasswordInput('');
                        setShowPasswordModal(false);
                      }
                    }}
                    placeholder="비밀번호 입력"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '14px',
                      marginBottom: '16px',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => {
                        toggleDeveloperMode(passwordInput);
                        setPasswordInput('');
                        setShowPasswordModal(false);
                      }}
                      style={{
                        padding: '10px',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                      }}
                    >
                      확인
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordInput('');
                      }}
                      style={{
                        padding: '10px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    toggleDeveloperMode('');
                    setShowPasswordModal(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  개발자 모드 OFF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== 결과 화면 ====================
  if (currentScreen === 'result') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>
            {spinResult.isWin ? '🎉 승리!' : '😢 아쉬워요'}
          </h2>

          {/* 릴 결과 - 애니메이션 추가 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '30px',
            fontSize: '60px',
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '12px'
          }}>
            <style>{`
              @keyframes spinReel {
                0% { transform: rotateY(0deg) scale(1); opacity: 0.7; }
                50% { transform: rotateY(180deg) scale(1.1); opacity: 0.5; }
                100% { transform: rotateY(360deg) scale(1); opacity: 1; }
              }
              .reel {
                animation: spinReel 0.8s ease-out forwards;
              }
              .reel-1 { animation-delay: 0s; }
              .reel-2 { animation-delay: 0.2s; }
              .reel-3 { animation-delay: 0.4s; }
              @keyframes spin3d {
                0%, 100% { transform: rotateY(0deg); }
                50% { transform: rotateY(720deg); }
              }
            `}</style>
            {spinResult.symbols.map((symbol, idx) => (
              <div
                key={idx}
                className={`reel reel-${idx + 1}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontWeight: 'bold',
                  perspective: '1000px'
                }}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* 상금 표시 */}
          {spinResult.isWin && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid #22c55e',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: '0 0 10px 0' }}>
                획득 상금
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#22c55e',
                margin: '0',
                fontFamily: 'monospace'
              }}>
                +{spinResult.winnings.toLocaleString()}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={async () => {
                // 현재 크레딧 상태를 KV에 저장 (스핀 결과가 손실되지 않도록)
                await saveGameState();
                // 더블업 상태 리셋
                setDoubleupChoice(null);
                setDoubleupResult(null);
                setCurrentScreen('main');
              }}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              계속 게임
            </button>

            {spinResult.isWin && (
              <button
                onClick={() => setCurrentScreen('doubleup')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  cursor: 'pointer'
                }}
              >
                더블업 시도
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 더블업 화면 ====================
  if (currentScreen === 'doubleup') {
    const handleDoubleupChoice = (choice: 'red' | 'blue') => {
      setDoubleupChoice(choice);
      
      // 50% 확률
      const result = Math.random() < 0.5 ? 'win' : 'lose';
      setDoubleupResult(result);
      
      if (result === 'win') {
        // 성공: 상금 2배
        const newWinnings = spinResult.winnings * 2;
        setSpinResult({ ...spinResult, winnings: newWinnings });
        showToast(`🎉 성공! 상금 2배 획득: ${newWinnings} CSPIN`, 'success');
        
        // 1.5초 후 자동으로 수령 화면으로 전환
        setTimeout(() => {
          setCurrentScreen('collect');
        }, 1500);
      } else {
        // 실패: 상금 잃음
        showToast(`❌ 실패! 상금을 잃었습니다.`, 'error');
        setSpinResult({ ...spinResult, winnings: 0 });
        
        // 1.5초 후 자동으로 메인으로 돌아감
        setTimeout(() => {
          // 더블업 상태 리셋
          setDoubleupChoice(null);
          setDoubleupResult(null);
          setCurrentScreen('main');
          setLastWinnings(0);
        }, 1500);
      }
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>🎰 더블업 미니게임</h2>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '30px' }}>
            {doubleupResult ? '결과를 기다리세요...' : '빨강 또는 파랑을 선택하세요!'}
          </p>

          {/* 상금 표시 */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 5px 0' }}>
              {doubleupResult === 'win' ? '획득 상금 (2배)' : '현재 상금'}
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: doubleupResult === 'win' ? '#10b981' : doubleupResult === 'lose' ? '#ef4444' : '#fbbf24',
              margin: '0',
              fontFamily: 'monospace',
              transition: 'all 0.3s'
            }}>
              {spinResult.winnings.toLocaleString()} CSPIN
            </p>
          </div>

          {/* 선택 버튼 (결과 나올 때까지만 활성화) */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginBottom: '20px',
            opacity: doubleupResult ? 0.5 : 1,
            pointerEvents: doubleupResult ? 'none' : 'auto'
          }}>
            <button
              onClick={() => handleDoubleupChoice('red')}
              disabled={!!doubleupResult}
              style={{
                flex: 1,
                padding: '30px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: doubleupChoice === 'red' ? '3px solid #ef4444' : '2px solid #ef4444',
                borderRadius: '10px',
                background: doubleupChoice === 'red' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                cursor: doubleupResult ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!doubleupResult) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!doubleupResult) {
                  e.currentTarget.style.background = doubleupChoice === 'red' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              🔴 빨강
            </button>

            <button
              onClick={() => handleDoubleupChoice('blue')}
              disabled={!!doubleupResult}
              style={{
                flex: 1,
                padding: '30px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: doubleupChoice === 'blue' ? '3px solid #3b82f6' : '2px solid #3b82f6',
                borderRadius: '10px',
                background: doubleupChoice === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                cursor: doubleupResult ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!doubleupResult) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!doubleupResult) {
                  e.currentTarget.style.background = doubleupChoice === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              🔵 파랑
            </button>
          </div>

          {/* 결과 메시지 */}
          {doubleupResult && (
            <div style={{
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '10px',
              background: doubleupResult === 'win' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${doubleupResult === 'win' ? '#10b981' : '#ef4444'}`,
              color: doubleupResult === 'win' ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {doubleupResult === 'win' ? '✅ 더블업 성공!' : '❌ 더블업 실패!'}
            </div>
          )}

          <button
            onClick={() => {
              setCurrentScreen('main');
              setLastWinnings(0);
              setDoubleupChoice(null);
              setDoubleupResult(null);
            }}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // ==================== 수령 화면 ====================
  if (currentScreen === 'collect') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>🎁 상금 수령</h2>

          <div style={{
            background: 'rgba(139, 92, 246, 0.2)',
            border: '2px solid #8b5cf6',
            padding: '30px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '0 0 10px 0' }}>
              수령할 상금
            </p>
            <p style={{
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#8b5cf6',
              margin: '0',
              fontFamily: 'monospace'
            }}>
              +{spinResult.winnings.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => {
              // 상금 수령: spinResult.winnings를 크레딧에 추가 (베팅액은 이미 스핀 시 차감됨)
              updateCredit(spinResult.winnings);
              showToast(`${spinResult.winnings} CSPIN을 수령했습니다!`, 'success');
              setLastWinnings(0);
              setCurrentScreen('main');
            }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✓ 수령하기
          </button>

          <button
            onClick={() => setCurrentScreen('main')}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // ==================== 인출 화면 ====================
  if (currentScreen === 'withdraw') {
    const [withdrawMode, setWithdrawMode] = useState<'centralized' | 'rpc'>('centralized');
    const [showDebug, setShowDebug] = useState(false);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addDebugLog = (message: string) => {
      setDebugLog(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>📤 CSPIN 인출</h2>

          {/* 모드 선택 탭 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.05)',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setWithdrawMode('centralized')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: withdrawMode === 'centralized' 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'transparent',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '12px'
              }}
            >
              👤 중앙화 방식<br/>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>사용자 서명</span>
            </button>
            <button
              onClick={() => setWithdrawMode('rpc')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: withdrawMode === 'rpc' 
                  ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  : 'transparent',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '12px'
              }}
            >
              ⚡ RPC 방식<br/>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>즉시 완료</span>
            </button>
          </div>

          {/* 모드 설명 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            textAlign: 'left',
            lineHeight: '1.6'
          }}>
            {withdrawMode === 'centralized' ? (
              <>
                <strong style={{ color: '#60a5fa' }}>👤 중앙화 방식</strong><br/>
                ✅ 사용자가 직접 서명<br/>
                ✅ 완전한 제어권<br/>
                ℹ️ 추가 서명 단계 필요
              </>
            ) : (
              <>
                <strong style={{ color: '#a78bfa' }}>⚡ RPC 방식</strong><br/>
                ✅ 즉시 완료<br/>
                ✅ 서명 불필요<br/>
                ℹ️ 게임 지갑 사용
              </>
            )}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 10px 0' }}>
              보유한 크레딧
            </p>
            <p style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#60a5fa',
              margin: '0',
              fontFamily: 'monospace'
            }}>
              {userCredit.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <label style={{ fontSize: '12px', opacity: 0.7 }}>인출액</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Math.max(0, Math.min(userCredit, Number(e.target.value))))}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #60a5fa',
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                textAlign: 'center',
                outline: 'none',
                fontFamily: 'monospace',
                marginTop: '10px',
                paddingBottom: '10px'
              }}
            />
          </div>

          {/* 인출 버튼 (모드별) */}
          <button
            onClick={async () => {
              if (withdrawAmount <= 0) {
                showToast('인출액을 입력해주세요.', 'error');
                return;
              }

              if (!wallet?.account?.address) {
                showToast('지갑을 연결해주세요.', 'error');
                return;
              }

              try {
                addDebugLog(`인출 시작: ${withdrawAmount} CSPIN (${withdrawMode} 모드)`);
                showToast('인출 요청 중...', 'info');

                const response = await fetch('/api/initiate-withdrawal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    walletAddress: wallet.account.address,
                    withdrawalAmount: withdrawAmount,
                    mode: withdrawMode
                  })
                });

                addDebugLog(`API 응답 상태: ${response.status}`);

                if (!response.ok) {
                  const error = await response.json();
                  addDebugLog(`❌ 오류: ${error.error || error.message}`);
                  showToast(`인출 실패: ${error.error || error.message}`, 'error');
                  return;
                }

                const result = await response.json();
                addDebugLog(`✅ API 응답 성공: ${JSON.stringify(result).substring(0, 100)}...`);

                if (result.success) {
                  // 중앙화 모드: 사용자 서명 필요
                  if (withdrawMode === 'centralized' && result.boc) {
                    addDebugLog('BOC 받음, 사용자 서명 요청 중...');
                    showToast(`트랜잭션 생성 완료. TON Connect에서 서명해주세요.`, 'info');
                    
                    try {
                      const tx = {
                        validUntil: Math.floor(Date.now() / 1000) + 600,
                        messages: [{
                          address: wallet.account.address,
                          amount: result.tonAmount || '30000000',
                          payload: result.boc
                        }]
                      };
                      
                      addDebugLog('TON Connect 트랜잭션 전송...');
                      const txResult = await tonConnectUI.sendTransaction(tx);
                      
                      if (txResult?.boc) {
                        addDebugLog(`✅ 트랜잭션 완료: ${txResult.boc.substring(0, 20)}...`);
                        showToast(`✅ ${withdrawAmount} CSPIN 인출 완료!`, 'success');
                        updateCredit(result.newCredit);
                        setCurrentScreen('main');
                      } else {
                        addDebugLog(`⚠️ 트랜잭션 응답 없음: ${JSON.stringify(txResult)}`);
                      }
                    } catch (signError) {
                      addDebugLog(`❌ 서명 오류: ${signError instanceof Error ? signError.message : String(signError)}`);
                      console.error('[서명 오류]:', signError);
                      showToast('트랜잭션 서명에 실패했습니다.', 'error');
                    }
                  } 
                  // RPC 모드: 즉시 완료
                  else if (withdrawMode === 'rpc' && result.txHash) {
                    addDebugLog(`✅ RPC 완료: ${result.txHash}`);
                    showToast(`✅ ${withdrawAmount} CSPIN 인출 완료! (TX: ${result.txHash.substring(0, 10)}...)`, 'success');
                    updateCredit(result.newCredit);
                    setCurrentScreen('main');
                  } else {
                    addDebugLog(`⚠️ 예상치 못한 응답: ${JSON.stringify(result)}`);
                    showToast(`인출 완료!`, 'success');
                    updateCredit(result.newCredit);
                    setCurrentScreen('main');
                  }
                } else {
                  addDebugLog(`❌ 성공 응답 아님: ${result.error}`);
                  showToast(`인출 실패: ${result.error}`, 'error');
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                addDebugLog(`❌ 네트워크 오류: ${errorMsg}`);
                console.error('[인출 오류]:', error);
                showToast('인출 중 오류 발생', 'error');
              }
            }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              background: withdrawMode === 'centralized' 
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {withdrawMode === 'centralized' ? '✓ 중앙화 방식 인출' : '⚡ RPC 방식 인출'}
          </button>

          {/* 디버그 로그 패널 */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '11px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            {showDebug ? '🔽 디버그 로그 숨기기' : '▶️ 디버그 로그 보기'}
          </button>

          {showDebug && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,0,0,0.3)',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '12px',
              maxHeight: '150px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '10px',
              textAlign: 'left'
            }}>
              {debugLog.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>로그 없음</div>
              ) : (
                debugLog.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes('❌') ? '#ff6b6b' : log.includes('✅') ? '#51cf66' : 'rgba(255,255,255,0.7)',
                    lineHeight: '1.4'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={() => setCurrentScreen('main')}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// React.memo로 불필요한 리렌더링 방지
export default React.memo(GameComplete);
