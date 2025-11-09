/**
 * 베팅 컨트롤 컴포넌트 - Material-UI 버전
 * ButtonGroup + Slider + Stack을 사용한 반응형 베팅 컨트롤
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Stack,
  Typography,
  Slider,
  Alert,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CasinoIcon from '@mui/icons-material/Casino';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useLanguage } from '@/hooks/useLanguage';
import { useResponsive } from '@/hooks/useResponsive';

interface BettingControlProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  maxCredit: number;
  onSpin: () => void;
  isSpinning: boolean;
}

// 커스텀 슬라이더 스타일링
const GoldSlider = styled(Slider)(({ theme }) => ({
  color: '#FFD700',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#FFD700',
    border: '3px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(255, 215, 0, 0.16)',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#FFD700',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

export function BettingControl({
  betAmount,
  onBetChange,
  maxCredit,
  onSpin,
  isSpinning,
}: BettingControlProps) {
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [localBet, setLocalBet] = useState(betAmount);

  useEffect(() => {
    setLocalBet(betAmount);
  }, [betAmount]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
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
  const quickBetOptions = [100, 500, 1000];

  return (
    <Stack spacing={3}>
      {/* 베팅 금액 표시 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {t.betting.amount}
        </Typography>
        <Chip
          label={`${localBet} CSPIN`}
          color="primary"
          sx={{
            fontSize: { xs: '1rem', md: '1.25rem' },
            fontWeight: 700,
            px: 2,
            py: 3,
          }}
        />
      </Box>

      {/* 슬라이더 */}
      <Box sx={{ px: 1 }}>
        <GoldSlider
          value={localBet}
          onChange={handleSliderChange}
          min={10}
          max={1000}
          step={10}
          disabled={isSpinning}
          valueLabelDisplay="auto"
          marks={[
            { value: 10, label: '10' },
            { value: 500, label: '500' },
            { value: 1000, label: '1000' },
          ]}
        />
      </Box>

      {/* 퀵 베팅 버튼 */}
      <ButtonGroup
        fullWidth
        orientation={isMobile ? 'vertical' : 'horizontal'}
        variant="outlined"
        size={isMobile ? 'medium' : 'large'}
        sx={{
          '& .MuiButton-root': {
            borderColor: 'rgba(255, 215, 0, 0.5)',
            color: '#FFD700',
            '&:hover': {
              borderColor: '#FFD700',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
            },
            '&.Mui-disabled': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
      >
        {quickBetOptions.map((amount) => (
          <Button
            key={amount}
            onClick={() => handleQuickBet(amount)}
            disabled={isSpinning || maxCredit < amount}
          >
            {amount}
          </Button>
        ))}
        <Button
          onClick={handleMaxBet}
          disabled={isSpinning || maxCredit < 10}
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
            fontWeight: 700,
          }}
        >
          {t.buttons.max || 'MAX'}
        </Button>
      </ButtonGroup>

      {/* 스핀 버튼 */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={onSpin}
        disabled={!canSpin}
        startIcon={
          isSpinning ? <HourglassEmptyIcon /> : <CasinoIcon />
        }
        sx={{
          py: { xs: 2, md: 3 },
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 700,
          background: canSpin
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : undefined,
          color: canSpin ? '#000' : undefined,
          boxShadow: canSpin
            ? '0 8px 24px rgba(255, 215, 0, 0.4)'
            : undefined,
          '&:hover': canSpin
            ? {
                background: 'linear-gradient(135deg, #FFE44D 0%, #FFB833 100%)',
                boxShadow: '0 12px 32px rgba(255, 215, 0, 0.6)',
                transform: 'translateY(-2px)',
              }
            : undefined,
          transition: 'all 0.3s ease',
        }}
      >
        {isSpinning ? (t.buttons.spinning || '회전 중...') : (t.buttons.spin || '스핀 시작')}
      </Button>

      {/* 에러 메시지 */}
      {!canSpin && !isSpinning && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {maxCredit < betAmount
            ? (t.errors.insufficientBalance || '크레딧이 부족합니다')
            : betAmount < 10
            ? (t.betting.betRange || '최소 베팅 금액은 10 CSPIN입니다')
            : ''}
        </Alert>
      )}
    </Stack>
  );
}

