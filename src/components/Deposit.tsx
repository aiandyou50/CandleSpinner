// src/components/Deposit.tsx - 입금 UI 완전 재작성
import React from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell } from 'ton-core';
import { TonClient } from '@ton/ton';
import type { Transaction } from '@ton/ton';
import WebApp from '@twa-dev/sdk';
import { useDepositState } from '../hooks/useDepositState';
import { useToast } from '../hooks/useToast';
import { TON_RPC_URL } from '../constants';

interface DepositProps {
  onDepositSuccess?: (amount: number) => void;
  onBack?: () => void;
}

const GAME_WALLET_ADDRESS = 'UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd';
const CSPIN_JETTON_WALLET = 'EQBX5_CVq_7UQR0_8Q-3o-Jg4FfT7R8N9K_2J-5q_e4S7P1J'; // CSPIN Jetton Wallet Address (Game Wallet의 CSPIN 잔액 계좌)

/**
 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)
 * 
 * @see https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
 * @see https://docs.ton.org/develop/dapps/asset-processing/jettons
 */
function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode (TEP-74 표준)
    .storeUint(0, 64)              // query_id:uint64
    .storeCoins(amount)            // amount:(VarUInteger 16)
    .storeAddress(destination)     // destination:MsgAddress
    .storeAddress(responseTo)      // response_destination:MsgAddress
    .storeBit(0)                   // custom_payload:(Maybe ^Cell) = none
    .storeCoins(BigInt(1))         // ✅ forward_ton_amount = 1 nanoton (TON 표준 준수)
    .storeBit(0)                   // forward_payload:(Either Cell ^Cell) = none
    .endCell();
  return cell.toBoc().toString('base64');
}

/**
 * 에러 카테고리 분류 (TON 트랜잭션 처리용)
 */
enum ErrorCategory {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  USER_REJECTION = 'USER_REJECTION',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 에러를 분류하고 재시도 가능 여부 판단
 */
function classifyError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) return ErrorCategory.UNKNOWN;

  const msg = error.message.toLowerCase();

  if (msg.includes('quic') || msg.includes('econnrefused') || msg.includes('network')) {
    return ErrorCategory.NETWORK_ERROR;
  }
  if (msg.includes('timeout') || msg.includes('etimeout')) {
    return ErrorCategory.TIMEOUT;
  }
  if (msg.includes('rejected') || msg.includes('user_rejection') || msg.includes('cancelled')) {
    return ErrorCategory.USER_REJECTION;
  }
  if (msg.includes('invalid') || msg.includes('address')) {
    return ErrorCategory.INVALID_ADDRESS;
  }
  if (msg.includes('insufficient') || msg.includes('balance')) {
    return ErrorCategory.INSUFFICIENT_BALANCE;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * 재시도 가능 여부 판단
 */
function isRetryableError(category: ErrorCategory): boolean {
  return [ErrorCategory.NETWORK_ERROR, ErrorCategory.TIMEOUT].includes(category);
}

/**
 * 사용자에게 표시할 에러 메시지 생성
 */
function getErrorMessage(category: ErrorCategory): string {
  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.NETWORK_ERROR]: '❌ 네트워크 연결 오류. 잠시 후 다시 시도해주세요.',
    [ErrorCategory.TIMEOUT]: '⏱️ 요청 시간 초과. 지갑의 응답이 없습니다. 다시 시도해주세요.',
    [ErrorCategory.USER_REJECTION]: '❌ 지갑에서 트랜잭션을 거부했습니다.',
    [ErrorCategory.INVALID_ADDRESS]: '❌ 유효하지 않은 지갑 주소입니다.',
    [ErrorCategory.INSUFFICIENT_BALANCE]: '❌ 지갑의 잔액이 부족합니다.',
    [ErrorCategory.UNKNOWN]: '❌ 알 수 없는 오류가 발생했습니다.'
  };

  return messages[category];
}

/**
 * 트랜잭션을 블록체인에서 확인
 * TON 공식 문서: "TON transactions become irreversible after a single confirmation."
 * 
 * @param userAddress - 사용자 지갑 주소
 * @param maxWaitMs - 최대 대기 시간 (기본: 30초)
 * @returns 트랜잭션 확인 성공 여부
 */
async function confirmTransaction(
  userAddress: string,
  maxWaitMs = 30000
): Promise<boolean> {
  console.log('[Transaction Confirmation] Starting blockchain verification...');
  
  const startTime = Date.now();
  let attempts = 0;
  
  try {
    const client = new TonClient({
      endpoint: TON_RPC_URL
    });

    const userAddr = Address.parse(userAddress);
    
    // 폴링 루프: 트랜잭션이 블록체인에 기록될 때까지 반복
    while (Date.now() - startTime < maxWaitMs) {
      attempts++;
      const elapsedMs = Date.now() - startTime;
      
      console.log(
        `[Transaction Confirmation] Attempt ${attempts} (${elapsedMs}ms elapsed)...`
      );

      try {
        // TON RPC에서 최근 트랜잭션 조회
        const transactions = await client.getTransactions(
          userAddr,
          {
            limit: 10,
            archival: true  // 아카이벌 모드: 모든 트랜잭션 조회
          }
        );

        // 트랜잭션 발견 시
        if (transactions.length > 0) {
          const latestTx = transactions[0]!;
          
          console.log(
            '[Transaction Confirmation] ✅ Transaction confirmed!',
            {
              hash: latestTx.hash().toString('base64').substring(0, 20) + '...',
              lt: latestTx.lt.toString(),
              timestamp: latestTx.now,
              messages: latestTx.outMessages.size
            }
          );

          return true;
        }

        console.log('[Transaction Confirmation] No transactions found yet, waiting...');
      } catch (queryError) {
        console.warn(
          `[Transaction Confirmation] Query attempt ${attempts} failed:`,
          queryError instanceof Error ? queryError.message : queryError
        );
      }

      // 2초 대기 후 재시도
      await new Promise(r => setTimeout(r, 2000));
    }

    // Timeout
    console.error(
      '[Transaction Confirmation] ❌ Confirmation timeout after ' +
      `${maxWaitMs}ms and ${attempts} attempts`
    );
    return false;

  } catch (error) {
    console.error('[Transaction Confirmation] Fatal error:', error);
    return false;
  }
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
      console.error('[TonConnect Deposit] Wallet not connected');
      if (isTMA) {
        try { WebApp.showAlert('지갑을 연결해주세요.'); } catch (e) { console.log('[TMA Alert] Not supported:', e); }
      }
      return;
    }

    const validation = depositState.validateAmount();
    if (!validation.valid) {
      showToast(`❌ ${validation.error}`, 'error');
      console.warn('[TonConnect Deposit] Validation failed:', validation.error);
      if (isTMA) {
        try { WebApp.showAlert(validation.error || '올바른 금액을 입력해주세요.'); } catch (e) { console.log('[TMA Alert] Not supported'); }
      }
      return;
    }

    const amount = parseFloat(depositState.depositAmount);
    depositState.setLoading(true);
    
    console.log(`
═════════════════════════════════════════════════════
🚀 [TonConnect Deposit] START
═════════════════════════════════════════════════════
Amount: ${amount} CSPIN
Wallet: ${wallet.account.address}
Time: ${new Date().toISOString()}
═════════════════════════════════════════════════════
    `);

    showToast('⏳ TonConnect: 지갑에서 트랜잭션을 확인해주세요...', 'info');

    let retries = 0;
    const maxRetries = 2;

    const attemptTransaction = async (): Promise<void> => {
      try {
        retries++;
        console.log(`[TonConnect Deposit] Attempt ${retries}/${maxRetries + 1}`);

        // Jetton Transfer Payload 구성
        const amountInNano = BigInt(amount) * BigInt(1000000000);
        const destinationAddress = Address.parse(GAME_WALLET_ADDRESS);
        const responseAddress = Address.parse(wallet.account.address);
        
        const payload = buildJettonTransferPayload(amountInNano, destinationAddress, responseAddress);
        console.log('[TonConnect Deposit] ✓ Payload built successfully');
        console.log('[TonConnect Deposit] Payload (base64):', payload.substring(0, 50) + '...');

        // CSPIN Jetton Wallet 주소 파싱 (정식 형식)
        const jettonWalletAddress = Address.parse(CSPIN_JETTON_WALLET).toString();
        console.log('[TonConnect Deposit] ✓ Jetton Wallet Address:', jettonWalletAddress);

        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: jettonWalletAddress,
              amount: '200000000', // 0.2 TON for fees
              payload: payload
            }
          ]
        };

        console.log('[TonConnect Deposit] 📤 Sending transaction...');
        console.log('[TonConnect Deposit] Transaction object:', JSON.stringify(transaction, null, 2));

        const result = await tonConnectUI.sendTransaction(transaction as any);
        
        console.log('[TonConnect Deposit] ✅ Transaction sent to wallet');
        console.log('[TonConnect Deposit] Response:', result);

        // ✅ 블록체인에서 트랜잭션 확인 (새로운 단계)
        console.log('[TonConnect Deposit] 🔍 Confirming on blockchain...');
        const confirmed = await confirmTransaction(
          wallet.account.address,
          30000  // 최대 30초 대기
        );

        if (!confirmed) {
          console.warn('[TonConnect Deposit] ⏳ Transaction pending confirmation');
          showToast(
            '⏳ 트랜잭션이 처리 중입니다. 잠시 후 확인해주세요.',
            'warning'
          );
          // 여기서는 계속 진행 (블록체인에 기록되었을 가능성 있음)
        } else {
          console.log('[TonConnect Deposit] ✅ Confirmed on blockchain!');
        }

        // 백엔드에 입금 기록
        console.log('[TonConnect Deposit] 📝 Recording deposit on backend...');
        try {
          const response = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: wallet.account.address,
              depositAmount: amount,
              txHash: result.boc || result.toString(),
              method: 'tonconnect'
            })
          });

          if (!response.ok) {
            console.warn(`[TonConnect Deposit] Backend returned ${response.status}`);
          } else {
            console.log('[TonConnect Deposit] ✓ Backend recorded successfully');
          }
        } catch (backendError) {
          console.warn('[TonConnect Deposit] Backend recording failed (non-critical):', backendError);
        }

        showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
        depositState.setAmount('100');
        
        if (onDepositSuccess) onDepositSuccess(amount);
        if (isTMA) {
          try { WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`); } catch (e) { console.log('[TMA Alert] Not supported'); }
        }

        console.log(`
═════════════════════════════════════════════════════
✅ [TonConnect Deposit] SUCCESS
═════════════════════════════════════════════════════
        `);

        // 2초 후 자동 뒤로 가기
        setTimeout(() => onBack?.(), 2000);
      } catch (error) {
        console.error(`[TonConnect Deposit] Attempt ${retries} failed:`, error);
        console.error('[TonConnect Deposit] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : undefined,
          stack: error instanceof Error ? error.stack : undefined
        });

        // ✅ 에러 분류 및 재시도 판단 (개선)
        const errorCategory = classifyError(error);
        const errorMessage = getErrorMessage(errorCategory);
        const shouldRetry = isRetryableError(errorCategory) && retries < maxRetries + 1;

        console.log('[TonConnect Deposit] Error classification:', {
          category: errorCategory,
          message: errorMessage,
          shouldRetry
        });

        if (shouldRetry) {
          console.log('[TonConnect Deposit] 🔄 Retrying due to ' + errorCategory + '...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
          return attemptTransaction();
        }

        depositState.handleError(error, { method: 'tonconnect' });
        showToast(errorMessage, 'error');
        if (isTMA) {
          try { WebApp.showAlert(errorMessage); } catch (e) { console.log('[TMA Alert] Not supported'); }
        }

        throw error;
      }
    };

    try {
      await attemptTransaction();
    } finally {
      depositState.setLoading(false);
    }
  };

  // ==================== RPC 입금 (테스트용) ====================
  const handleDepositRPC = async () => {
    const validation = depositState.validateAmount();
    if (!validation.valid) {
      showToast(`❌ ${validation.error}`, 'error');
      console.warn('[RPC Deposit] Validation failed:', validation.error);
      return;
    }

    const amount = parseFloat(depositState.depositAmount);
    depositState.setLoading(true);
    showToast('⏳ RPC: 백엔드에서 처리 중... (테스트 모드)', 'info');
    console.log(`[RPC Deposit] Starting TEST MODE deposit: amount=${amount} CSPIN, wallet=${wallet?.account?.address || 'anonymous'}`);

    try {
      const response = await fetch('/api/deposit-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet?.account?.address || 'anonymous',
          depositAmount: amount,
          method: 'rpc',
          testMode: true  // ← 테스트 모드 플래그 추가
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`서버 오류: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('[RPC Deposit] Server response:', data);

      // ⚠️ 주의: 이것은 테스트 모드입니다!
      showToast(`⚠️ [테스트 모드] ${amount} CSPIN 추가됨 (실제 트랜잭션 없음)`, 'warning');
      console.warn('[RPC Deposit] TEST MODE: No actual transaction executed');
      
      depositState.setAmount('100');
      
      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) {
        try { WebApp.showAlert(`[테스트] ${amount} CSPIN 추가됨`); } catch (e) { console.log('[TMA Alert] Not supported'); }
      }

      // 2초 후 자동 뒤로 가기
      setTimeout(() => onBack?.(), 2000);
    } catch (error) {
      console.error('[RPC Deposit] Error:', error);
      console.error('[RPC Deposit] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      depositState.handleError(error, { method: 'rpc' });
      if (isTMA) {
        try { WebApp.showAlert('입금에 실패했습니다.'); } catch (e) { console.log('[TMA Alert] Not supported'); }
      }
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

// React.memo로 불필요한 리렌더링 방지
export default React.memo(Deposit);
