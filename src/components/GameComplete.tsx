// src/components/GameComplete.tsx - MVP 완전 테스트 UI (v3.0)
import React, { useState, useMemo, useCallback } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { useGameState } from '../hooks/useGameState';
import { useToast } from '../hooks/useToast';

interface GameProps {
  onDepositClick?: () => void;
}

type GameScreen = 'main' | 'result' | 'doubleup' | 'collect' | 'withdraw';

const GameComplete: React.FC<GameProps> = ({ onDepositClick }) => {
  // TonConnect 지갑
  const wallet = useTonWallet();
  
  // 게임 상태
  const { userCredit, betAmount, lastWinnings, isSpinning, updateCredit, setBet, endSpin, setLastWinnings } = useGameState();
  const { toast, showToast } = useToast();
  
  // UI 상태
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('main');
  const [withdrawAmount, setWithdrawAmount] = useState(userCredit);
  const [spinResult, setSpinResult] = useState<{ symbols: string[]; winnings: number; isWin: boolean }>({
    symbols: [],
    winnings: 0,
    isWin: false
  });

  // 스핀 핸들러 (useCallback 최적화)
  const handleSpin = useCallback(() => {
    if (userCredit < betAmount) {
      showToast('크레딧이 부족합니다. 입금해주세요.', 'error');
      onDepositClick?.();
      return;
    }

    // API 호출 (시뮬레이션)
    try {
      // updateCredit(userCredit - betAmount); // 크레딧 차감
      const symbols = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑'];
      const result = Array(3)
        .fill(0)
        .map(() => symbols[Math.floor(Math.random() * symbols.length)] || '🍎') as string[];

      const isWin = Math.random() < 0.3; // 30% 승률
      const winnings = isWin ? betAmount * 2 : 0;

      setSpinResult({ symbols: result, winnings, isWin });
      setCurrentScreen('result');

      showToast(isWin ? `승리! +${winnings} CSPIN 획득` : '다시 시도해주세요', isWin ? 'success' : 'error');
      
      if (isWin) {
        setLastWinnings(winnings);
      }
    } catch (error) {
      showToast('스핀 실패', 'error');
      console.error('Spin error:', error);
    }
  }, [userCredit, betAmount, onDepositClick, showToast, endSpin, setLastWinnings]);

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
          borderBottom: '1px solid rgba(255,255,255,0.1)'
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
            onClick={onDepositClick}
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

          {/* 릴 결과 */}
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
            {spinResult.symbols.map((symbol, idx) => (
              <div key={idx}>{symbol}</div>
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
              onClick={() => setCurrentScreen('main')}
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
            빨강 또는 파랑을 선택하세요!
          </p>

          {/* 상금 표시 */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 5px 0' }}>상금</p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#fbbf24',
              margin: '0',
              fontFamily: 'monospace'
            }}>
              {spinResult.winnings.toLocaleString()} CSPIN
            </p>
          </div>

          {/* 선택 버튼 */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => {
                showToast('빨강을 선택했습니다!', 'info');
                setCurrentScreen('main');
              }}
              style={{
                flex: 1,
                padding: '30px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '2px solid #ef4444',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              빨강
            </button>

            <button
              onClick={() => {
                showToast('파랑을 선택했습니다!', 'info');
                setCurrentScreen('main');
              }}
              style={{
                flex: 1,
                padding: '30px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '2px solid #3b82f6',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              파랑
            </button>
          </div>

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
              updateCredit(userCredit + spinResult.winnings);
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
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>📤 CSPIN 인출</h2>

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
                showToast('인출 요청 중...', 'info');

                // Step 1: 백엔드에 인출 요청
                const response = await fetch('/api/initiate-withdrawal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    walletAddress: wallet.account.address,
                    withdrawalAmount: withdrawAmount
                  })
                });

                if (!response.ok) {
                  const error = await response.json();
                  showToast(`인출 실패: ${error.error || error.message}`, 'error');
                  return;
                }

                const result = await response.json();

                // Step 2: 성공 시 UI 업데이트
                if (result.success) {
                  updateCredit(userCredit - withdrawAmount);
                  showToast(`✅ ${withdrawAmount} CSPIN 인출 완료!`, 'success');
                  setCurrentScreen('main');
                } else {
                  showToast(`인출 실패: ${result.error}`, 'error');
                }
              } catch (error) {
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
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
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
            ✓ 인출 요청
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

  return null;
};

// React.memo로 불필요한 리렌더링 방지
export default React.memo(GameComplete);
