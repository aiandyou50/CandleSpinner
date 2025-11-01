/**
 * 슬롯 머신 컴포넌트
 */

import { useState } from 'react';
import { spin as spinApi } from '@/api/client';

interface SlotMachineProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

export function SlotMachine({ walletAddress, currentCredit, onSuccess }: SlotMachineProps) {
  const [symbols, setSymbols] = useState<string[][]>([
    ['🍒', '🍋', '🍊'],
    ['🍉', '⭐', '💎'],
    ['🍒', '🍋', '🍊'],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const handleSpin = async () => {
    if (currentCredit < 1) {
      alert('Insufficient credit! Please deposit CSPIN first.');
      return;
    }

    try {
      setIsSpinning(true);
      setLastWin(null);

      // 애니메이션 효과 (랜덤 심볼 표시)
      const interval = setInterval(() => {
        setSymbols(prevSymbols => 
          prevSymbols.map(row => 
            row.map(() => {
              const allSymbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
              return allSymbols[Math.floor(Math.random() * allSymbols.length)]!;
            })
          )
        );
      }, 100);

      // API 호출
      const result = await spinApi(walletAddress);

      // 애니메이션 멈추고 결과 표시
      setTimeout(() => {
        clearInterval(interval);
        setSymbols(result.result);
        setLastWin(result.winAmount);
        setIsSpinning(false);
        onSuccess();

        if (result.winAmount > 0) {
          alert(`🎉 You won ${result.winAmount} CSPIN!`);
        }
      }, 2000);
    } catch (error) {
      console.error('Spin failed:', error);
      setIsSpinning(false);
      alert('Spin failed. Please try again.');
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Slot Machine</h2>
        <p className="text-gray-400">Cost: 1 CSPIN per spin</p>
        {lastWin !== null && lastWin > 0 && (
          <div className="mt-2 text-2xl font-bold text-yellow-400">
            🎉 Won {lastWin} CSPIN!
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
        {isSpinning ? 'SPINNING...' : `SPIN (${currentCredit} CSPIN)`}
      </button>
    </div>
  );
}
