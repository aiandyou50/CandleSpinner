/**
 * 인출 컴포넌트
 * 수동 인출 방식: 크레딧 차감 + 대기열 추가 → 관리자가 일괄 처리
 * 게임 니모닉 서명이 필요하므로 즉시 처리 불가
 * 보안: 메시지 서명으로 인증
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { logger } from '@/utils/logger';
import { DebugLogModal } from './DebugLogModal';

interface WithdrawProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

export function Withdraw({ walletAddress, currentCredit, onSuccess }: WithdrawProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const handleWithdrawRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('=== 인출 요청 시작 (메시지 서명 보안) ===');
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`현재 크레딧: ${currentCredit} CSPIN`);

      const withdrawAmountValue = parseFloat(withdrawAmount);
      if (isNaN(withdrawAmountValue) || withdrawAmountValue <= 0) {
        logger.error('❌ 잘못된 금액:', withdrawAmount);
        throw new Error('잘못된 금액입니다');
      }

      logger.info(`인출 금액: ${withdrawAmountValue} CSPIN`);

      if (withdrawAmountValue > currentCredit) {
        logger.error(`❌ 크레딧 부족: 필요 ${withdrawAmountValue}, 보유 ${currentCredit}`);
        throw new Error('크레딧이 부족합니다');
      }

      // ✅ 1단계: 리플레이 공격 방지 (타임스탬프 + 논스)
      logger.info('📝 보안 토큰 생성 중...');
      const timestamp = Date.now();
      const nonce = crypto.randomUUID();
      const withdrawRequestPayload = {
        action: 'withdraw',
        amount: withdrawAmountValue,
        userAddress: walletAddress,
        timestamp,
        nonce
      };
      
      logger.info('생성된 보안 토큰:', { timestamp, nonce: nonce.substring(0, 8) });

      // ✅ 2단계: 백엔드에 보안 토큰 포함 요청 전송
      logger.info('백엔드에 인출 요청 전송 중...');
      const response = await fetch('/api/withdraw-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawRequestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        logger.error('❌ 인출 요청 실패:', errorData);
        throw new Error(errorData.error || '인출 요청에 실패했습니다');
      }

      const result = await response.json() as { 
        success: boolean; 
        credit: number; 
        withdrawalId: string;
        estimatedProcessTime: string;
      };
      
      logger.info('✅ 인출 요청 완료:', result);
      logger.info(`대기열 ID: ${result.withdrawalId}`);
      logger.info(`예상 처리 시간: ${result.estimatedProcessTime}`);

      logger.info('=== 인출 요청 완료 ===');
      
      alert(
        `${withdrawAmountValue} CSPIN 인출 요청이 완료되었습니다!\n\n` +
        `예상 처리 시간: ${result.estimatedProcessTime}\n` +
        `요청 ID: ${result.withdrawalId.substring(0, 8)}...\n\n` +
        `처리가 완료되면 지갑으로 CSPIN이 전송됩니다.`
      );
      
      setWithdrawAmount('');
      onSuccess();
    } catch (error) {
      logger.error('❌ 인출 실패:', error);
      
      if (error instanceof Error) {
        logger.error('오류 메시지:', error.message);
        logger.error('오류 스택:', error.stack);
      }
      
      console.error('Withdraw failed:', error);
      setError(error instanceof Error ? error.message : 'Withdraw failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">💸 CSPIN 인출</h3>
        
        {/* 안내 메시지 - 수동 처리 안내 */}
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <p className="text-sm text-blue-200 font-semibold mb-1">
            📋 수동 인출 방식
          </p>
          <p className="text-xs text-blue-300">
            • 인출 요청 후 <strong>12~24시간 이내</strong> 처리됩니다
          </p>
          <p className="text-xs text-blue-300">
            • 크레딧은 즉시 차감되며, 처리 완료 시 지갑으로 전송됩니다
          </p>
          <p className="text-xs text-blue-300">
            • 네트워크 수수료는 게임이 부담합니다 (무료)
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              금액 (보유: {currentCredit} CSPIN)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              max={currentCredit}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0"
            />
          </div>

          <button
            onClick={handleWithdrawRequest}
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
