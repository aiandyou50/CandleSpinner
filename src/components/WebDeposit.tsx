import React, { useState, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

interface WebDepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

export const WebDeposit: React.FC<WebDepositProps> = ({ onDepositSuccess, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handleDeposit = useCallback(async () => {
    if (!wallet?.account?.address) {
      setMessage('❌ 지갑이 연결되지 않았습니다. 위의 지갑 연결 버튼을 클릭하세요.');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setMessage('❌ 올바른 입금액을 입력하세요.');
      return;
    }

    setIsProcessing(true);
    setMessage('처리 중...');

    try {
      const walletAddress = wallet.account.address;

      // 백엔드 API 호출
      const response = await fetch('/api/initiate-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          depositAmount: amount
        })
      });

      const data = await response.json() as { 
        success: boolean; 
        message?: string; 
        error?: string;
        newCredit?: number;
        txHash?: string;
      };

      if (data.success) {
        setMessage(`✅ 입금 성공! ${amount} CSPIN이 계정에 추가되었습니다.\n트랜잭션: ${data.txHash?.slice(0, 20)}...`);
        onDepositSuccess?.(amount);
        setDepositAmount('100');
      } else {
        setMessage(`❌ 입금 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setMessage(`❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [depositAmount, wallet, onDepositSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
        >
          ← 뒤로가기
        </button>

        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
          🎮 CSPIN 입금
        </h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          {/* 지갑 정보 */}
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-300 mb-2">연결된 지갑:</p>
            {wallet?.account?.address ? (
              <p className="text-lg font-mono text-green-400 break-all">
                {wallet.account.address.slice(0, 20)}...{wallet.account.address.slice(-10)}
              </p>
            ) : (
              <p className="text-lg text-red-400">연결되지 않음</p>
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
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <button
                onClick={() => setDepositAmount('1000')}
                disabled={isProcessing}
                className="px-4 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition disabled:opacity-50"
              >
                1K
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
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isProcessing ? '⏳ 처리 중...' : '💰 입금하기'}
          </button>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg text-sm text-amber-200">
            <p>⚠️ <strong>주의사항:</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>최소 1 CSPIN부터 입금 가능합니다</li>
              <li>입금 후 게임 크레딧에 즉시 반영됩니다</li>
              <li>트랜잭션 수수료는 자동으로 처리됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebDeposit;
