// src/components/Deposit.tsx - 입금 UI 완전 재작성
import React, { useState } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

interface DepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

type DepositMethod = 'select' | 'tonconnect' | 'rpc';

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';

const Deposit: React.FC<DepositProps> = ({ onDepositSuccess, onBack }) => {
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('select');
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  // ==================== TonConnect 입금 ====================
  const handleDepositTonConnect = async () => {
    if (!wallet?.account?.address) {
      setMessageType('error');
      setMessage('❌ 지갑이 연결되지 않았습니다. TonConnect 버튼을 클릭해주세요.');
      if (isTMA) WebApp.showAlert('지갑을 연결해주세요.');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setMessageType('error');
      setMessage('❌ 올바른 입금액을 입력하세요.');
      if (isTMA) WebApp.showAlert('올바른 금액을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setMessageType('info');
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

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      setMessageType('success');
      setMessage(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`);
      setDepositAmount('100');
      
      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`);

      // 2초 후 자동 뒤로 가기
      setTimeout(() => onBack?.(), 2000);
    } catch (error) {
      console.error('TonConnect 입금 실패:', error);
      setMessageType('error');
      setMessage(`❌ 입금 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      if (isTMA) WebApp.showAlert('입금에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================== RPC 입금 (테스트용) ====================
  const handleDepositRPC = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setMessageType('error');
      setMessage('❌ 올바른 입금액을 입력하세요.');
      return;
    }

    setIsProcessing(true);
    setMessageType('info');
    setMessage('⏳ RPC: 백엔드에서 처리 중...');

    try {
      const response = await fetch('/api/deposit-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet?.account?.address || 'anonymous',
          depositAmount: amount,
          method: 'rpc'
        })
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();

      setMessageType('success');
      setMessage(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`);
      setDepositAmount('100');
      
      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`);

      // 2초 후 자동 뒤로 가기
      setTimeout(() => onBack?.(), 2000);
    } catch (error) {
      console.error('RPC 입금 실패:', error);
      setMessageType('error');
      setMessage(`❌ 입금 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      if (isTMA) WebApp.showAlert('입금에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* 제목 */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#10b981'
      }}>
        💰 CSPIN 입금
      </h2>

      {/* 입금 방식 선택 화면 */}
      {depositMethod === 'select' && (
        <div>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
            입금 방식을 선택해주세요
          </p>

          {/* TonConnect 입금 */}
          <button
            onClick={() => setDepositMethod('tonconnect')}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              marginBottom: '12px',
              border: '2px solid #60a5fa',
              borderRadius: '8px',
              background: 'rgba(96, 165, 250, 0.1)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
            }}
          >
            🔑 TonConnect 입금
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
              지갑에서 직접 서명하여 입금
            </p>
          </button>

          {/* RPC 입금 (테스트용) */}
          <button
            onClick={() => setDepositMethod('rpc')}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              marginBottom: '12px',
              border: '2px solid #ec4899',
              borderRadius: '8px',
              background: 'rgba(236, 72, 153, 0.1)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
            }}
          >
            ⚡ RPC 입금 (테스트)
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
              백엔드에서 자동 처리 (테스트용)
            </p>
          </button>

          {/* 뒤로 가기 */}
          <button
            onClick={onBack}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              marginTop: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            ← 뒤로 가기
          </button>
        </div>
      )}

      {/* 입금 상세 입력 화면 */}
      {(depositMethod === 'tonconnect' || depositMethod === 'rpc') && (
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', opacity: 0.8 }}>입금액 (CSPIN)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '8px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: isProcessing ? 0.5 : 1
              }}
              placeholder="100"
            />
          </div>

          {/* 빠른 선택 */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            {[50, 100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setDepositAmount(amount.toString())}
                disabled={isProcessing}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.5 : 1
                }}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* 메시지 표시 */}
          {message && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '6px',
              background: messageType === 'success'
                ? 'rgba(34, 197, 94, 0.2)'
                : messageType === 'error'
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${messageType === 'success' ? '#22c55e' : messageType === 'error' ? '#ef4444' : '#3b82f6'}`,
              color: messageType === 'success' ? '#22c55e' : messageType === 'error' ? '#ef4444' : '#3b82f6',
              fontSize: '12px'
            }}>
              {message}
            </div>
          )}

          {/* 입금 버튼 */}
          <button
            onClick={depositMethod === 'tonconnect' ? handleDepositTonConnect : handleDepositRPC}
            disabled={isProcessing || !depositAmount}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: 'none',
              borderRadius: '8px',
              background: isProcessing
                ? 'rgba(107, 114, 128, 0.5)'
                : depositMethod === 'tonconnect'
                ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                : 'linear-gradient(135deg, #ec4899, #f43f5e)',
              color: 'white',
              fontWeight: 'bold',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && depositAmount) {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isProcessing ? '처리 중...' : `${depositAmount} CSPIN 입금`}
          </button>

          {/* 뒤로 가기 */}
          <button
            onClick={() => setDepositMethod('select')}
            disabled={isProcessing}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            ← 방식 선택으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default Deposit;
