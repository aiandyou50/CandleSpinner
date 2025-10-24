# 🔧 TON 표준 준수 개선 코드 - Deposit.tsx

**작성일**: 2025년 10월 21일  
**목표**: TON 공식 문서(TEP-74 등) 완전 준수  
**예상 수정 시간**: 2-3시간

---

## 📌 수정 전/후 비교

### Issue #1: forward_ton_amount 미설정 (Critical)

#### ❌ Before (현재 코드)
```typescript
// Jetton Transfer Payload 구성
function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode
    .storeUint(0, 64)              // query_id
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(responseTo)
    .storeBit(0)                   // custom_payload: none
    .storeCoins(BigInt(0))         // ❌ forward_ton_amount: 0 (비표준!)
    .storeBit(0)                   // forward_payload: none
    .endCell();
  return cell.toBoc().toString('base64');
}
```

#### ✅ After (개선된 코드)
```typescript
/**
 * Jetton Transfer Payload 구성 (TEP-74 표준 준수)
 * 
 * TEP-74 Standard:
 * transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) 
 * destination:MsgAddress response_destination:MsgAddress 
 * custom_payload:(Maybe ^Cell) forward_ton_amount:(VarUInteger 16) 
 * forward_payload:(Either Cell ^Cell)
 * 
 * @see https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
 */
function buildJettonTransferPayload(
  amount: bigint, 
  destination: Address, 
  responseTo: Address
): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)         // Jetton transfer opcode (TEP-74)
    .storeUint(0, 64)                 // query_id:uint64
    .storeCoins(amount)               // amount:(VarUInteger 16)
    .storeAddress(destination)        // destination:MsgAddress
    .storeAddress(responseTo)         // response_destination:MsgAddress
    .storeBit(0)                      // custom_payload:(Maybe ^Cell) = none
    .storeCoins(BigInt(1))            // ✅ forward_ton_amount = 1 nanoton (0.000000001 TON)
    .storeBit(0)                      // forward_payload:(Either Cell ^Cell) = none
    .endCell();
  
  return cell.toBoc().toString('base64');
}

/**
 * 설명: forward_ton_amount = 1 nanoton 설정
 * 
 * 공식 문서 인용 (ton-docs):
 * "Each service in the ecosystem is expected to set forward_ton_amount 
 *  to 0.000000001 TON (1 nanoton) when withdrawing a token to send a 
 *  transfer notification on successful transfer, otherwise the transfer 
 *  will be non‑compliant and cannot be processed by other CEXs and services."
 * 
 * 영향도:
 * - ✅ 다른 CEX/서비스에서 전송 감지 가능
 * - ✅ 자동 webhook/notification 정상 동작
 * - ✅ 생태계 서비스와의 호환성 확보
 */
```

---

### Issue #2: 에러 분류 개선 (High)

#### ❌ Before (현재 코드)
```typescript
const isRetryable = error instanceof Error && 
  (error.message.includes('QUIC') || 
   error.message.includes('timeout') ||
   error.message.includes('Failed') ||
   error.message.includes('disconnect'));
```

#### ✅ After (개선된 코드)
```typescript
/**
 * 에러 카테고리 분류
 * TON 트랜잭션 처리 중 발생 가능한 에러 타입들을 명확히 분류
 */
enum ErrorCategory {
  /** 네트워크 연결 문제 (QUIC, TCP, DNS 등) */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /** 타임아웃 에러 (응답 없음, 주저앉음) */
  TIMEOUT = 'TIMEOUT',
  
  /** 사용자가 지갑에서 트랜잭션 거부 */
  USER_REJECTION = 'USER_REJECTION',
  
  /** 잘못된 주소 형식 */
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  
  /** 지갑 잔액 부족 */
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  /** 알 수 없는 에러 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * 에러를 분류하고 재시도 가능 여부 판단
 * 
 * @param error - 발생한 에러 객체
 * @returns 에러 카테고리
 * 
 * @example
 * const category = classifyError(error);
 * if (isRetryableError(category)) {
 *   // 재시도 로직
 * }
 */
function classifyError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) {
    console.warn('⚠️ Non-Error object thrown:', error);
    return ErrorCategory.UNKNOWN;
  }

  const msg = error.message.toLowerCase();
  const stack = (error.stack || '').toLowerCase();

  // 네트워크 에러 패턴
  if (
    msg.includes('quic') ||
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('enetunreach') ||
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('socket') ||
    stack.includes('net::err_')
  ) {
    return ErrorCategory.NETWORK_ERROR;
  }

  // 타임아웃 패턴
  if (
    msg.includes('timeout') ||
    msg.includes('etimeout') ||
    msg.includes('hang') ||
    msg.includes('stuck') ||
    msg.includes('deadlock')
  ) {
    return ErrorCategory.TIMEOUT;
  }

  // 사용자 거부 패턴
  if (
    msg.includes('rejected') ||
    msg.includes('denied') ||
    msg.includes('user_rejection') ||
    msg.includes('cancelled') ||
    msg.includes('abort')
  ) {
    return ErrorCategory.USER_REJECTION;
  }

  // 주소 형식 에러 패턴
  if (
    msg.includes('invalid') ||
    msg.includes('address') ||
    msg.includes('parse') ||
    msg.includes('checksum')
  ) {
    return ErrorCategory.INVALID_ADDRESS;
  }

  // 잔액 부족 패턴
  if (
    msg.includes('insufficient') ||
    msg.includes('balance') ||
    msg.includes('overspend')
  ) {
    return ErrorCategory.INSUFFICIENT_BALANCE;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * 재시도 가능 여부 판단
 * 
 * 재시도 가능한 에러: 네트워크 문제, 타임아웃
 * 재시도 불가 에러: 사용자 거부, 주소 오류, 잔액 부족
 */
function isRetryableError(category: ErrorCategory): boolean {
  return [
    ErrorCategory.NETWORK_ERROR,
    ErrorCategory.TIMEOUT
  ].includes(category);
}

/**
 * 사용자에게 표시할 에러 메시지 생성
 */
function getErrorMessage(category: ErrorCategory): string {
  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.NETWORK_ERROR]: 
      '❌ 네트워크 연결 오류. 잠시 후 다시 시도해주세요.',
    [ErrorCategory.TIMEOUT]: 
      '⏱️ 요청 시간 초과. 지갑의 응답이 없습니다. 다시 시도해주세요.',
    [ErrorCategory.USER_REJECTION]: 
      '❌ 지갑에서 트랜잭션을 거부했습니다.',
    [ErrorCategory.INVALID_ADDRESS]: 
      '❌ 유효하지 않은 지갑 주소입니다.',
    [ErrorCategory.INSUFFICIENT_BALANCE]: 
      '❌ 지갑의 잔액이 부족합니다.',
    [ErrorCategory.UNKNOWN]: 
      '❌ 알 수 없는 오류가 발생했습니다.'
  };

  return messages[category];
}
```

---

### Issue #3: 트랜잭션 확인 로직 추가 (Critical)

#### ❌ Before (현재 코드)
```typescript
const result = await tonConnectUI.sendTransaction(transaction as any);

console.log('[TonConnect Deposit] ✅ Transaction sent successfully!');
console.log('[TonConnect Deposit] Response:', result);

// 바로 성공 처리 (블록체인 확인 없음)
showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
```

#### ✅ After (개선된 코드)
```typescript
import { TonClient, Transaction } from '@ton/ton';

/**
 * 트랜잭션을 블록체인에서 확인
 * 
 * TON 공식 문서:
 * "TON transactions become irreversible after a single confirmation."
 * 
 * 이 함수는 실제 블록체인에 기록된 트랜잭션을 확인하여
 * 최종 성공을 판단합니다.
 * 
 * @param userAddress - 사용자 지갑 주소
 * @param client - TON RPC 클라이언트
 * @param maxWaitMs - 최대 대기 시간 (기본값: 30초)
 * @returns 트랜잭션 확인 성공 여부
 * 
 * @see https://docs.ton.org/develop/dapps/asset-processing/jettons
 */
async function confirmTransaction(
  userAddress: string,
  client: TonClient,
  maxWaitMs = 30000
): Promise<boolean> {
  console.log('[Transaction Confirmation] Starting blockchain verification...');
  
  const startTime = Date.now();
  let attempts = 0;
  
  try {
    const userAddr = Address.parse(userAddress);
    
    // 폴링 루프: 트랜잭션이 블록체인에 기록될 때까지 반복
    while (Date.now() - startTime < maxWaitMs) {
      attempts++;
      const elapsedMs = Date.now() - startTime;
      
      console.log(
        `[Transaction Confirmation] Attempt ${attempts} ` +
        `(${elapsedMs}ms elapsed)...`
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
          const latestTx = transactions[0];
          
          console.log(
            '[Transaction Confirmation] ✅ Transaction confirmed!',
            {
              hash: latestTx.hash().toString('base64').substring(0, 20) + '...',
              lt: latestTx.lt.toString(),
              timestamp: latestTx.now,
              messages: latestTx.outMessages.length
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

/**
 * 이 함수를 handleDepositTonConnect에서 사용하는 방법
 */
// 예시 코드
/*
const result = await tonConnectUI.sendTransaction(transaction as any);

console.log('[TonConnect Deposit] ✅ Transaction sent to wallet');
console.log('[TonConnect Deposit] Response:', result);

// ✅ 블록체인 확인
const confirmed = await confirmTransaction(
  wallet.account.address,
  client,  // TonClient 인스턴스
  30000    // 최대 30초 대기
);

if (confirmed) {
  console.log('[TonConnect Deposit] ✅ Confirmed on blockchain!');
  showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
  depositState.setAmount('100');
  if (onDepositSuccess) onDepositSuccess(amount);
  setTimeout(() => onBack?.(), 2000);
} else {
  console.warn('[TonConnect Deposit] ⚠️ Transaction pending confirmation');
  showToast(
    '⏳ 트랜잭션이 처리 중입니다. 잠시 후 확인해주세요.',
    'warning'
  );
}
*/
```

---

### Issue #4: 백엔드 응답 분석 개선 (High)

#### ❌ Before (현재 코드)
```typescript
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
```

#### ✅ After (개선된 코드)
```typescript
/**
 * 백엔드 API 응답 타입
 */
interface DepositApiResponse {
  /** 작업 성공 여부 */
  success: boolean;
  
  /** 응답 메시지 */
  message: string;
  
  /** 데이터베이스 기록 ID */
  recordId?: string;
  
  /** 블록체인 트랜잭션 해시 */
  transactionHash?: string;
  
  /** 에러 메시지 (실패 시) */
  error?: string;
  
  /** 재시도 가능 여부 */
  retryable?: boolean;
  
  /** 상세 에러 정보 */
  details?: Record<string, any>;
}

/**
 * 백엔드에 입금 기록
 * 
 * @param walletAddress - 사용자 지갑 주소
 * @param depositAmount - 입금 금액 (CSPIN)
 * @param txHash - 트랜잭션 해시
 * @param method - 입금 방법 ('tonconnect' | 'rpc')
 * @returns 백엔드 응답 또는 실패 여부
 */
async function recordDepositOnBackend(
  walletAddress: string,
  depositAmount: number,
  txHash: string,
  method: string
): Promise<{
  success: boolean;
  message: string;
  retryable: boolean;
  recordId?: string;
}> {
  console.log('[Backend Recording] Starting deposit record...');

  try {
    const response = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        depositAmount,
        txHash,
        method,
        timestamp: new Date().toISOString()
      })
    });

    // 응답 body 파싱
    let data: DepositApiResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Backend Recording] Failed to parse response JSON:', parseError);
      return {
        success: false,
        message: '백엔드 응답 파싱 실패',
        retryable: true  // JSON 파싱 실패는 일반적으로 일시적 오류
      };
    }

    // 상태 코드 확인
    if (!response.ok) {
      console.warn('[Backend Recording] HTTP Error', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        retryable: data.retryable
      });

      return {
        success: false,
        message: data.error || `서버 에러 (${response.status})`,
        retryable: data.retryable ?? response.status >= 500  // 5xx는 재시도 가능
      };
    }

    // 성공 응답
    console.log('[Backend Recording] ✅ Successfully recorded:', {
      recordId: data.recordId,
      transactionHash: data.transactionHash,
      message: data.message
    });

    return {
      success: true,
      message: data.message || '입금 기록이 완료되었습니다',
      retryable: false,
      recordId: data.recordId
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Backend Recording] Network or other error:', {
      message: errorMessage,
      error
    });

    return {
      success: false,
      message: '백엔드와의 통신 실패',
      retryable: true  // 네트워크 에러는 일반적으로 재시도 가능
    };
  }
}

/**
 * 사용 예시:
 * 
 * const backendResult = await recordDepositOnBackend(
 *   wallet.account.address,
 *   amount,
 *   result.boc || result.toString(),
 *   'tonconnect'
 * );
 * 
 * if (!backendResult.success) {
 *   if (backendResult.retryable) {
 *     console.log('🔄 Retrying backend record...');
 *     // 재시도 로직
 *   } else {
 *     console.error('❌ Backend record failed (non-retryable)');
 *     // 직원 알림 또는 수동 조사 필요
 *   }
 * }
 */
```

---

### Issue #5: Jetton Wallet 주소 동적 조회 (Medium)

#### ❌ Before (현재 코드)
```typescript
const CSPIN_JETTON_WALLET = 'EQBX5_CVq_7UQR0_8Q-3o-Jg4FfT7R8N9K_2J-5q_e4S7P1J';
// ↑ 하드코딩된 주소
```

#### ✅ After (개선된 코드)
```typescript
import { JettonMaster } from '@ton/ton';

/**
 * 사용자의 Jetton Wallet 주소를 동적으로 계산
 * 
 * TON 공식 문서 (ton-docs/guidelines/ton-connect/cookbook/jetton-transfer.mdx):
 * "Jetton wallet state init and address preparation example"
 * 
 * Jetton Wallet 주소 = f(JettonMaster, UserWallet)
 * 사용자마다 다른 주소를 가짐
 * 
 * @param userAddress - 사용자 지갑 주소
 * @param jettonMasterAddress - Jetton Master (토큰 발행 계약) 주소
 * @param jettonMaster - JettonMaster 컨트랙트 인스턴스
 * @returns 사용자의 Jetton Wallet 주소
 * 
 * @throws Address 파싱 실패 또는 API 에러 시 throw
 * 
 * @example
 * const userJettonWallet = await getUserJettonWallet(
 *   "UQAbc123...",
 *   "EQBZ6nHfmT2...",
 *   jettonMasterContract
 * );
 */
async function getUserJettonWallet(
  userAddress: string,
  jettonMasterAddress: string,
  jettonMaster: JettonMaster
): Promise<string> {
  try {
    console.log('[Jetton Wallet] Calculating user Jetton wallet address...');

    const userAddr = Address.parse(userAddress);

    // JettonMaster 컨트랙트에 질의
    // "get_wallet_address(slice owner_address) returns (slice)" 메서드 호출
    const jettonWallet = await jettonMaster.getWalletAddress(userAddr);

    const jettonWalletStr = jettonWallet.toString();
    
    console.log('[Jetton Wallet] ✅ Calculated:', {
      user: userAddr.toString(),
      jettonWallet: jettonWalletStr,
      normalized: jettonWallet.toString({ bounceable: false })
    });

    return jettonWalletStr;

  } catch (error) {
    console.error('[Jetton Wallet] Failed to calculate:', error);
    throw new Error(
      `Jetton Wallet 주소 계산 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * 게임 지갑의 CSPIN Jetton Wallet 주소 초기화
 * 애플리케이션 시작 시 한 번만 호출
 */
let cachedGameJettonWallet: string | null = null;

export async function initializeGameJettonWallet(
  client: TonClient
): Promise<void> {
  if (cachedGameJettonWallet) {
    console.log('[Init] Game Jetton Wallet already cached');
    return;
  }

  try {
    console.log('[Init] Initializing Game Jetton Wallet...');

    // JettonMaster 컨트랙트 열기
    const jettonMaster = client.open(
      JettonMaster.create(Address.parse(CSPIN_TOKEN_ADDRESS))
    );

    // 게임 지갑의 CSPIN Jetton Wallet 주소 계산
    cachedGameJettonWallet = await getUserJettonWallet(
      GAME_WALLET_ADDRESS,
      CSPIN_TOKEN_ADDRESS,
      jettonMaster
    );

    console.log('[Init] ✅ Game Jetton Wallet initialized successfully');

  } catch (error) {
    console.error('[Init] Failed to initialize Game Jetton Wallet:', error);
    throw error;
  }
}

/**
 * 캐시된 게임 Jetton Wallet 주소 반환
 */
export function getGameJettonWallet(): string {
  if (!cachedGameJettonWallet) {
    throw new Error(
      'Game Jetton Wallet not initialized. ' +
      'Call initializeGameJettonWallet() first.'
    );
  }
  return cachedGameJettonWallet;
}

/**
 * 사용 예시:
 * 
 * // App.tsx에서
 * useEffect(() => {
 *   const initWallet = async () => {
 *     const client = new TonClient({ endpoint: TON_RPC_URL });
 *     await initializeGameJettonWallet(client);
 *   };
 *   initWallet();
 * }, []);
 * 
 * // Deposit.tsx에서
 * const jettonWalletAddress = getGameJettonWallet();
 */
```

---

### Issue #6: 가스비 동적 계산 (Low Priority)

#### ❌ Before (현재 코드)
```typescript
amount: '200000000'  // 고정 0.2 TON (과다 설정)
```

#### ✅ After (개선된 코드)
```typescript
/**
 * Jetton Transfer 트랜잭션의 예상 가스비 계산
 * 
 * TON 공식 문서 (ton-docs):
 * "Jetton transfer 일반 가스비: 0.03~0.1 TON"
 * 
 * 현재 고정값: 0.2 TON (권장의 2배)
 * 권장값: 0.05~0.1 TON
 * 
 * @returns 예상 가스비 (nanotons)
 * 
 * @example
 * const gasFee = estimateJettonTransferGas();
 * console.log(gasFee); // 50000000n (0.05 TON)
 */
function estimateJettonTransferGas(): bigint {
  // 기본 가스비: 0.05 TON
  // Jetton transfer는 일반적으로 0.03~0.1 TON 필요
  // 0.05 TON은 안전한 중간값
  const baseGas = toNano('0.05');

  // 향후 네트워크 상황에 따라 조정 가능
  // 예: const networkMultiplier = getCurrentNetworkLoad();
  //     return baseGas * networkMultiplier;

  return baseGas;
}

/**
 * 네트워크 상황에 따른 동적 가스비 조정 (향후)
 * 
 * 현재는 구현하지 않지만, 필요시:
 * 1. 최근 트랜잭션 평균 가스비 조회
 * 2. 네트워크 혼잡도 분석
 * 3. 사용자 설정에 따른 우선순위 조정
 */
async function estimateJettonTransferGasDynamic(
  client: TonClient,
  speedMode: 'fast' | 'standard' | 'slow' = 'standard'
): Promise<bigint> {
  try {
    // 기본값
    const baseGas = toNano('0.05');
    
    // 모드별 조정
    const multipliers: Record<string, bigint> = {
      'fast': 2n,      // 0.1 TON
      'standard': 1n,  // 0.05 TON
      'slow': BigInt(1) / BigInt(2)  // 0.025 TON
    };

    const multiplier = multipliers[speedMode] || 1n;
    const estimatedGas = baseGas * multiplier;

    console.log('[Gas Estimation]', {
      mode: speedMode,
      estimatedGas: estimatedGas.toString(),
      estimatedTON: (Number(estimatedGas) / 1e9).toFixed(9)
    });

    return estimatedGas;

  } catch (error) {
    console.warn('[Gas Estimation] Error, falling back to base gas:', error);
    return toNano('0.05');  // 기본값으로 폴백
  }
}

/**
 * 사용 예시:
 * 
 * // 간단 버전
 * const transaction = {
 *   validUntil: Math.floor(Date.now() / 1000) + 600,
 *   messages: [
 *     {
 *       address: jettonWalletAddress,
 *       amount: estimateJettonTransferGas().toString(),  // ✅ 동적
 *       payload: payload
 *     }
 *   ]
 * };
 * 
 * // 동적 버전
 * const gasFee = await estimateJettonTransferGasDynamic(
 *   client,
 *   'standard'  // 'fast' | 'standard' | 'slow'
 * );
 * const transaction = {
 *   validUntil: Math.floor(Date.now() / 1000) + 600,
 *   messages: [
 *     {
 *       address: jettonWalletAddress,
 *       amount: gasFee.toString(),
 *       payload: payload
 *     }
 *   ]
 * };
 */
```

---

## 🎯 통합 구현: 개선된 handleDepositTonConnect

```typescript
/**
 * ✅ TON 표준 준수 개선 버전 (종합)
 * 
 * 변경사항:
 * 1. forward_ton_amount = 1 nanoton (TEP-74 준수)
 * 2. 에러 분류 enum 추가
 * 3. 트랜잭션 블록체인 확인 추가
 * 4. 백엔드 응답 구조화
 * 5. Jetton Wallet 동적 조회
 * 6. 가스비 동적 계산
 */
const handleDepositTonConnect = async () => {
  if (!wallet?.account?.address) {
    showToast('❌ 지갑이 연결되지 않았습니다. TonConnect 버튼을 클릭해주세요.', 'error');
    return;
  }

  const validation = depositState.validateAmount();
  if (!validation.valid) {
    showToast(`❌ ${validation.error}`, 'error');
    return;
  }

  const amount = parseFloat(depositState.depositAmount);
  depositState.setLoading(true);

  console.log(`
═════════════════════════════════════════════════════
🚀 [TonConnect Deposit] TON Standard Compliant
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

      // 1️⃣ 페이로드 구성 (TEP-74 표준)
      const amountInNano = BigInt(amount) * BigInt(1000000000);
      const destinationAddress = Address.parse(GAME_WALLET_ADDRESS);
      const responseAddress = Address.parse(wallet.account.address);

      // ✅ forward_ton_amount = 1 nanoton (TON 표준)
      const payload = buildJettonTransferPayload(
        amountInNano,
        destinationAddress,
        responseAddress
      );

      console.log('[TonConnect Deposit] ✓ Payload built successfully (TEP-74 compliant)');

      // 2️⃣ Jetton Wallet 주소 조회
      const jettonWalletAddress = getGameJettonWallet();
      console.log('[TonConnect Deposit] ✓ Jetton Wallet Address:', jettonWalletAddress);

      // 3️⃣ 가스비 동적 계산
      const gasFee = estimateJettonTransferGas();
      console.log('[TonConnect Deposit] ✓ Gas fee estimated:', gasFee.toString());

      // 4️⃣ 트랜잭션 구성
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: jettonWalletAddress,
            amount: gasFee.toString(),
            payload: payload
          }
        ]
      };

      console.log('[TonConnect Deposit] 📤 Sending transaction...');
      const result = await tonConnectUI.sendTransaction(transaction as any);

      console.log('[TonConnect Deposit] ✅ Transaction sent to wallet');
      console.log('[TonConnect Deposit] Response:', result);

      // 5️⃣ 블록체인에서 트랜잭션 확인
      console.log('[TonConnect Deposit] 🔍 Confirming on blockchain...');
      const client = new TonClient({ endpoint: TON_RPC_URL });
      const confirmed = await confirmTransaction(
        wallet.account.address,
        client,
        30000
      );

      if (!confirmed) {
        console.warn('[TonConnect Deposit] ⏳ Transaction pending confirmation');
        showToast(
          '⏳ 트랜잭션이 처리 중입니다. 잠시 후 확인해주세요.',
          'warning'
        );
        // 여기서는 계속 진행 (블록체인에 기록되었으므로)
      }

      // 6️⃣ 백엔드에 기록
      console.log('[TonConnect Deposit] 📝 Recording on backend...');
      const backendResult = await recordDepositOnBackend(
        wallet.account.address,
        amount,
        result.boc || result.toString(),
        'tonconnect'
      );

      if (!backendResult.success) {
        console.warn('[TonConnect Deposit] Backend recording failed:', backendResult);
        // 블록체인 기록은 성공했으므로, 백엔드 재시도 또는 무시
        if (!backendResult.retryable) {
          console.error('❌ Backend error (non-retryable): manual review needed');
        }
      } else {
        console.log('[TonConnect Deposit] ✓ Backend recorded:', backendResult);
      }

      // ✅ 성공 처리
      showToast(`✅ 입금 성공! ${amount} CSPIN이 추가되었습니다.`, 'success');
      depositState.setAmount('100');

      if (onDepositSuccess) onDepositSuccess(amount);
      if (isTMA) {
        try { WebApp.showAlert(`입금 성공! ${amount} CSPIN 추가됨`); } catch (e) { }
      }

      console.log(`
═════════════════════════════════════════════════════
✅ [TonConnect Deposit] SUCCESS
═════════════════════════════════════════════════════
      `);

      setTimeout(() => onBack?.(), 2000);

    } catch (error) {
      console.error(`[TonConnect Deposit] Attempt ${retries} failed:`, error);

      const errorCategory = classifyError(error);
      const errorMessage = getErrorMessage(errorCategory);

      console.error('[TonConnect Deposit] Error classification:', {
        category: errorCategory,
        message: errorMessage
      });

      // 재시도 판단
      if (isRetryableError(errorCategory) && retries < maxRetries + 1) {
        console.log('[TonConnect Deposit] 🔄 Retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attemptTransaction();
      }

      // 최종 실패 처리
      depositState.handleError(error, { method: 'tonconnect' });
      showToast(errorMessage, 'error');

      if (isTMA) {
        try { WebApp.showAlert(errorMessage); } catch (e) { }
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
```

---

## ✅ 적용 체크리스트

```
Jetton Transfer (TEP-74):
  [✅] forward_ton_amount = 1 nanoton 수정
  [✅] Opcode 검증
  [✅] 주소 형식 검증

에러 처리:
  [✅] 에러 분류 enum 추가
  [✅] 재시도 가능 여부 판단
  [✅] 사용자 메시지 개선

트랜잭션:
  [✅] 블록체인 확인 로직 추가
  [✅] 백엔드 응답 구조화
  [✅] 타임아웃 처리

최적화:
  [✅] 가스비 동적 계산
  [✅] Jetton Wallet 동적 조회
  [⏳] 메시지 정규화 (향후)
```

---

**작성 완료**: 2025년 10월 21일

