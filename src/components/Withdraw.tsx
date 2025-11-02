/**
 * 인출 컴포넌트
 */

import { useState } from 'react';
import { withdraw as withdrawApi } from '@/api/client';
import { logger } from '@/utils/logger';
import { DebugLogModal } from './DebugLogModal';

interface WithdrawProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

export function Withdraw({ walletAddress, currentCredit, onSuccess }: WithdrawProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugLog, setShowDebugLog] = useState(false);

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('=== 인출 시작 ===');
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`현재 크레딧: ${currentCredit} CSPIN`);

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        logger.error('❌ 잘못된 금액:', amount);
        throw new Error('Invalid amount');
      }

      logger.info(`인출 금액: ${withdrawAmount} CSPIN`);

      if (withdrawAmount > currentCredit) {
        logger.error(`❌ 크레딧 부족: 필요 ${withdrawAmount}, 보유 ${currentCredit}`);
        throw new Error('Insufficient credit');
      }

      logger.info('📤 백엔드 API 호출 시작...');
      logger.debug('요청 페이로드:', { walletAddress, amount: withdrawAmount });

      const result = await withdrawApi({ walletAddress, amount: withdrawAmount });

      logger.info('✅ 백엔드 응답 수신:', result);
      logger.info(`트랜잭션 해시: ${result.txHash}`);
      logger.info('=== 인출 완료 ===');

      alert(`Successfully withdrew ${withdrawAmount} CSPIN!\nTx: ${result.txHash}`);
      setAmount('');
      onSuccess();
    } catch (err) {
      logger.error('❌ 인출 실패:', err);
      
      if (err instanceof Error) {
        logger.error('오류 메시지:', err.message);
        logger.error('오류 스택:', err.stack);
      }
      
      console.error('Withdraw failed:', err);
      setError(err instanceof Error ? err.message : 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">💸 CSPIN 인출</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              금액 (보유: {currentCredit} CSPIN)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={currentCredit}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0"
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isLoading || currentCredit === 0}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl font-bold text-white hover:shadow-lg transition disabled:opacity-50"
          >
            {isLoading ? '처리 중...' : '인출하기'}
          </button>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          {/* 디버그 로그 버튼 */}
          <button
            onClick={() => setShowDebugLog(true)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm transition"
          >
            🐛 디버그 로그 보기
          </button>
        </div>
      </div>

      {/* 디버그 로그 모달 */}
      <DebugLogModal 
        isOpen={showDebugLog}
        onClose={() => setShowDebugLog(false)}
      />
    </>
  );
}
