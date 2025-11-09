/**
 * 릴 컴포넌트 - Material-UI 버전
 * Framer Motion + MUI Card를 사용한 반응형 스핀 애니메이션
 */

import { motion } from 'framer-motion';
import { Card, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SYMBOL_RARITY } from '../types';

interface ReelProps {
  symbols: string[];        // [상단, 중앙, 하단]
  isSpinning: boolean;
  delay: number;            // 릴별 지연 시간 (0, 0.2, 0.4)
  isWinning?: boolean;      // 당첨 여부
}

// 심볼 카드 스타일링
const SymbolCard = styled(Card)(({ theme }) => ({
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
  }),
  
  // 반응형 폰트 크기
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '4rem',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '5rem',
  },
  
  // 중앙 라인 강조
  '&.center-line': {
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderWidth: '3px',
  },
  
  // 당첨 애니메이션
  '&.winning': {
    animation: 'winPulse 1s ease-in-out infinite',
    borderColor: '#FFD700',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
  },
  
  '@keyframes winPulse': {
    '0%, 100%': {
      transform: 'scale(1)',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
    },
    '50%': {
      transform: 'scale(1.05)',
      boxShadow: '0 0 50px rgba(255, 215, 0, 0.9)',
    },
  },
  
  // 레어리티별 스타일
  '&.legendary': {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  '&.rare': {
    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2))',
    borderColor: 'rgba(147, 51, 234, 0.5)',
  },
  '&.uncommon': {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
}));

export function Reel({ symbols, isSpinning, delay, isWinning = false }: ReelProps) {
  return (
    <Box
      component={motion.div}
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.5, sm: 1, md: 1.5 },
      }}
    >
      {symbols.map((symbol, index) => {
        const isCenterLine = index === 1;
        const rarity = SYMBOL_RARITY[symbol as keyof typeof SYMBOL_RARITY] || 'common';
        
        return (
          <SymbolCard
            key={index}
            className={`
              ${rarity}
              ${isCenterLine ? 'center-line' : ''}
              ${isCenterLine && isWinning && !isSpinning ? 'winning' : ''}
            `}
            elevation={isSpinning ? 8 : isCenterLine ? 4 : 2}
          >
            {symbol}
          </SymbolCard>
        );
      })}
    </Box>
  );
}

