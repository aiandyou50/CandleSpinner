/**
 * 새로운 슬롯머신 릴 컴포넌트
 * Google 스타일 디자인 적용
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SYMBOL_RARITY } from '../types';

interface ReelProps {
  symbols: string[];
  isSpinning: boolean;
  isWinning?: boolean;
  reelIndex: number;
  payout?: number;
}

export function ReelNew({ symbols, isSpinning, isWinning, reelIndex, payout }: ReelProps) {
  const [displaySymbols, setDisplaySymbols] = useState(symbols);

  useEffect(() => {
    setDisplaySymbols(symbols);
  }, [symbols]);

  // 중앙 심볼 (당첨 라인)
  const centerSymbol = symbols[1];
  const rarity = centerSymbol ? SYMBOL_RARITY[centerSymbol as keyof typeof SYMBOL_RARITY] : 'common';

  return (
    <div className="relative flex flex-col items-center">
      {/* 릴 컨테이너 */}
      <div className="relative w-[120px] h-[240px] md:w-[150px] md:h-[300px] overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-b from-gray-900/50 to-gray-800/50 shadow-xl">
        {/* 스핀 중 배경 효과 */}
        {isSpinning && (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-blue-500/20 animate-pulse" />
        )}

        {/* 당첨 라인 표시 */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[80px] md:h-[100px] border-y-2 border-yellow-400/50 pointer-events-none z-10" />

        {/* 심볼들 */}
        <div className={`flex flex-col h-full ${isSpinning ? 'spinning' : ''}`}>
          {displaySymbols.map((symbol, index) => {
            const isCenter = index === 1;
            const symbolRarity = SYMBOL_RARITY[symbol as keyof typeof SYMBOL_RARITY];
            
            return (
              <motion.div
                key={`${reelIndex}-${index}-${symbol}`}
                className={`flex-1 flex items-center justify-center text-6xl md:text-7xl ${
                  isCenter && isWinning ? 'win-pulse' : ''
                } ${isCenter ? `rarity-${symbolRarity}` : ''}`}
                initial={isSpinning ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: isSpinning ? 0 : reelIndex * 0.2,
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 100,
                }}
              >
                {symbol}
              </motion.div>
            );
          })}
        </div>

        {/* 당첨금 표시 (당첨 시) */}
        {isWinning && payout && payout > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-2 left-0 right-0 mx-auto w-fit px-3 py-1 bg-yellow-500 text-black font-bold rounded-full text-sm shadow-glow-gold"
          >
            +{payout} CSPIN
          </motion.div>
        )}
      </div>

      {/* 희귀도 표시 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reelIndex * 0.2 + 0.5 }}
        className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
          isWinning ? `rarity-${rarity}` : 'text-gray-500'
        }`}
      >
        {rarity}
      </motion.div>
    </div>
  );
}
