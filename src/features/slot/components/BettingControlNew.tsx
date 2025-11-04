/**
 * 베팅 컨트롤 컴포넌트 (새 디자인)
 * 슬라이더 + 퀵 베팅 버튼
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface BettingControlNewProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  currentCredit: number;
  minBet?: number;
  maxBet?: number;
}

export function BettingControlNew({
  betAmount,
  onBetChange,
  currentCredit,
  minBet = 10,
  maxBet = 1000,
}: BettingControlNewProps) {
  const { t } = useTranslation();

  const quickBets = [100, 500, 1000];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onBetChange(Math.min(value, currentCredit, maxBet));
  };

  const handleQuickBet = (amount: number) => {
    onBetChange(Math.min(amount, currentCredit, maxBet));
  };

  const handleMaxBet = () => {
    onBetChange(Math.min(currentCredit, maxBet));
  };

  // 슬라이더 퍼센트 계산
  const sliderPercent = ((betAmount - minBet) / (maxBet - minBet)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-6"
    >
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-xl font-heading text-white mb-2">
          {t('betting.title')}
        </h3>
        <p className="text-sm text-gray-400">
          {t('betting.betRange', { min: minBet, max: maxBet })}
        </p>
      </div>

      {/* 현재 베팅액 표시 */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">{t('betting.amount')}</div>
        <div className="text-5xl font-display text-gradient font-bold">
          {betAmount}
        </div>
        <div className="text-lg text-gray-300 mt-1">CSPIN</div>
      </div>

      {/* 슬라이더 */}
      <div className="relative">
        <input
          type="range"
          min={minBet}
          max={Math.min(maxBet, currentCredit)}
          step={10}
          value={betAmount}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              #4A00E0 0%, 
              #8E2DE2 ${sliderPercent / 2}%, 
              #10B981 ${sliderPercent}%, 
              #4B5563 ${sliderPercent}%, 
              #4B5563 100%)`,
          }}
        />
        <style>
          {`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4A00E0, #FFD700);
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            input[type="range"]::-moz-range-thumb {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4A00E0, #FFD700);
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
          `}
        </style>
      </div>

      {/* 퀵 베팅 버튼들 */}
      <div className="flex gap-3">
        {quickBets.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickBet(amount)}
            disabled={currentCredit < amount}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            {amount}
          </button>
        ))}
        <button
          onClick={handleMaxBet}
          disabled={currentCredit < minBet}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          {t('buttons.max')}
        </button>
      </div>

      {/* 잔액 경고 */}
      {betAmount > currentCredit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-400 text-sm font-semibold"
        >
          {t('betting.insufficientFunds')}
        </motion.div>
      )}
    </motion.div>
  );
}
