/**
 * 슬롯머신 V2 메인 컴포넌트
 * Provably Fair 알고리즘 기반 공정한 게임
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Reel } from './Reel';
import { BettingControl } from './BettingControl';
import { DoubleUpModal } from './DoubleUpModal';
import { JackpotVideo } from './JackpotVideo';
import { spinSlot } from '../api/slot';
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
  const { t } = useTranslation();
  
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
      alert(t('errors.insufficientBalance'));
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
      alert(error instanceof Error ? error.message : t('errors.generic'));
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
    <div className="slot-machine-v2">
      {/* 헤더 */}
      <div className="slot-header">
        <h2 className="slot-title">
          <span className="slot-title-emoji">🎰</span>
          <span className="slot-title-text">{t('game.title')}</span>
        </h2>
        <p className="slot-subtitle">{t('game.subtitle')}</p>
      </div>

      {/* 릴 디스플레이 */}
      <div className="reels-container">
        {reelResults.map((reel, index) => (
          <Reel
            key={index}
            symbols={reel}
            isSpinning={isSpinning}
            delay={index * 0.2}
            isWinning={showWinAnimation}
          />
        ))}
      </div>

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
            {isJackpot ? t('results.jackpot') : t('results.win')}
          </div>
          <div className="win-amount">{winAmount} CSPIN</div>
        </motion.div>
      )}

      {/* 릴별 당첨금 표시 */}
      {reelPayouts.length > 0 && !isSpinning && winAmount > 0 && (
        <div className="reel-payouts">
          {reelPayouts.map((payout, index) => (
            <div key={index} className="reel-payout">
              <span className="reel-label">{t('results.reelPayout', { number: index + 1 })}</span>
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
    </div>
  );
}
