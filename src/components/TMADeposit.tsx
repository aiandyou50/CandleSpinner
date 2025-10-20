import React, { useEffect, useState } from 'react';
import { WebApp } from '@twa-dev/sdk';

interface TMADepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

export const TMADeposit: React.FC<TMADepositProps> = ({ onDepositSuccess, onBack }) => {
  const [isReady, setIsReady] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // TMA 초기화
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      WebApp.ready();
      WebApp.expand();

      // 테마 설정
      WebApp.setHeaderColor('#1a1a2e');
      WebApp.setBackgroundColor('#16213e');

      // 버튼 설정
      WebApp.MainButton.setText('입금하기');
      WebApp.MainButton.show();
      WebApp.MainButton.disable();

      // 메인 버튼 클릭 핸들러
      WebApp.MainButton.onClick(() => handleDeposit());

      // 뒤로가기 버튼
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => onBack?.());

      setIsReady(true);
    }

    return () => {
      // 클린업
      if (WebApp.MainButton) {
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick();
      }
      if (WebApp.BackButton) {
        WebApp.BackButton.hide();
        WebApp.BackButton.offClick();
      }
    };
  }, []);

  // 입금 금액 변경 시 버튼 상태 업데이트
  useEffect(() => {
    if (WebApp.MainButton) {
      const amount = parseFloat(depositAmount);
      if (amount > 0 && amount <= 10000) {
        WebApp.MainButton.enable();
      } else {
        WebApp.MainButton.disable();
      }
    }
  }, [depositAmount]);

  const handleDeposit = async () => {
    if (!WebApp.initDataUnsafe?.user) {
      WebApp.showAlert('텔레그램 사용자 정보를 가져올 수 없습니다.');
      return;
    }

    setIsProcessing(true);
    WebApp.MainButton.setText('처리 중...');
    WebApp.MainButton.disable();

    try {
      // TMA를 통한 CSPIN 입금 로직
      // 실제로는 TON Connect 또는 TMA 결제 API 사용
      const amount = parseFloat(depositAmount);

      // 모킹: 실제 입금 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      WebApp.showAlert(`${amount} CSPIN 입금이 완료되었습니다!`);
      onDepositSuccess?.(amount);

    } catch (error) {
      console.error('Deposit error:', error);
      WebApp.showAlert('입금 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      WebApp.MainButton.setText('입금하기');
      WebApp.MainButton.enable();
    }
  };

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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
              min="1"
              max="10000"
              disabled={isProcessing}
            />
            <p className="text-xs text-slate-400 mt-1">
              최소 1 CSPIN, 최대 10,000 CSPIN
            </p>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-300 mb-2">입금 정보</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">수량:</span>
                <span>{depositAmount} CSPIN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">수수료:</span>
                <span>무료</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">총액:</span>
                <span className="text-blue-400">{depositAmount} CSPIN</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-slate-400">
            <p>텔레그램 미니 앱을 통한 안전한 입금</p>
            <p className="mt-1">TON 네트워크에서 처리됩니다</p>
          </div>
        </div>

        {/* TMA MainButton은 자동으로 하단에 표시됨 */}
      </div>
    </div>
  );
};