import React, { useState, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

interface DepositAutoProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

// B방식: Ankr RPC 자동 입금
// 백엔드에서 Ankr RPC를 통해 자동으로 입금 트랜잭션 생성 및 전송
export const DepositAuto: React.FC<DepositAutoProps> = ({ onDepositSuccess, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const wallet = useTonWallet();
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
    const msg = '⏳ 백엔드에서 입금 처리 중...';
    setMessage(msg);
    if (isTMA) WebApp.MainButton.setText(msg);

    try {
      // 백엔드 API 호출 (Ankr RPC 통합)
      const response = await fetch('/api/deposit-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.account.address,
          depositAmount: amount
        })
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
        error?: string;
        txHash?: string;
        newCredit?: number;
      };

      if (data.success) {
        const successMsg = `✅ 입금 성공!\n${amount} CSPIN이 게임 계정에 추가되었습니다.\n트랜잭션: ${data.txHash || '확인중...'}`;
        setMessage(successMsg);
        if (isTMA) WebApp.showAlert(successMsg);
        onDepositSuccess?.(amount);
        setDepositAmount('100');
      } else {
        const errorMsg = `❌ 입금 실패: ${data.error || '알 수 없는 오류'}`;
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
  }, [depositAmount, wallet, isTMA, onDepositSuccess]);

  if (isTMA) {
    // TMA 모드
    return (
      <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-green-400">💰 CSPIN 입금 (자동)</h1>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">입금액 (CSPIN)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="금액 입력"
              min="1"
              disabled={isProcessing}
            />
          </div>
          {message && (
            <div className="mb-4 p-3 bg-slate-700 rounded text-sm whitespace-pre-line">
              {message}
            </div>
          )}
          <p className="text-xs text-slate-400">
            ℹ️ 백엔드가 자동으로 CSPIN을 게임 지갑으로 전송합니다.
          </p>
        </div>
      </div>
    );
  }

  // 웹 브라우저 모드
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
        >
          ← 뒤로가기
        </button>

        <h1 className="text-3xl font-bold text-center mb-8 text-green-400">
          💰 CSPIN 입금 (방식 B - 자동)
        </h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          {/* 지갑 정보 */}
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-300 mb-2">연결된 지갑:</p>
            {wallet?.account?.address ? (
              <p className="text-sm font-mono text-green-400 break-all">
                {wallet.account.address.slice(0, 20)}...{wallet.account.address.slice(-10)}
              </p>
            ) : (
              <p className="text-sm text-red-400">연결되지 않음</p>
            )}
          </div>

          {/* 입금액 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              입금할 CSPIN 수량
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="금액 입력"
                min="1"
                step="1"
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

          {/* 메시지 표시 */}
          {message && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg text-sm whitespace-pre-line">
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
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isProcessing ? '⏳ 처리 중...' : '🚀 자동 입금 시작'}
          </button>

          {/* 설명 */}
          <div className="mt-6 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-sm text-green-200">
            <p><strong>방식 B: 백엔드 자동 입금 (Ankr RPC)</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
              <li>금액 입력 후 백엔드에서 자동 처리</li>
              <li>사용자 서명 불필요, 즉시 입금</li>
              <li>백엔드 가스비: 약 0.1 TON (게임사 부담)</li>
              <li>Ankr RPC 무료 API 사용</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositAuto;
