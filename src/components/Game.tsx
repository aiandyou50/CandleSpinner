// src/components/Game.tsx - MVP UI 완전 재작성
import React, { useState } from 'react';
import { create } from 'zustand';

interface GameStore {
  userCredit: number;
  betAmount: number;
  lastWinnings: number;
  isSpinning: boolean;
  setUserCredit: (credit: number) => void;
  setBetAmount: (amount: number) => void;
  setLastWinnings: (winnings: number) => void;
  setIsSpinning: (spinning: boolean) => void;
}

const useGameStore = create<GameStore>((set) => ({
  userCredit: 1000,
  betAmount: 100,
  lastWinnings: 0,
  isSpinning: false,
  setUserCredit: (credit) => set({ userCredit: credit }),
  setBetAmount: (amount) => set({ betAmount: amount }),
  setLastWinnings: (winnings) => set({ lastWinnings: winnings }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
}));

interface GameProps {
  onDepositClick?: () => void;
}

const Game: React.FC<GameProps> = ({ onDepositClick }) => {
  const { userCredit, betAmount, lastWinnings, isSpinning, setUserCredit, setBetAmount, setLastWinnings, setIsSpinning } = useGameStore();
  const [spinResult, setSpinResult] = useState<string>('');

  // 스핀 시뮬레이션
  const handleSpin = () => {
    if (userCredit < betAmount) {
      alert('크레딧이 부족합니다. 입금해주세요.');
      onDepositClick?.();
      return;
    }

    setIsSpinning(true);
    setSpinResult('');

    // 스핀 애니메이션 시뮬레이션 (1.5초)
    setTimeout(() => {
      const symbols = ['🍎', '🍊', '🍋', '🍌', '🍇'];
      const result = symbols
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .join(' ');

      // 승리 확률 (30%)
      const isWin = Math.random() < 0.3;
      const winnings = isWin ? betAmount * 2 : 0;

      setSpinResult(result);
      setUserCredit(userCredit - betAmount + winnings);
      setLastWinnings(winnings);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* 제목 */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #60a5fa, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🚀 Candle Spinner
      </h1>

      {/* 크레딧 표시 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>현재 크레딧</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#60a5fa' }}>
          {userCredit.toLocaleString()} CSPIN
        </p>
      </div>

      {/* 베팅액 설정 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', opacity: 0.8 }}>베팅액 선택</label>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
          {[50, 100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              style={{
                padding: '8px 16px',
                border: betAmount === amount ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.3)',
                background: betAmount === amount ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = betAmount === amount ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.05)';
              }}
            >
              {amount}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '10px' }}>
          선택된 베팅액: <strong>{betAmount.toLocaleString()} CSPIN</strong>
        </p>
      </div>

      {/* 스핀 결과 표시 */}
      {spinResult && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '2px solid #22c55e',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>최근 스핀 결과</p>
          <p style={{ fontSize: '36px', marginBottom: '8px' }}>{spinResult}</p>
          {lastWinnings > 0 && (
            <p style={{ fontSize: '14px', color: '#22c55e', fontWeight: 'bold' }}>
              🎉 승리! +{lastWinnings.toLocaleString()} CSPIN
            </p>
          )}
          {lastWinnings === 0 && spinResult && (
            <p style={{ fontSize: '14px', color: '#ef4444' }}>다시 시도해주세요!</p>
          )}
        </div>
      )}

      {/* 스핀 버튼 */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || userCredit < betAmount}
        style={{
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          background: isSpinning || userCredit < betAmount
            ? 'rgba(107, 114, 128, 0.5)'
            : 'linear-gradient(135deg, #3b82f6, #ec4899)',
          color: 'white',
          cursor: isSpinning || userCredit < betAmount ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          marginBottom: '20px',
          opacity: isSpinning ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isSpinning && userCredit >= betAmount) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isSpinning ? '🎡 스핀 중...' : '🎯 스핀!'}
      </button>

      {/* 입금 버튼 */}
      <button
        onClick={onDepositClick}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          border: '2px solid #10b981',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
        }}
      >
        💰 CSPIN 입금
      </button>

      {/* 크레딧 부족 경고 */}
      {userCredit < betAmount && (
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#ef4444' }}>
          ⚠️ 크레딧이 부족합니다. 입금해주세요.
        </p>
      )}
    </div>
  );
};

export default Game;
