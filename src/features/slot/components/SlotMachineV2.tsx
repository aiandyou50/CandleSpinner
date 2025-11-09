/**
 * 슬롯머신 V2 메인 컴포넌트 - Material-UI 버전
 * Provably Fair 알고리즘 기반 공정한 게임
 * 반응형 디자인 적용
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { Reel } from './Reel';
import { BettingControl } from './BettingControl';
import { DoubleUpModal } from './DoubleUpModal';
import { JackpotVideo } from './JackpotVideo';
import { spinSlot } from '../api/slot';
import { useLanguage } from '@/hooks/useLanguage';
import { useResponsive } from '@/hooks/useResponsive';
import { SYMBOLS } from '../types';
import '../styles/slot-machine.css';

interface SlotMachineV2Props {
  walletAddress: string;
  currentCredit: number;
  onCreditChange: () => void;
}

export function SlotMachineV2({
  walletAddress,
  currentCredit,
  onCreditChange,
}: SlotMachineV2Props) {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();
  
  // 베팅 상태
  const [betAmount, setBetAmount] = useState(10);

  // 게임 상태
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['⭐', '🪐', '☄️'],
    ['🚀', '👽', '💎'],
    ['👑', '⭐', '🪐'],
  ]);

  // 결과 상태
  const [winAmount, setWinAmount] = useState(0);
  const [isJackpot, setIsJackpot] = useState(false);
  const [centerSymbols, setCenterSymbols] = useState<string[]>([]);
  const [reelPayouts, setReelPayouts] = useState<number[]>([]);

  // 모달 상태
  const [showDoubleUp, setShowDoubleUp] = useState(false);
  const [showJackpot, setShowJackpot] = useState(false);
  const [gameId, setGameId] = useState('');

  // 애니메이션 상태
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // 스핀 핸들러
  const handleSpin = async () => {
    if (currentCredit < betAmount) {
      alert(t.errors.insufficientBalance);
      return;
    }

    setIsSpinning(true);
    setWinAmount(0);
    setIsJackpot(false);
    setShowWinAnimation(false);

    try {
      // 클라이언트 시드 생성
      const clientSeed = crypto.randomUUID();

      // 스핀 애니메이션 중 랜덤 심볼 표시
      const spinInterval = setInterval(() => {
        setReelResults([
          [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
          ],
          [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
          ],
          [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!,
          ],
        ]);
      }, 100);

      // API 호출
      const result = await spinSlot(walletAddress, betAmount, clientSeed);

      // 애니메이션 완료 대기 (2초)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 애니메이션 중지
      clearInterval(spinInterval);

      // 결과 표시
      setReelResults(result.result || []);
      setWinAmount(result.winAmount || 0);
      setIsJackpot(result.isJackpot || false);
      setCenterSymbols(result.centerSymbols || []);
      setReelPayouts(result.reelPayouts || []);
      setGameId(result.gameId || '');

      // 크레딧 새로고침
      onCreditChange();

      // 당첨 애니메이션
      if ((result.winAmount || 0) > 0) {
        setShowWinAnimation(true);
      }

      // 잭팟 처리
      if (result.isJackpot) {
        setShowJackpot(true);
      } else if ((result.winAmount || 0) > 0) {
        // 더블업 팝업 (3초 후)
        setTimeout(() => {
          setShowDoubleUp(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Spin failed:', error);
      alert(error instanceof Error ? error.message : t.errors.generic);
    } finally {
      setIsSpinning(false);
    }
  };

  // 잭팟 비디오 완료 후
  const handleJackpotComplete = () => {
    setShowJackpot(false);
    // 잭팟은 더블업 불가
  };

  return (
    <Card
      elevation={8}
      sx={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 12, 41, 0.95))',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 215, 0, 0.2)',
        borderRadius: 4,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* 헤더 */}
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span>🎰</span>
            <span>{t.game.title || 'Slot Machine'}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t.game.subtitle || 'Provably Fair Gaming'}
          </Typography>
        </Stack>

        {/* 릴 디스플레이 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: { xs: 1, sm: 2, md: 3 },
            maxWidth: { xs: '320px', sm: '450px', md: '600px' },
            margin: '0 auto',
            mb: 4,
          }}
        >
          {reelResults.map((reel, index) => (
            <Reel
              key={index}
              symbols={reel}
              isSpinning={isSpinning}
              delay={index * 0.2}
              isWinning={showWinAnimation}
            />
          ))}
        </Box>

      {/* 당첨 라인 표시 */}
      {showWinAnimation && !isSpinning && (
        <motion.div
          className="win-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* 당첨금 표시 */}
      {winAmount > 0 && !isSpinning && (
        <motion.div
          className="win-display"
          initial={{ scale: 0, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="win-icon">{isJackpot ? '🎰' : '🎉'}</div>
          <div className="win-text">
            {isJackpot ? t.results.jackpot : t.results.win}
          </div>
          <div className="win-amount">{winAmount} CSPIN</div>
        </motion.div>
      )}

      {/* 릴별 당첨금 표시 */}
      {reelPayouts.length > 0 && !isSpinning && winAmount > 0 && (
        <div className="reel-payouts">
          {reelPayouts.map((payout, index) => (
            <div key={index} className="reel-payout">
              <span className="reel-label">Reel {index + 1}</span>
              <span className="payout-amount">+{payout}</span>
            </div>
          ))}
        </div>
      )}

      {/* 베팅 컨트롤 */}
      <BettingControl
        betAmount={betAmount}
        onBetChange={setBetAmount}
        maxCredit={currentCredit}
        onSpin={handleSpin}
        isSpinning={isSpinning}
      />

      {/* 더블업 모달 */}
      {showDoubleUp && (
        <DoubleUpModal
          currentWin={winAmount}
          gameId={gameId}
          walletAddress={walletAddress}
          onClose={() => setShowDoubleUp(false)}
          onSuccess={onCreditChange}
        />
      )}

      {/* 잭팟 비디오 */}
      {showJackpot && <JackpotVideo onComplete={handleJackpotComplete} />}
      </CardContent>
    </Card>
  );
}
