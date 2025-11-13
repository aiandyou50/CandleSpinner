/**
 * 슬롯 머신 컴포넌트
 */

import { useState, useCallback, useRef } from 'react';
import { spin as spinApi } from '@/api/client';

interface SlotMachineProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

const ALL_SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];

export function SlotMachine({ walletAddress, currentCredit, onSuccess }: SlotMachineProps) {
  const [symbols, setSymbols] = useState<string[][]>([
    ['🍒', '🍋', '🍊'],
    ['🍉', '⭐', '💎'],
    ['🍒', '🍋', '🍊'],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSpin = useCallback(async () => {
    if (currentCredit < 1) {
      alert('크레딧이 부족합니다! 먼저 CSPIN을 입금해주세요.');
      return;
    }

    try {
      setIsSpinning(true);
      setLastWin(null);

      // 애니메이션 효과 (랜덤 심볼 표시) - 최적화: 상수 재사용
      intervalRef.current = setInterval(() => {
        setSymbols(prevSymbols => 
          prevSymbols.map(row => 
            row.map(() => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]!)
          )
        );
      }, 100);

      // API 호출
      const result = await spinApi(walletAddress);

      // 애니메이션 멈추고 결과 표시
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setSymbols(result.result);
        setLastWin(result.winAmount);
        setIsSpinning(false);
        onSuccess();

        if (result.winAmount > 0) {
          alert(`🎉 ${result.winAmount} CSPIN 당첨!`);
        }
      }, 2000);
    } catch (error) {
      console.error('Spin failed:', error);
      setIsSpinning(false);
      
      // Cleanup interval on error
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      alert('게임 실행에 실패했습니다. 다시 시도해주세요.');
    }
  }, [currentCredit, walletAddress, onSuccess]);

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🎰 슬롯머신</h2>
        <p className="text-gray-400">1회당 1 CSPIN</p>
        {lastWin !== null && lastWin > 0 && (
          <div className="mt-2 text-2xl font-bold text-yellow-400">
            🎉 {lastWin} CSPIN 당첨!
          </div>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
        {symbols.flat().map((symbol, i) => (
          <div
            key={i}
            className={`aspect-square backdrop-blur-sm bg-white/5 rounded-xl flex items-center justify-center text-6xl border border-white/10 transition-transform ${
              isSpinning ? 'animate-pulse' : ''
            }`}
          >
            {symbol}
          </div>
        ))}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || currentCredit < 1}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-xl font-bold text-xl text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? '회전 중...' : `게임 시작 (${currentCredit} CSPIN)`}
      </button>
    </div>
  );
}
