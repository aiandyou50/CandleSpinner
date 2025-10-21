// src/components/Deposit.tsx - 입금 UI 완전 재작성
import React from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell } from 'ton-core';
import WebApp from '@twa-dev/sdk';
import { useDepositState } from '../hooks/useDepositState';
import { useToast } from '../hooks/useToast';

interface DepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
const CSPIN_JETTON_WALLET = 'EQBX5_CVq_7UQR0_8Q-3o-Jg4FfT7R8N9K_2J-5q_e4S7P1J'; // CSPIN Jetton Wallet Address (Game Wallet의 CSPIN 잔액 계좌)

// Jetton Transfer Payload 구성
function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32) // Jetton transfer opcode
    .storeUint(0, 64) // query_id
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(responseTo)
    .storeBit(0) // custom_payload: none
    .storeCoins(BigInt(0)) // forward_ton_amount
    .storeBit(0) // forward_payload: none
    .endCell();
  return cell.toBoc().toString('base64');
}

const Deposit: React.FC<DepositProps> = ({ onDepositSuccess, onBack }) => {
  // 상태 관리: depositState로 통합 (기존 useState 제거)
  const depositState = useDepositState('select');
  const { toast, showToast } = useToast();

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const isTMA = typeof window !== 'undefined' && window.Telegram?.WebApp;

  // ==================== TonConnect 입금 ====================
  const handleDepositTonConnect = async () => {
    if (!wallet?.account?.address) {
      showToast('❌ 지갑이 연결되지 않았습니다. TonConnect 버튼을 클릭해주세요.', 'error');
      if (isTMA) WebApp.showAlert('지갑을 연결해주세요.');
      return;
    }

    const validation = depositState.validateAmount();
    if (!validation.valid) {
      showToast(`❌ ${validation.error}`, 'error');
      if (isTMA) WebApp.showAlert(validation.error || '올바른 금액을 입력해주세요.');
      return;
    }

    const amount = parseFloat(depositState.depositAmount);
    depositState.setLoading(true);
    showToast('⏳ TonConnect: 지갑에서 트랜잭션을 확인해주세요...', 'info');

    try {
      // Jetton Transfer Payload 구성
      const amountInNano = BigInt(amount) * BigInt(1000000000);
      const destinationAddress = Address.parse(GAME_WALLET_ADDRESS);
      const responseAddress = Address.parse(wallet.account.address);
      
      const payload = buildJettonTransferPayload(amountInNano, destinationAddress, responseAddress);

      // CSPIN Jetton Wallet 주소 파싱 (정식 형식)
      const jettonWalletAddress = Address.parse(CSPIN_JETTON_WALLET).toString();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: jettonWalletAddress,  // ← 정식 Address 형식
            amount: '200000000', // 0.2 TON for fees
            payload: payload
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

      showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
      depositState.setAmount('100');
      
      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`);

      // 2초 후 자동 뒤로 가기
      setTimeout(() => onBack?.(), 2000);
    } catch (error) {
      console.error('TonConnect 입금 실패:', error);
      depositState.handleError(error, { method: 'tonconnect' });
      if (isTMA) WebApp.showAlert('입금에 실패했습니다.');
    } finally {
      depositState.setLoading(false);
    }
  };

  // ==================== RPC 입금 (테스트용) ====================
  const handleDepositRPC = async () => {
    const validation = depositState.validateAmount();
    if (!validation.valid) {
      showToast(`❌ ${validation.error}`, 'error');
      return;
    }

    const amount = parseFloat(depositState.depositAmount);
    depositState.setLoading(true);
    showToast('⏳ RPC: 백엔드에서 처리 중...', 'info');

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

      showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
      depositState.setAmount('100');
      
      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`);

      // 2초 후 자동 뒤로 가기
      setTimeout(() => onBack?.(), 2000);
    } catch (error) {
      console.error('RPC 입금 실패:', error);
      depositState.handleError(error, { method: 'rpc' });
      if (isTMA) WebApp.showAlert('입금에 실패했습니다.');
    } finally {
      depositState.setLoading(false);
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
      {depositState.depositMethod === 'select' && (
        <div>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
            입금 방식을 선택해주세요
          </p>

          {/* TonConnect 입금 */}
          <button
            onClick={() => depositState.setMethod('tonconnect')}
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
            onClick={() => depositState.setMethod('rpc')}
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
      {(depositState.depositMethod === 'tonconnect' || depositState.depositMethod === 'rpc') && (
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', opacity: 0.8 }}>입금액 (CSPIN)</label>
            <input
              type="number"
              value={depositState.depositAmount}
              onChange={(e) => depositState.setAmount(e.target.value)}
              disabled={depositState.isProcessing}
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
                opacity: depositState.isProcessing ? 0.5 : 1
              }}
              placeholder="100"
            />
          </div>

          {/* 빠른 선택 */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            {[50, 100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => depositState.setAmount(amount.toString())}
                disabled={depositState.isProcessing}
                style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: depositState.isProcessing ? 'not-allowed' : 'pointer',
                  opacity: depositState.isProcessing ? 0.5 : 1
                }}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* 토스트 메시지 표시 */}
          {toast && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '6px',
              background: toast.type === 'success'
                ? 'rgba(34, 197, 94, 0.2)'
                : toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
              color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
              fontSize: '12px'
            }}>
              {toast.message}
            </div>
          )}

          {/* 입금 버튼 */}
          <button
            onClick={depositState.depositMethod === 'tonconnect' ? handleDepositTonConnect : handleDepositRPC}
            disabled={depositState.isProcessing || !depositState.depositAmount}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: 'none',
              borderRadius: '8px',
              background: depositState.isProcessing
                ? 'rgba(107, 114, 128, 0.5)'
                : depositState.depositMethod === 'tonconnect'
                ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                : 'linear-gradient(135deg, #ec4899, #f43f5e)',
              color: 'white',
              fontWeight: 'bold',
              cursor: depositState.isProcessing ? 'not-allowed' : 'pointer',
              opacity: depositState.isProcessing ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!depositState.isProcessing && depositState.depositAmount) {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {depositState.isProcessing ? '처리 중...' : `${depositState.depositAmount} CSPIN 입금`}
          </button>

          {/* 뒤로 가기 */}
          <button
            onClick={() => depositState.setMethod('select')}
            disabled={depositState.isProcessing}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              cursor: depositState.isProcessing ? 'not-allowed' : 'pointer',
              opacity: depositState.isProcessing ? 0.5 : 1,
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
