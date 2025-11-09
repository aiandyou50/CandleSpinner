/**
 * 더블업 모달 컴포넌트
 * 빨강/파랑 버튼 선택 + 결과 애니메이션
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doubleUp } from '../api/slot';
import { useLanguage } from '@/hooks/useLanguage';

interface DoubleUpModalProps {
  currentWin: number;
  gameId: string;
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalState = 'pending' | 'processing' | 'success' | 'fail';

export function DoubleUpModal({
  currentWin,
  gameId,
  walletAddress,
  onClose,
  onSuccess,
}: DoubleUpModalProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<ModalState>('pending');
  const [selectedColor, setSelectedColor] = useState<'red' | 'blue' | null>(null);
  const [winningColor, setWinningColor] = useState<'red' | 'blue' | null>(null);
  const [finalAmount, setFinalAmount] = useState(0);

  const handleChoice = async (choice: 'red' | 'blue') => {
    setSelectedColor(choice);
    setState('processing');

    try {
      const response = await doubleUp(walletAddress, choice, currentWin, gameId);

      setWinningColor(response.winningColor || null);
      setFinalAmount(response.finalAmount || 0);
      setState(response.result === 'win' ? 'success' : 'fail');

      onSuccess();

      // 3초 후 자동 닫힘
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('DoubleUp failed:', error);
      alert(error instanceof Error ? error.message : t.errors.generic);
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && state === 'pending') {
            handleSkip();
          }
        }}
      >
        <motion.div
          className="doubleup-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {state === 'pending' && (
            <>
              <h2 className="modal-title">🎲 {t.doubleup.title}</h2>
              <p className="modal-description">
                {t.doubleup.description}
              </p>

              <div className="current-win">
                <span className="win-label">{t.doubleup.currentWin}</span>
                <span className="win-amount">{currentWin} CSPIN</span>
              </div>

              <div className="choice-buttons">
                <button
                  className="choice-btn red"
                  onClick={() => handleChoice('red')}
                  disabled={state !== 'pending'}
                >
                  <span className="btn-icon">❤️</span>
                  <span className="btn-text">{t.doubleup.red}</span>
                </button>

                <button
                  className="choice-btn blue"
                  onClick={() => handleChoice('blue')}
                  disabled={state !== 'pending'}
                >
                  <span className="btn-icon">💙</span>
                  <span className="btn-text">{t.doubleup.blue}</span>
                </button>
              </div>

              <button className="skip-button" onClick={handleSkip}>
                {t.buttons.decline}
              </button>
            </>
          )}

          {state === 'processing' && (
            <div className="processing">
              <motion.div
                className="spinner-large"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                🎰
              </motion.div>
              <p>{t.deposit.processing}</p>
            </div>
          )}

          {state === 'success' && (
            <motion.div
              className="result success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <div className="result-icon">🎉</div>
              <h2 className="result-title">{t.doubleup.success}</h2>
              <p className="result-description">
                {t.results.congratulations}
              </p>
              <div className="result-colors">
                <span className={`color-badge ${selectedColor}`}>
                  {selectedColor === 'red' ? '❤️' : '💙'}
                </span>
                <span className="vs">vs</span>
                <span className={`color-badge ${winningColor}`}>
                  {winningColor === 'red' ? '❤️' : '💙'}
                </span>
              </div>
              <div className="final-amount success">
                {finalAmount} CSPIN
              </div>
            </motion.div>
          )}

          {state === 'fail' && (
            <motion.div
              className="result fail"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <div className="result-icon">😢</div>
              <h2 className="result-title">{t.doubleup.failure}</h2>
              <p className="result-description">
                {t.results.betterLuck}
              </p>
              <div className="result-colors">
                <span className={`color-badge ${selectedColor}`}>
                  {selectedColor === 'red' ? '❤️' : '💙'}
                </span>
                <span className="vs">vs</span>
                <span className={`color-badge ${winningColor}`}>
                  {winningColor === 'red' ? '❤️' : '💙'}
                </span>
              </div>
              <div className="final-amount fail">0 CSPIN</div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
