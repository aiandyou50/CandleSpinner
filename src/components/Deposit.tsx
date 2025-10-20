import React, { useState, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

interface DepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
const CSPIN_TOKEN_MASTER = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';

/**
 * 통합 입금 컴포넌트 (단순화)
 * - TonConnect를 사용한 간단한 토큰 전송
 * - 백엔드와 최소 상호작용
 * - MVP 테스트용 단순 구조
 */
export const Deposit: React.FC<DepositProps> = ({ onDepositSuccess, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  const handleDeposit = useCallback(async () => {
    if (!wallet?.account?.address) {
      const msg = '❌ 지갑이 연결되지 않았습니다.';
      setMessage(msg);
      if (isTMA) WebApp.showAlert(msg);
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      const msg = '❌ 올바른 입금액을 입력하세요.';
      setMessage(msg);
      if (isTMA) WebApp.showAlert(msg);
      return;
    }

    setIsProcessing(true);
    const processingMsg = '⏳ 지갑에서 트랜잭션을 확인해주세요...';
    setMessage(processingMsg);
    if (isTMA) WebApp.MainButton.setText(processingMsg);

    try {
      // 간단한 트랜잭션: TON 전송 (CSPIN 지갑으로)
      // 실제 CSPIN 토큰 전송은 게임 지갑에서 처리
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: GAME_WALLET_ADDRESS,
            amount: (BigInt(amount) * BigInt(1000000000)).toString(), // nano TON
            payload: undefined
          }
        ]
      };

      // TonConnect로 트랜잭션 전송
      const result = await tonConnectUI.sendTransaction(transaction as any);

      // 백엔드에 입금 기록
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.account.address,
          depositAmount: amount,
          txHash: result.boc || result,
          method: 'tonconnect'
        })
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
        error?: string;
        newCredit?: number;
      };

      if (data.success) {
        const successMsg = `✅ 입금 완료!\n${amount} CSPIN 추가됨`;
        setMessage(successMsg);
        if (isTMA) WebApp.showAlert(successMsg);
        onDepositSuccess?.(amount);
        setDepositAmount('100');
      } else {
        const errorMsg = `❌ 오류: ${data.error || '알 수 없는 오류'}`;
        setMessage(errorMsg);
        if (isTMA) WebApp.showAlert(errorMsg);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      const errorMsg = `❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      setMessage(errorMsg);
      if (isTMA) WebApp.showAlert(errorMsg);
    } finally {
      setIsProcessing(false);
      if (isTMA) {
        WebApp.MainButton.setText('입금하기');
        WebApp.MainButton.enable();
      }
    }
  }, [depositAmount, wallet, tonConnectUI, isTMA, onDepositSuccess]);

  // TMA 모드
  if (isTMA) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-blue-400">💰 CSPIN 입금</h1>
        
        <div className="bg-slate-800 rounded-lg p-4 space-y-4">
          {/* 입금액 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">입금액 (CSPIN)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="100"
              min="1"
              disabled={isProcessing}
            />
          </div>

          {/* 메시지 */}
          {message && (
            <div className="p-3 bg-slate-700 rounded text-sm whitespace-pre-line">
              {message}
            </div>
          )}

          {/* 버튼 */}
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !wallet?.account?.address}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isProcessing || !wallet?.account?.address
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isProcessing ? '⏳ 처리 중...' : '입금하기'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            ℹ️ 지갑에서 CSPIN을 게임 계정으로 입금합니다
          </p>
        </div>
      </div>
    );
  }

  // 웹 브라우저 모드
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            ← 뒤로가기
          </button>
        )}

        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
          💰 CSPIN 입금
        </h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg space-y-4">
          {/* 입금액 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              입금할 CSPIN 수량
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min="1"
                disabled={isProcessing}
              />
              <button
                onClick={() => setDepositAmount('100')}
                disabled={isProcessing}
                className="px-4 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition disabled:opacity-50"
              >
                100
              </button>
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className="p-4 bg-slate-700 rounded-lg text-sm whitespace-pre-line">
              {message}
            </div>
          )}

          {/* 입금 버튼 */}
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !wallet?.account?.address}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isProcessing || !wallet?.account?.address
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isProcessing ? '⏳ 처리 중...' : '🔑 지갑에서 입금'}
          </button>

          {/* 설명 */}
          <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-sm text-blue-200">
            <p><strong>TonConnect 직접 입금</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
              <li>지갑에서 직접 CSPIN 전송</li>
              <li>완전 탈중앙화</li>
              <li>수수료: 약 0.05 TON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
