import React, { useState, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

interface DepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
const NETWORK_FEE_TON = 0.03;

type DepositMethod = 'tonconnect' | 'rpc' | 'select';

/**
 * v2.1.0 A/B 테스트 버전
 * - TonConnect: 사용자 지갑에서 직접 서명 (권장)
 * - RPC: 백엔드에서 직접 트랜잭션 (테스트용)
 */
export const Deposit: React.FC<DepositProps> = ({ onDepositSuccess, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('select');

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  // ==================== TonConnect 입금 ====================
  const handleDepositTonConnect = useCallback(async () => {
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
    setMessage('⏳ TonConnect: 지갑에서 트랜잭션을 확인해주세요...');

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: GAME_WALLET_ADDRESS,
            amount: (BigInt(amount) * BigInt(1000000000)).toString(),
            payload: undefined
          }
        ]
      };

      const result = await tonConnectUI.sendTransaction(transaction as any);

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

      const data = await response.json();
      if (data.success) {
        const successMsg = `✅ TonConnect 입금 완료!\n${amount} CSPIN 추가됨`;
        setMessage(successMsg);
        if (isTMA) WebApp.showAlert(successMsg);
        onDepositSuccess?.(amount);
        setTimeout(() => {
          setDepositAmount('100');
          setDepositMethod('select');
        }, 1500);
      } else {
        throw new Error(data.error || '백엔드 오류');
      }
    } catch (error) {
      const errorMsg = `❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      setMessage(errorMsg);
      if (isTMA) WebApp.showAlert(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [depositAmount, wallet, tonConnectUI, isTMA, onDepositSuccess]);

  // ==================== RPC 직접 입금 ====================
  const handleDepositRPC = useCallback(async () => {
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
    setMessage('⏳ RPC: 백엔드에서 트랜잭션을 처리 중입니다...');

    try {
      const response = await fetch('/api/deposit-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.account.address,
          depositAmount: amount
        })
      });

      const data = await response.json();
      if (data.success) {
        const successMsg = `✅ RPC 입금 완료!\n${amount} CSPIN 추가됨`;
        setMessage(successMsg);
        if (isTMA) WebApp.showAlert(successMsg);
        onDepositSuccess?.(amount);
        setTimeout(() => {
          setDepositAmount('100');
          setDepositMethod('select');
        }, 1500);
      } else {
        throw new Error(data.error || '백엔드 오류');
      }
    } catch (error) {
      const errorMsg = `❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      setMessage(errorMsg);
      if (isTMA) WebApp.showAlert(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [depositAmount, wallet, isTMA, onDepositSuccess]);

  // ==================== 방식 선택 화면 (웹 모드) ====================
  if (!isTMA && depositMethod === 'select') {
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
            💰 입금 방식 선택
          </h1>

          <div className="space-y-4">
            {/* TonConnect 버튼 */}
            <button
              onClick={() => setDepositMethod('tonconnect')}
              disabled={isProcessing}
              className="w-full p-6 bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 rounded-lg border-2 border-blue-500 transition disabled:opacity-50"
            >
              <p className="text-xl font-bold mb-2">🔑 TonConnect 입금</p>
              <ul className="text-sm text-slate-300 space-y-1 text-left">
                <li>✅ 지갑에서 직접 서명 (안전)</li>
                <li>✅ 권장 방식</li>
                <li>💰 수수료: {NETWORK_FEE_TON} TON</li>
              </ul>
            </button>

            {/* RPC 버튼 (A/B 테스트용) */}
            <button
              onClick={() => setDepositMethod('rpc')}
              disabled={isProcessing}
              className="w-full p-6 bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 rounded-lg border-2 border-purple-500 transition disabled:opacity-50"
            >
              <p className="text-xl font-bold mb-2">⚡ RPC 직접 입금 (테스트)</p>
              <ul className="text-sm text-slate-300 space-y-1 text-left">
                <li>⚠️ 백엔드 직접 처리</li>
                <li>⚠️ A/B 테스트용</li>
                <li>💰 수수료: {NETWORK_FEE_TON} TON</li>
              </ul>
            </button>

            {message && (
              <div className="p-4 bg-slate-700 rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== TonConnect 입금 화면 ====================
  if (depositMethod === 'tonconnect') {
    return (
      <div className={isTMA ? 'p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen' : 'min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6'}>
        <div className={!isTMA ? 'max-w-md mx-auto' : undefined}>
          {!isTMA && onBack && (
            <button
              onClick={() => setDepositMethod('select')}
              className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              ← 방식 선택으로 돌아가기
            </button>
          )}

          <h1 className={isTMA ? 'text-2xl font-bold mb-6 text-blue-400' : 'text-3xl font-bold text-center mb-8 text-blue-400'}>
            🔑 TonConnect 입금
          </h1>

          <div className={isTMA ? 'bg-slate-800 rounded-lg p-4 space-y-4' : 'bg-slate-800 rounded-lg p-6 shadow-lg space-y-4'}>
            <div>
              <label className="block text-sm font-medium mb-2">입금액 (CSPIN)</label>
              <div className={isTMA ? 'w-full' : 'flex gap-2'}>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className={`${isTMA ? 'w-full' : 'flex-1'} px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white`}
                  placeholder="100"
                  min="1"
                  disabled={isProcessing}
                />
                {!isTMA && (
                  <button
                    onClick={() => setDepositAmount('100')}
                    disabled={isProcessing}
                    className="px-4 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition disabled:opacity-50"
                  >
                    100
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className="p-4 bg-slate-700 rounded-lg text-sm whitespace-pre-line">
                {message}
              </div>
            )}

            <button
              onClick={handleDepositTonConnect}
              disabled={isProcessing || !wallet?.account?.address}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isProcessing || !wallet?.account?.address
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isProcessing ? '⏳ 처리 중...' : '✅ TonConnect로 입금'}
            </button>

            {!isTMA && (
              <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-sm text-blue-200">
                <p><strong>TonConnect 방식</strong></p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                  <li>지갑에서 직접 CSPIN 전송</li>
                  <li>완전 탈중앙화 (백엔드 개입 없음)</li>
                  <li>💰 네트워크 수수료: {NETWORK_FEE_TON} TON</li>
                  <li>✅ 가장 안전한 방식</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RPC 입금 화면 ====================
  if (depositMethod === 'rpc') {
    return (
      <div className={isTMA ? 'p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen' : 'min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6'}>
        <div className={!isTMA ? 'max-w-md mx-auto' : undefined}>
          {!isTMA && onBack && (
            <button
              onClick={() => setDepositMethod('select')}
              className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              ← 방식 선택으로 돌아가기
            </button>
          )}

          <h1 className={isTMA ? 'text-2xl font-bold mb-6 text-purple-400' : 'text-3xl font-bold text-center mb-8 text-purple-400'}>
            ⚡ RPC 입금 (테스트)
          </h1>

          <div className={isTMA ? 'bg-slate-800 rounded-lg p-4 space-y-4' : 'bg-slate-800 rounded-lg p-6 shadow-lg space-y-4'}>
            <div>
              <label className="block text-sm font-medium mb-2">입금액 (CSPIN)</label>
              <div className={isTMA ? 'w-full' : 'flex gap-2'}>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className={`${isTMA ? 'w-full' : 'flex-1'} px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white`}
                  placeholder="100"
                  min="1"
                  disabled={isProcessing}
                />
                {!isTMA && (
                  <button
                    onClick={() => setDepositAmount('100')}
                    disabled={isProcessing}
                    className="px-4 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition disabled:opacity-50"
                  >
                    100
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className="p-4 bg-slate-700 rounded-lg text-sm whitespace-pre-line">
                {message}
              </div>
            )}

            <button
              onClick={handleDepositRPC}
              disabled={isProcessing || !wallet?.account?.address}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isProcessing || !wallet?.account?.address
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              {isProcessing ? '⏳ 처리 중...' : '⚡ RPC로 입금'}
            </button>

            {!isTMA && (
              <div className="p-4 bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg text-sm text-purple-200">
                <p><strong>⚠️ RPC 방식 (테스트용)</strong></p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                  <li>백엔드에서 직접 트랜잭션 생성</li>
                  <li>A/B 테스트 목적</li>
                  <li>💰 네트워크 수수료: {NETWORK_FEE_TON} TON</li>
                  <li>⚠️ 테스트 완료 후 TonConnect 권장</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Deposit;
