/**
 * 슬롯머신 V3 - 완전 리팩토링 버전
 * Google 스타일 디자인 시스템 적용
 * 요구사항 명세서에 따른 완전 재구현
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ReelNew } from './ReelNew';
import { BettingControlNew } from './BettingControlNew';
import { DoubleUpModalNew } from './DoubleUpModalNew';
import { JackpotVideoNew } from './JackpotVideoNew';
import { spinSlot, doubleUp } from '../api/slot';
import { SYMBOLS, SYMBOL_PAYOUTS } from '../types';

interface SlotMachineV3Props {
  walletAddress: string;
  currentCredit: number;
  onCreditChange: () => void;
}

export function SlotMachineV3({
  walletAddress,
  currentCredit,
  onCreditChange,
}: SlotMachineV3Props) {
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
  const [winningReels, setWinningReels] = useState<boolean[]>([false, false, false]);

  // 모달 상태
  const [showDoubleUp, setShowDoubleUp] = useState(false);
  const [showJackpot, setShowJackpot] = useState(false);
  const [gameId, setGameId] = useState('');

  // 통계 (선택적)
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  // 스핀 핸들러
  const handleSpin = async () => {
    if (currentCredit < betAmount) {
      alert(t('errors.insufficientBalance'));
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinAmount(0);
    setIsJackpot(false);
    setWinningReels([false, false, false]);
    setReelPayouts([]);

    try {
      // 클라이언트 시드 생성 (Provably Fair)
      const clientSeed = crypto.randomUUID();

      // 스핀 애니메이션 - 랜덤 심볼 표시
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

      // 애니메이션 대기 (2초)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 애니메이션 중지
      clearInterval(spinInterval);

      if (result.success && result.result) {
        // 결과 설정
        setReelResults(result.result);
        setCenterSymbols(result.centerSymbols || []);
        setReelPayouts(result.reelPayouts || []);
        setWinAmount(result.winAmount || 0);
        setIsJackpot(result.isJackpot || false);
        setGameId(result.gameId || '');

        // 당첨된 릴 표시
        const winning = (result.reelPayouts || []).map((payout) => payout > 0);
        setWinningReels(winning);

        // 통계 업데이트
        setTotalSpins((prev) => prev + 1);
        if (result.winAmount && result.winAmount > 0) {
          setTotalWins((prev) => prev + 1);
        }

        // 잭팟 체크
        if (result.isJackpot) {
          // 잭팟 비디오 재생
          setTimeout(() => {
            setShowJackpot(true);
          }, 1000);
        } else if (result.winAmount && result.winAmount > 0) {
          // 일반 당첨 - 더블업 모달 표시
          setTimeout(() => {
            setShowDoubleUp(true);
          }, 1500);
        }

        // 크레딧 업데이트
        onCreditChange();
      } else {
        throw new Error(result.error || 'Spin failed');
      }
    } catch (error) {
      console.error('Spin error:', error);
      alert(t('errors.generic'));
    } finally {
      setIsSpinning(false);
    }
  };

  // 더블업 핸들러
  const handleDoubleUp = useCallback(
    async (choice: 'red' | 'blue') => {
      try {
        const result = await doubleUp(walletAddress, choice, winAmount, gameId);

        if (result.success) {
          onCreditChange();
          return {
            success: result.result === 'win',
            finalAmount: result.finalAmount || 0,
          };
        } else {
          throw new Error(result.error || 'Double up failed');
        }
      } catch (error) {
        console.error('Double up error:', error);
        return { success: false, finalAmount: 0 };
      }
    },
    [walletAddress, winAmount, gameId, onCreditChange]
  );

  // 잭팟 완료 핸들러
  const handleJackpotComplete = () => {
    setShowJackpot(false);
    onCreditChange();
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-5xl font-heading text-gradient mb-3">
          🎰 {t('game.slotTitle')}
        </h2>
        <p className="text-gray-400 text-lg">{t('game.subtitle')}</p>
      </motion.div>

      {/* 메인 게임 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 왼쪽: 베팅 컨트롤 */}
        <div className="lg:col-span-1">
          <BettingControlNew
            betAmount={betAmount}
            onBetChange={setBetAmount}
            currentCredit={currentCredit}
            minBet={10}
            maxBet={1000}
          />

          {/* 통계 (선택적) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 mt-6"
          >
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              {t('stats.title')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('stats.totalGames')}</span>
                <span className="text-white font-semibold">{totalSpins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('stats.totalWins')}</span>
                <span className="text-green-400 font-semibold">{totalWins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('stats.rtp')}</span>
                <span className="text-purple-400 font-semibold">95%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 중앙: 슬롯머신 릴들 */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 shadow-2xl"
          >
            {/* 릴 컨테이너 */}
            <div className="flex justify-center items-center gap-4 mb-8">
              {reelResults.map((reel, index) => (
                <ReelNew
                  key={index}
                  symbols={reel}
                  isSpinning={isSpinning}
                  isWinning={winningReels[index]}
                  reelIndex={index}
                  payout={reelPayouts[index]}
                />
              ))}
            </div>

            {/* 스핀 버튼 */}
            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                whileTap={{ scale: isSpinning ? 1 : 0.95 }}
                onClick={handleSpin}
                disabled={isSpinning || currentCredit < betAmount}
                className="btn-spin"
              >
                {isSpinning ? '⏳' : '🎰'}
              </motion.button>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  {isSpinning ? t('buttons.spinning') : t('buttons.spin')}
                </div>
                {!isSpinning && (
                  <div className="text-xs text-gray-500">
                    {betAmount} CSPIN per spin
                  </div>
                )}
              </div>
            </div>

            {/* 결과 표시 */}
            <AnimatePresence>
              {winAmount > 0 && !isSpinning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-center"
                >
                  <div
                    className={`text-4xl font-display font-bold ${
                      isJackpot ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {isJackpot && '🎉 '}
                    {t(isJackpot ? 'results.jackpot' : 'results.win')}
                  </div>
                  <div className="text-3xl text-white font-bold mt-2">
                    +{winAmount} CSPIN
                  </div>

                  {/* 개별 릴 당첨금 표시 */}
                  {reelPayouts.length > 0 && (
                    <div className="flex justify-center gap-4 mt-4">
                      {reelPayouts.map((payout, index) => (
                        <div
                          key={index}
                          className={`text-sm ${
                            payout > 0 ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          {t('results.reelPayout', { number: index + 1 })}: {payout}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 더블업 모달 */}
      <DoubleUpModalNew
        isOpen={showDoubleUp}
        currentWin={winAmount}
        onChoice={handleDoubleUp}
        onClose={() => setShowDoubleUp(false)}
      />

      {/* 잭팟 비디오 */}
      <JackpotVideoNew isPlaying={showJackpot} onComplete={handleJackpotComplete} />
    </div>
  );
}
