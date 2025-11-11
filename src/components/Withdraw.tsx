/**
 * 인출 컴포넌트
 * 수동 인출 방식: 크레딧 차감 + 대기열 추가 → 관리자가 일괄 처리
 * 게임 니모닉 서명이 필요하므로 즉시 처리 불가
 * 보안: 메시지 서명으로 인증
 */

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/ton';
import { logger } from '@/utils/logger';
import { useLanguage } from '@/hooks/useLanguage';
import { GAME_WALLET_ADDRESS } from '@/constants';
import { DebugLogModal } from './DebugLogModal';

interface WithdrawProps {
  walletAddress: string;
  currentCredit: number;
  onSuccess: () => void;
}

const WITHDRAW_FEE_TON = '0.2';
const WITHDRAW_FEE_VALIDITY_MS = 10 * 60 * 1000;

export function Withdraw({ walletAddress, currentCredit, onSuccess }: WithdrawProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [feeTxBoc, setFeeTxBoc] = useState<string | null>(null);
  const [feeTxTimestamp, setFeeTxTimestamp] = useState<number | null>(null);

  const feeStillValid = feeTxTimestamp !== null && Date.now() - feeTxTimestamp < WITHDRAW_FEE_VALIDITY_MS;

  const ensureFeePayment = async (): Promise<{ boc: string; timestamp: number }> => {
    setStatusMessage(null);

    const now = Date.now();

    if (feeTxBoc && feeTxTimestamp && now - feeTxTimestamp < WITHDRAW_FEE_VALIDITY_MS) {
      logger.info('Reusing previously submitted withdrawal fee transaction.');
      setStatusMessage(t.withdraw.feeAlreadyPaid);
      return { boc: feeTxBoc, timestamp: feeTxTimestamp };
    }

    logger.info('Initiating 0.2 TON fee transfer for withdrawal request.');

    let operatorAddress: string;
    try {
      operatorAddress = Address.parse(GAME_WALLET_ADDRESS).toString({
        urlSafe: true,
        bounceable: false,
      });
    } catch (parseError) {
      logger.error('Invalid operator wallet address configuration:', parseError);
      throw new Error(t.withdraw.error);
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: operatorAddress,
          amount: toNano(WITHDRAW_FEE_TON).toString(),
        },
      ],
    };

    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      const boc = result.boc;
      if (!boc) {
        throw new Error('Missing BOC result');
      }
      const timestamp = Date.now();

      setFeeTxBoc(boc);
      setFeeTxTimestamp(timestamp);
      setStatusMessage(t.withdraw.feeSuccess);

      logger.info('Fee transfer completed. BOC length:', boc.length);

      return { boc, timestamp };
    } catch (feeError) {
      setStatusMessage(null);
      logger.error('Fee transfer failed:', feeError);

      if (feeError instanceof Error) {
        const message = feeError.message.toLowerCase();
        if (message.includes('reject') || message.includes('cancel')) {
          throw new Error(t.withdraw.feeRejected);
        }
        throw new Error(`${t.withdraw.feeFailed}\n${feeError.message}`);
      }

      throw new Error(t.withdraw.feeFailed);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStatusMessage(null);

      logger.info('=== 인출 요청 시작 (메시지 서명 보안) ===');
      logger.info(`사용자 지갑: ${walletAddress}`);
      logger.info(`현재 크레딧: ${currentCredit} CSPIN`);

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        logger.error('❌ 잘못된 금액:', amount);
        throw new Error(t.errors.invalidAmount);
      }

      logger.info(`인출 금액: ${withdrawAmount} CSPIN`);

      if (withdrawAmount > currentCredit) {
        logger.error(`❌ 크레딧 부족: 필요 ${withdrawAmount}, 보유 ${currentCredit}`);
        throw new Error(t.errors.insufficientBalance);
      }

      const feeProof = await ensureFeePayment();
      logger.info('Fee transaction captured for withdrawal request.', {
        feeTimestamp: feeProof.timestamp,
      });

      // ✅ 1단계: 리플레이 공격 방지 (타임스탬프 + 논스)
      logger.info('📝 보안 토큰 생성 중...');
      const timestamp = Date.now();
      const nonce = crypto.randomUUID();
      const withdrawRequest = {
        action: 'withdraw',
        amount: withdrawAmount,
        userAddress: walletAddress,
        timestamp,
        nonce,
        feeTxBoc: feeProof.boc,
        feeTonAmount: Number(WITHDRAW_FEE_TON),
        feePaidAt: feeProof.timestamp,
      };
      
      logger.info('생성된 보안 토큰:', { timestamp, nonce: nonce.substring(0, 8) });

      // ✅ 2단계: 백엔드에 보안 토큰 포함 요청 전송
      logger.info('백엔드에 인출 요청 전송 중...');
      const response = await fetch('/api/withdraw-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawRequest),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        logger.error('❌ 인출 요청 실패:', errorData);
        throw new Error(errorData.error || t.withdraw.error);
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
      
      const successMsg = `✅ ${t.withdraw.success}\n\n` +
        `ID: ${result.withdrawalId.substring(0, 8)}...\n` +
        `${result.estimatedProcessTime}`;
      alert(successMsg);
      
      setAmount('');
      setFeeTxBoc(null);
      setFeeTxTimestamp(null);
      setStatusMessage(null);
      onSuccess();
    } catch (err) {
      logger.error('❌ 인출 실패:', err);
      
      if (err instanceof Error) {
        logger.error('오류 메시지:', err.message);
        logger.error('오류 스택:', err.stack);
      }
      
      console.error('Withdraw failed:', err);
      setStatusMessage(null);
      setError(err instanceof Error ? err.message : t.withdraw.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">💸 {t.withdraw.title}</h3>
        
        {/* 안내 메시지 - 수동 처리 안내 */}
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <p className="text-sm text-blue-200 font-semibold mb-1">
            📋 {t.withdraw.description}
          </p>
          <p className="text-xs text-blue-100 leading-relaxed mt-2">
            💠 {t.withdraw.feeNotice}
          </p>
          <p className="text-xs text-blue-100 mt-2 font-mono break-words">
            🔗 {t.withdraw.feeAddressLabel}: {GAME_WALLET_ADDRESS}
          </p>
          {feeStillValid && (
            <p className="text-xs text-emerald-200 mt-2">
              ✅ {t.withdraw.feeAlreadyPaid}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              {t.withdraw.available}: {currentCredit} CSPIN
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
            {isLoading ? t.withdraw.processing : t.buttons.withdraw}
          </button>

          {statusMessage && (
            <div className="text-emerald-300 text-sm text-center">
              {statusMessage}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          {/* 디버그 로그 버튼 */}
          <button
            onClick={() => setShowDebugLog(true)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm transition"
          >
            🐛 {t.buttons.debugLog}
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
