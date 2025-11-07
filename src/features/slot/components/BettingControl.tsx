/**
 * 베팅 컨트롤 컴포넌트
 * 슬라이더 + 퀵 버튼 + 스핀 버튼
 */

import { useState, useEffect } from 'react';

interface BettingControlProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  maxCredit: number;
  onSpin: () => void;
  isSpinning: boolean;
}

export function BettingControl({
  betAmount,
  onBetChange,
  maxCredit,
  onSpin,
  isSpinning,
}: BettingControlProps) {
  const [localBet, setLocalBet] = useState(betAmount);

  useEffect(() => {
    setLocalBet(betAmount);
  }, [betAmount]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalBet(value);
    onBetChange(value);
  };

  const handleQuickBet = (amount: number) => {
    const finalAmount = Math.min(amount, maxCredit, 1000);
    setLocalBet(finalAmount);
    onBetChange(finalAmount);
  };

  const handleMaxBet = () => {
    const maxBet = Math.min(maxCredit, 1000);
    setLocalBet(maxBet);
    onBetChange(maxBet);
  };

  const canSpin = maxCredit >= betAmount && betAmount >= 10 && !isSpinning;

  return (
    <div className="betting-control">
      {/* 베팅 금액 표시 */}
      <div className="bet-display">
        <span className="bet-label">베팅 금액</span>
        <span className="bet-amount">{localBet} CSPIN</span>
      </div>

      {/* 슬라이더 */}
      <div className="bet-slider-container">
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={localBet}
          onChange={handleSliderChange}
          className="bet-slider"
          disabled={isSpinning}
        />
        <div className="slider-labels">
          <span>10</span>
          <span>1000</span>
        </div>
      </div>

      {/* 퀵 베팅 버튼 */}
      <div className="quick-bets">
        <button
          onClick={() => handleQuickBet(100)}
          disabled={isSpinning || maxCredit < 100}
          className="quick-bet-btn"
        >
          100
        </button>
        <button
          onClick={() => handleQuickBet(500)}
          disabled={isSpinning || maxCredit < 500}
          className="quick-bet-btn"
        >
          500
        </button>
        <button
          onClick={() => handleQuickBet(1000)}
          disabled={isSpinning || maxCredit < 1000}
          className="quick-bet-btn"
        >
          1000
        </button>
        <button
          onClick={handleMaxBet}
          disabled={isSpinning || maxCredit < 10}
          className="quick-bet-btn max"
        >
          MAX
        </button>
      </div>

      {/* 스핀 버튼 */}
      <button
        onClick={onSpin}
        disabled={!canSpin}
        className={`spin-button ${isSpinning ? 'spinning' : ''}`}
      >
        {isSpinning ? (
          <span className="spinner">⏳</span>
        ) : (
          <span className="spin-icon">🎰</span>
        )}
        <span className="spin-text">
          {isSpinning ? '회전 중...' : '스핀!'}
        </span>
      </button>

      {/* 에러 메시지 */}
      {!canSpin && !isSpinning && (
        <div className="bet-error">
          {maxCredit < betAmount
            ? '크레딧이 부족합니다'
            : betAmount < 10
            ? '최소 베팅액은 10 CSPIN입니다'
            : ''}
        </div>
      )}
    </div>
  );
}
