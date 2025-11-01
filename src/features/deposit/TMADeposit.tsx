import React, { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { toNano } from '@ton/ton';

interface TMADepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

export const TMADeposit: React.FC<TMADepositProps> = ({ onDepositSuccess, onBack }) => {
  const [isReady, setIsReady] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handleDeposit = useCallback(async () => {
    if (!wallet?.account?.address) {
      WebApp.showAlert('지갑이 연결되지 않았습니다.');
      return;
    }

    if (!WebApp.initDataUnsafe?.user) {
      WebApp.showAlert('텔레그램 사용자 정보를 가져올 수 없습니다.');
      return;
    }

    setIsProcessing(true);
    WebApp.MainButton.setText('처리 중...');
    WebApp.MainButton.disable();

    try {
      const amount = parseFloat(depositAmount);
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
        WebApp.showAlert(`✅ ${amount} CSPIN 입금이 완료되었습니다!\n트랜잭션: ${data.txHash?.slice(0, 16)}...`);
        onDepositSuccess?.(amount);
      } else {
        WebApp.showAlert(`❌ 입금 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      WebApp.showAlert(`❌ 입금 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsProcessing(false);
      WebApp.MainButton.setText('입금하기');
      WebApp.MainButton.enable();
    }
  }, [depositAmount, wallet, onDepositSuccess]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor('#1a1a2e');
        WebApp.setBackgroundColor('#16213e');
        WebApp.MainButton.setText('입금하기');
        WebApp.MainButton.show();
        WebApp.MainButton.disable();
        WebApp.MainButton.onClick(handleDeposit);
        WebApp.BackButton.show();
        WebApp.BackButton.onClick(handleBack);
        setIsReady(true);
      } catch (error) {
        console.error('TMA 초기화 오류:', error);
        setIsReady(false);
      }
    }
  }, [handleDeposit, handleBack]);

  useEffect(() => {
    if (isReady && depositAmount && parseFloat(depositAmount) > 0) {
      WebApp.MainButton.enable();
    } else {
      WebApp.MainButton.disable();
    }
  }, [depositAmount, isReady]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        try {
          if (WebApp.MainButton) {
            WebApp.MainButton.hide();
            WebApp.MainButton.offClick(handleDeposit);
          }
          if (WebApp.BackButton) {
            WebApp.BackButton.hide();
            WebApp.BackButton.offClick(handleBack);
          }
        } catch (error) {
          console.error('TMA 클린업 오류:', error);
        }
      }
    };
  }, [handleDeposit, handleBack]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>TMA 초기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-blue-400">
          CSPIN 입금 (TMA)
        </h1>
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              입금 금액 (CSPIN)
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="입금할 CSPIN 금액"
              min="1"
              step="1"
            />
          </div>
          <div className="mb-6">
            <div className="text-sm text-slate-400">
              <p>지갑 주소: {wallet?.account?.address || '연결되지 않음'}</p>
              <p>텔레그램 ID: {WebApp.initDataUnsafe?.user?.id || '알 수 없음'}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              TMA를 통해 안전하게 CSPIN을 입금하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
