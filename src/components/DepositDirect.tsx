import React, { useState, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from '@ton/core';
import WebApp from '@twa-dev/sdk';

interface DepositDirectProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

// A방식: TonConnect 클라이언트 서명 방식
// 사용자가 자신의 지갑에서 CSPIN을 게임 지갑으로 직접 전송
export const DepositDirect: React.FC<DepositDirectProps> = ({ onDepositSuccess, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
  const CSPIN_TOKEN_ADDRESS = 'EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV';
  const CSPIN_JETTON_WALLET = 'EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs'; // 게임 지갑의 CSPIN 지갑

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
    const msg = '⏳ 트랜잭션 처리 중...';
    setMessage(msg);
    if (isTMA) WebApp.MainButton.setText(msg);

    try {
      // Jetton transfer 메시지 생성
      const jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(amount.toString())) // amount
        .storeAddress(Address.parse(GAME_WALLET_ADDRESS)) // destination
        .storeAddress(Address.parse(wallet.account.address)) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell();

      // TonConnect으로 트랜잭션 생성
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: CSPIN_JETTON_WALLET, // 사용자의 CSPIN 지갑으로 transfer 메시지 전송
            amount: toNano('0.05').toString(), // 트랜잭션 수수료
            payload: jettonTransferBody.toBoc().toString('base64')
          }
        ]
      };

      // TonConnect 서명 및 전송
      const result = await tonConnectUI.sendTransaction(transaction);
      
      // 트랜잭션 해시 추출
      const txHash = result.boc;

      // 백엔드에 입금 완료 알림 (KV 크레딧 업데이트)
      const response = await fetch('/api/deposit-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.account.address,
          depositAmount: amount,
          txHash: txHash,
          method: 'direct'
        })
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
        error?: string;
        newCredit?: number;
      };

      if (data.success) {
        const successMsg = `✅ 입금 성공!\n${amount} CSPIN이 게임 계정에 추가되었습니다.\n트랜잭션: ${txHash.slice(0, 20)}...`;
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
  }, [depositAmount, wallet, tonConnectUI, isTMA, onDepositSuccess]);

  if (isTMA) {
    // TMA 모드
    return (
      <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-blue-400">💰 CSPIN 입금</h1>
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
            ℹ️ 지갑에서 서명 후 CSPIN을 게임 지갑으로 전송합니다.
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

        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
          💰 CSPIN 입금 (방식 A)
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
            {isProcessing ? '⏳ 처리 중...' : '🔑 지갑에서 서명 & 입금'}
          </button>

          {/* 설명 */}
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-sm text-blue-200">
            <p><strong>방식 A: TonConnect 직접 서명</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
              <li>지갑에서 CSPIN을 직접 게임 지갑으로 전송</li>
              <li>백엔드 비용 없음, 완전히 탈중앙화</li>
              <li>트랜잭션 수수료: ~0.05 TON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositDirect;
