/**
 * 더블업 모달 컴포넌트 (새 디자인)
 * 빨간색/파란색 버튼 선택
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface DoubleUpModalNewProps {
  isOpen: boolean;
  currentWin: number;
  onChoice: (choice: 'red' | 'blue') => Promise<{ success: boolean; finalAmount: number }>;
  onClose: () => void;
}

export function DoubleUpModalNew({
  isOpen,
  currentWin,
  onChoice,
  onClose,
}: DoubleUpModalNewProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; finalAmount: number } | null>(null);

  const handleChoice = async (choice: 'red' | 'blue') => {
    if (isProcessing) return;

    setIsProcessing(true);
    const outcome = await onChoice(choice);
    setResult(outcome);

    // 3초 후 자동 닫힘
    setTimeout(() => {
      setIsProcessing(false);
      setResult(null);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000]"
            onClick={!isProcessing && !result ? onClose : undefined}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[2001] p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-purple-500/30">
              {/* 결과 표시 없을 때 */}
              {!result && (
                <>
                  {/* 헤더 */}
                  <div className="text-center mb-6">
                    <motion.h2
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-heading text-white mb-2"
                    >
                      {t('doubleup.title')}
                    </motion.h2>
                    <p className="text-gray-400">
                      {t('doubleup.description')}
                    </p>
                  </div>

                  {/* 현재 당첨금 */}
                  <div className="mb-8 text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      {t('doubleup.currentWin')}
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-5xl font-display font-bold text-gradient"
                    >
                      {currentWin}
                    </motion.div>
                    <div className="text-xl text-gray-300 mt-1">CSPIN</div>
                  </div>

                  {/* 선택 버튼들 */}
                  <div className="mb-6">
                    <p className="text-center text-white mb-4 font-semibold">
                      {t('doubleup.chooseColor')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* 빨간색 버튼 */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChoice('red')}
                        disabled={isProcessing}
                        className="relative py-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-xl shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          ❤️ {t('doubleup.red')}
                        </span>
                      </motion.button>

                      {/* 파란색 버튼 */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChoice('blue')}
                        disabled={isProcessing}
                        className="relative py-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          💙 {t('doubleup.blue')}
                        </span>
                      </motion.button>
                    </div>
                  </div>

                  {/* 확률 표시 */}
                  <div className="text-center text-sm text-gray-400">
                    {t('doubleup.chance')}
                  </div>

                  {/* 취소 버튼 */}
                  {!isProcessing && (
                    <button
                      onClick={onClose}
                      className="mt-4 w-full py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                      {t('buttons.decline')}
                    </button>
                  )}
                </>
              )}

              {/* 결과 표시 */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  {result.success ? (
                    <>
                      {/* 성공 */}
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        className="text-8xl mb-4"
                      >
                        🎉
                      </motion.div>
                      <h3 className="text-3xl font-bold text-green-400 mb-4">
                        {t('doubleup.success')}
                      </h3>
                      <div className="text-6xl font-display font-bold text-gradient mb-2">
                        {result.finalAmount}
                      </div>
                      <div className="text-xl text-gray-300">CSPIN</div>
                    </>
                  ) : (
                    <>
                      {/* 실패 */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        className="text-8xl mb-4"
                      >
                        😢
                      </motion.div>
                      <h3 className="text-3xl font-bold text-red-400 mb-4">
                        {t('doubleup.failure')}
                      </h3>
                      <div className="text-6xl font-display font-bold text-gray-500 mb-2">
                        0
                      </div>
                      <div className="text-xl text-gray-400">CSPIN</div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
