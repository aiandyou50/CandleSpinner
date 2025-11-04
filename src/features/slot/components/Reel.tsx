/**
 * 릴 컴포넌트
 * Framer Motion을 사용한 스핀 애니메이션
 */

import { motion } from 'framer-motion';
import { SYMBOL_RARITY } from '../types';

interface ReelProps {
  symbols: string[];        // [상단, 중앙, 하단]
  isSpinning: boolean;
  delay: number;            // 릴별 지연 시간 (0, 0.2, 0.4)
  isWinning?: boolean;      // 당첨 여부
}

export function Reel({ symbols, isSpinning, delay, isWinning = false }: ReelProps) {
  return (
    <motion.div
      className="reel"
      animate={
        isSpinning
          ? {
              y: [-1000, 0],
            }
          : {}
      }
      transition={{
        duration: 2,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // ease-out cubic
      }}
    >
      {symbols.map((symbol, index) => {
        const isCenterLine = index === 1;
        const rarity = SYMBOL_RARITY[symbol as keyof typeof SYMBOL_RARITY] || 'common';
        
        return (
          <div
            key={index}
            className={`
              symbol
              ${rarity}
              ${isCenterLine ? 'center-line' : ''}
              ${isCenterLine && isWinning && !isSpinning ? 'winning' : ''}
            `}
          >
            {symbol}
          </div>
        );
      })}
    </motion.div>
  );
}
