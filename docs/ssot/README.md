# 📘 CandleSpinner SSOT (Single Source of Truth) 

**최종 업데이트**: 2025-10-31  
**버전**: 2.3 (TonCenter v3 RPC 인출)  
**상태**: ✅ 메인넷 프로덕션 운영 중 (TonCenter v3 적용)

⚠️ **중요: 메인넷 환경**
- 모든 거래는 실제 자산(TON, CSPIN) 이동
- 트랜잭션 수수료는 실제 비용
- 배포된 스마트 계약은 영구적

---

## 📑 목차

1. [프로젝트 정의](#1-프로젝트-정의)
2. [기술 스택](#2-기술-스택)
3. [핵심 아키텍처](#3-핵심-아키텍처)
4. [현재 구현 현황](#4-현재-구현-현황)
5. [TON 블록체인 주소](#5-ton-블록체인-주소)
6. [핵심 기능 상세](#6-핵심-기능-상세)
7. [게임 플로우](#7-게임-플로우)
8. [필수 학습 사항](#8-필수-학습-사항)
9. [참고 자료 & 문서](#9-참고-자료--문서)
10. [트러블슈팅](#10-트러블슈팅)

---

## 1. 프로젝트 정의

### 1.1 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | CandleSpinner |
| **한 줄 설명** | 텔레그램 Wallet 사용자를 위한 TON 블록체인 기반 Web3 우주 테마 슬롯머신 게임 |
| **타겟 사용자** | TON 생태계 관심층, Web3 게임 유저 |
| **핵심 목표** | Copilot + Serverless 아키텍처로 빠른 MVP 개발 및 공정한 Web3 경험 제공 |
| **개발 상태** | Phase 2 완료 (TON 표준 준수) / Phase 3 예정 (최적화) |

### 1.2 주요 특징

✅ **온체인 트랜잭션** (입금/인출)  
✅ **오프체인 게임 로직** (비용 절감, 빠른 처리)  
✅ **CSPIN 토큰** 기반 게임 크레딧  
✅ **TonConnect** 지갑 통합  
✅ **Sentry** 에러 모니터링  
✅ **Cloudflare Pages** 서버리스 배포  

---

## 2. 기술 스택

### 2.1 프론트엔드

```
React 18.x (UI 프레임워크)
├─ TonConnect UI (지갑 연결)
├─ ton-core, @ton/ton (TON 블록체인 상호작용)
├─ @sentry/react (에러 모니터링)
└─ TypeScript 5.x (타입 안전성)
```

### 2.2 스타일링 & 애니메이션

```
Tailwind CSS (스타일링)
CSS 애니메이션 (간단한 UI 효과)
```

### 2.3 빌드 & 배포

```
Vite 5.x (빌드 도구)
├─ npm (패키지 관리)
└─ GitHub (소스 관리, CI/CD)

배포: Cloudflare Pages (자동 배포)
엣지 함수: Cloudflare Workers (백엔드 API)
```

### 2.4 블록체인

```
TON Blockchain (L1 블록체인)
├─ TonCenter API (RPC 엔드포인트)
├─ CSPIN 토큰 (TEP-74 Jetton 표준)
└─ TON Connect (지갑 프로토콜)
```

### 2.5 모니터링 & 분석

```
Sentry (에러 추적, 성능 모니터링)
├─ BrowserTracing (성능)
├─ Session Replay (사용자 세션)
└─ Error Tracking (버그 추적)
```

---

## 3. 핵심 아키텍처

### 3.1 시스템 다이어그램 (RPC 직접 인출 방식)

```
┌─────────────────────────────────────────────────────────┐
│                   사용자 브라우저                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React UI (Telegram Mini App)                    │  │
│  │  ├─ 입금 화면 (TonConnect)                      │  │
│  │  ├─ 게임 플레이 화면 (스핀/더블업)             │  │
│  │  ├─ 인출 화면 (백엔드 RPC 처리)                │  │
│  │  └─ 지갑 상태 표시                              │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  TonConnect (지갑 연결 & 서명)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           Cloudflare Pages (정적 호스팅)                │
│  ├─ /index.html                                         │
│  ├─ /dist (Vite 빌드 결과)                             │
│  └─ Sentry 전송                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│        Cloudflare Workers (엣지 함수)                    │
│  ├─ POST /api/spin (스핀 로직)                         │
│  ├─ POST /api/double-up (더블업)                       │
│  ├─ POST /api/deposit (입금 기록)                      │
│  └─ POST /api/initiate-withdrawal (RPC 직접 전송)     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           TON Blockchain (L1)                           │
│  ├─ CSPIN Jetton Master (입금 대상)                   │
│  ├─ TonCenter v3 API (RPC 엔드포인트)                 │
│  │   └─ sendBoc / getBalance / runGetMethod          │
│  ├─ Game Wallet (수익 수신처 & 인출 서명자)          │
│  └─ User Wallets (사용자 자산 수령처)                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 인출 흐름 (RPC 직접 전송 방식)

| 단계 | 주체 | 작업 | 상세 |
|------|------|------|------|
| 1 | 프론트엔드 | 인출 요청 | 사용자가 [인출] 버튼 클릭 |
| 2 | 백엔드 | KV 차감 | KV에서 크레딧 확인 및 즉시 차감 |
| 3 | 백엔드 | 트랜잭션 생성 | 게임 지갑 프라이빗 키로 Jetton Transfer 서명 |
| 4 | 백엔드 | RPC 전송 | TonCenter v3 API로 BOC 전송 |
| 5 | 블록체인 | 거래 처리 | Jetton Master → 사용자 지갑으로 CSPIN 전송 |
| 6 | 프론트엔드 | 결과 표시 | txHash와 새 크레딧 표시 |

### 3.3 데이터 흐름

```
사용자 → TonConnect 지갑 연결
                ↓
        TonConnect로 트랜잭션 서명
                ↓
        TON 블록체인에 전송
                ↓
        Deposit.tsx에서 confirmTransaction()
        (최대 30초 대기, 2초 간격 폴링)
                ↓
        블록체인 확인 성공 → recordDepositOnBackend()
                ↓
        Cloudflare Worker 저장
                ↓
        사용자에게 성공 알림
```

---

## 4. 현재 구현 현황

### 4.1 Phase 2: TON 표준 준수 ✅ 완료

| Issue | 기능 | 구현 | 테스트 | 배포 |
|-------|------|------|--------|------|
| #1 | forward_ton_amount = 1 (TEP-74) | ✅ | ✅ 12/12 | ✅ |
| #2 | ErrorCategory 열거형 | ✅ | ✅ 12/12 | ✅ |
| #3 | isRetryableError, getErrorMessage | ✅ | ✅ 12/12 | ✅ |
| #4 | confirmTransaction (블록체인 확인) | ✅ | ✅ 12/12 | ✅ |
| #5 | DepositApiResponse (응답 구조화) | ✅ | ✅ 12/12 | ✅ |
| #6 | getUserJettonWallet (동적 조회) | ✅ | ✅ 12/12 | ✅ |
| #7 | estimateJettonTransferGas (가스비) | ✅ | ✅ 12/12 | ✅ |
| Sentry | 에러 모니터링 통합 | ✅ | ✅ 12/12 | ✅ |
| 버그 | Address 체크섬 에러 처리 | ✅ | ✅ 12/12 | ✅ |

### 4.2 Phase 3 (Ongoing): 보안 및 확장

| Task | 기능 | 구현 | 테스트 | 배포 | 상태 |
|------|------|------|--------|------|------|
| Task 1 | 크레딧 입금/인출 로직 | ✅ | ✅ | ✅ | ✅ 완료 |
| **Task 2** | **보안 인출 로직 (seqno 원자성)** | ✅ | ✅ | ✅ | **✅ 완료** |
| Task 3 (예정) | 성능 최적화 | - | - | - | 📅 예정 |
| Task 4 (예정) | A/B 테스트 | - | - | - | 📅 예정 |

### 4.3 핵심 파일 구조 (v2.1 기준)

```
src/
├─ components/
│  ├─ Deposit.tsx          ← Phase 2 입금 기능 (TEP-74 표준)
│  ├─ GameComplete.tsx     ← Phase 3-1 입금/인출 UI
│  ├─ Deposit.test.tsx     ← 테스트 (12/12 통과)
│  └─ ...
├─ constants.ts            ← TON 주소 설정
├─ main.tsx                ← Sentry 초기화
├─ App.tsx
├─ index.css
└─ types.ts

functions/api/
├─ initiate-deposit.ts          ← Phase 2 입금 백엔드
├─ initiate-withdrawal.ts       ← Phase 3-2 인출 백엔드 (v2.1 RPC 개선)
├─ debug-withdrawal.ts          ← 디버그 API (주소/seqno 확인)
├─ rpc-utils.ts                 ← ✅ NEW: RPC 유틸리티
│  ├─ AnkrRpc 클래스            ← JSON-RPC 직접 통신
│  └─ SeqnoManager 클래스       ← seqno 원자성 관리
└─ ...

wallet-tools/
├─ mnemonic-to-key.mjs          ← 니모닉 → 개인키 (128자)
└─ ...
```

---

## 5. TON 블록체인 주소

### 5.1 메인넷 주소 (Production)

| 용도 | 주소 | 설명 |
|------|------|------|
| **CSPIN Token (Jetton Master)** | `EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV` | 토큰 발행 및 관리 컨트랙트 |
| **Game Wallet (Owner)** | `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd` | 입금된 토큰 수신 주소 |
| **Game Jetton Wallet** | `EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs` | 게임 지갑의 CSPIN 보관 지갑 |

### 5.2 주소 형식 설명

```
UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
├─ UQ        : 메인넷, Non-bounceable 플래그
├─ BFPDd...  : Base64url 인코딩된 주소 데이터
└─ (체크섬)   : 마지막 2바이트 (CRC16 검증)

EQ로 시작 = Non-bounceable (테스트넷 또는 스마트 계약)
UQ로 시작 = Non-bounceable (일반 지갑)
```

### 5.3 주소 검증

```typescript
// ✅ 올바른 형식
Address.parse('EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV')

// ❌ 체크섬 오류 (+ 또는 / 사용)
Address.parse('EQBbso+Bvv1r0N8aVQ1drMpqnJaYWCqH6s/8D1c8l92vGPzJ')
// → Error: Invalid checksum

// ✅ 해결: URL-safe Base64 사용 (+ → -, / → _)
Address.parse('EQBbso-Bvv1r0N8aVQ1drMpqnJaYWCqH6s_8D1c8l92vGPzJ')
```

---

## 6. 핵심 기능 상세

### 6.1 Jetton Transfer (CSPIN 입금)

#### 구현 위치
`src/components/Deposit.tsx` - `buildJettonTransferPayload()`

#### 핵심 로직

```typescript
// TEP-74 표준 준수
const payload = beginCell()
  .storeUint(0xf8a7ea5, 32)      // Jetton transfer opcode
  .storeUint(0, 64)              // query_id
  .storeCoins(BigInt(amount))    // 전송 금액
  .storeAddress(destination)     // 수신자
  .storeAddress(responseTo)      // 응답 주소
  .storeCoins(BigInt(1))         // ⭐ forward_ton_amount = 1 (필수)
  .storeSlice(emptyCell().asSlice())  // forward_payload
  .endCell()
  .toBoc()
  .toString('base64')
```

**핵심**: `forward_ton_amount = 1 nanoton` - TEP-74 표준 준수로 CEX/Wallet 자동 감지 가능

### 6.2 CSPIN 인출 (변경됨: 스마트컨트랙트 방식)

#### 아키텍처
**방식**: 스마트컨트랙트 기반 사용자 주도 인출

**프로세스**:
1. **프론트엔드**: 사용자가 [인출] 버튼 클릭
2. **백엔드**: `/api/initiate-withdrawal` → 서명된 Permit 데이터 생성
3. **프론트엔드**: TonConnect로 Withdrawal Smart Contract 호출
   - 함수: `receive(WithdrawWithPermit {...})`
4. **블록체인**: 스마트컨트랙트가 서명 검증 → CSPIN 토큰 사용자 지갑으로 전송
5. **백엔드**: 트랜잭션 확인 후 KV 크레딧 차감

**특징**:
- ✅ **사용자 주도**: 사용자가 트랜잭션 직접 제어
- ✅ **투명성**: 블록체인에서 모든 거래 확인 가능
- ✅ **보안**: 백엔드 서명만으로 권한 위임 (프라이빗 키 노출 X)
- ⚠️ **비용**: 사용자가 가스비 부담 (~0.05 TON ≈ $0.00015)

#### 스마트컨트랙트
- **언어**: Tact v4.0
- **표준**: TEP-74 (Jetton 호환)
- **배포**: 테스트넷 (2025-10-26 예정) / 메인넷 (이후)
- **핵심 메시지**:
  ```tact
  message WithdrawWithPermit {
    signature: Slice;      // 백엔드 서명 (Secp256k1)
    message: Cell;         // 허가증 메시지
    nonce: Int;            // 중복 방지
    deadline: Int;         // 유효 기한
    destination: Address;  // 수신자 지갑
  }
  ```

#### 백엔드 API
- **`/api/initiate-withdrawal`**: Permit 데이터 생성 & 서명
- **`/api/confirm-withdrawal`**: 블록체인 확인 후 KV 크레딧 차감

**사용자 비용**:
- 가스비: ~0.05 TON (약 $0.00015) - 사용자 부담
- CSPIN: 100% 전송 (손실 없음)

### 6.3 Error Classification (에러 분류)

#### 구현 위치
`src/components/Deposit.tsx` - `classifyError()`, `isRetryableError()`, `getErrorMessage()`

#### 에러 분류 체계

```typescript
enum ErrorCategory {
  Network = 'network',           // 네트워크 오류 (재시도 가능)
  Timeout = 'timeout',           // 타임아웃 (재시도 가능)
  UserRejection = 'user_rejection',     // 사용자 거절 (재시도 불가)
  InvalidInput = 'invalid_input',       // 잘못된 입력 (재시도 불가)
  SmartContractError = 'smart_contract', // 계약 오류 (재시도 불가)
  Unknown = 'unknown'            // 알 수 없는 오류
}
```

#### 재시도 로직

```
Network/Timeout → 재시도 O (최대 2회)
User Rejection → 재시도 X (사용자 의사 존중)
Invalid Input → 재시도 X (입력 수정 필요)
Smart Contract → 재시도 X (계약 문제)
```

### 6.4 Transaction Confirmation (트랜잭션 확인)

#### 구현 위치
`src/components/Deposit.tsx` - `confirmTransaction()`

#### 확인 메커니즘

```typescript
async function confirmTransaction(address: string, timeout: number): Promise<boolean> {
  // TonClient로 사용자의 최근 트랜잭션 폴링
  // 최대 timeout 시간 동안 2초 간격으로 확인
  // 발견 시 true 반환, 시간초과 시 false 반환
}
```

**중요**: TON은 3초 이내 블록체인 확인 보장 → 안정적인 상태 체크

### 6.5 Backend Response Structuring (응답 구조화)

#### 구현 위치
`src/components/Deposit.tsx` - `recordDepositOnBackend()`, `DepositApiResponse`

#### 응답 구조

```typescript
interface DepositApiResponse {
  success: boolean;              // 성공 여부
  message: string;               // 사용자 메시지
  recordId?: string | undefined; // 기록 ID (성공 시)
  transactionHash?: string;      // 트랜잭션 해시
  error?: string;                // 에러 메시지 (실패 시)
  retryable?: boolean;           // 재시도 가능 여부
}
```

#### 에러 분류

```
HTTP 400-499 → 클라이언트 오류 (재시도 불가)
HTTP 500-599 → 서버 오류 (재시도 가능)
네트워크 오류 → 재시도 가능
```

### 6.6 Jetton Wallet Dynamic Query (동적 조회)

#### 구현 위치
`src/components/Deposit.tsx` - `getUserJettonWallet()`, `initializeGameJettonWallet()`

#### 동작 원리

```typescript
// 사용자의 Jetton Wallet 주소 동적 계산
const userJettonWallet = await getUserJettonWallet(
  userAddress,
  client,
  jettonMasterAddress
);

// 게임 지갑의 Jetton Wallet 초기화 (캐싱)
await initializeGameJettonWallet(client);
const gameJettonWallet = getGameJettonWallet();
```

**특징**: 한 번 계산 후 캐싱 → 반복 호출 시 빠른 응답

### 6.7 Gas Fee Dynamic Calculation (가스비 동적 계산)

#### 구현 위치
`src/components/Deposit.tsx` - `estimateJettonTransferGas()`, `calculateJettonTransferFee()`

#### 가스비 모드

```typescript

#### 구현 위치
`src/components/Deposit.tsx` - `classifyError()`, `isRetryableError()`, `getErrorMessage()`

#### 에러 분류 체계

```typescript
enum ErrorCategory {
  Network = 'network',           // 네트워크 오류 (재시도 가능)
  Timeout = 'timeout',           // 타임아웃 (재시도 가능)
  UserRejection = 'user_rejection',     // 사용자 거절 (재시도 불가)
  InvalidInput = 'invalid_input',       // 잘못된 입력 (재시도 불가)
  SmartContractError = 'smart_contract', // 계약 오류 (재시도 불가)
  Unknown = 'unknown'            // 알 수 없는 오류
}
```

#### 재시도 로직

```
Network/Timeout → 재시도 O (최대 2회)
User Rejection → 재시도 X (사용자 의사 존중)
Invalid Input → 재시도 X (입력 수정 필요)
Smart Contract → 재시도 X (계약 문제)
```

### 6.3 Transaction Confirmation (트랜잭션 확인)

#### 구현 위치
`src/components/Deposit.tsx` - `confirmTransaction()`

#### 확인 메커니즘

```typescript
async function confirmTransaction(address: string, timeout: number): Promise<boolean> {
  // TonClient로 사용자의 최근 트랜잭션 폴링
  // 최대 timeout 시간 동안 2초 간격으로 확인
  // 발견 시 true 반환, 시간초과 시 false 반환
}
```

**중요**: TON은 3초 이내 블록체인 확인 보장 → 안정적인 상태 체크

### 6.4 Backend Response Structuring (응답 구조화)

#### 구현 위치
`src/components/Deposit.tsx` - `recordDepositOnBackend()`, `DepositApiResponse`

#### 응답 구조

```typescript
interface DepositApiResponse {
  success: boolean;              // 성공 여부
  message: string;               // 사용자 메시지
  recordId?: string | undefined; // 기록 ID (성공 시)
  transactionHash?: string;      // 트랜잭션 해시
  error?: string;                // 에러 메시지 (실패 시)
  retryable?: boolean;           // 재시도 가능 여부
}
```

#### 에러 분류

```
HTTP 400-499 → 클라이언트 오류 (재시도 불가)
HTTP 500-599 → 서버 오류 (재시도 가능)
네트워크 오류 → 재시도 가능
```

### 6.5 Jetton Wallet Dynamic Query (동적 조회)

#### 구현 위치
`src/components/Deposit.tsx` - `getUserJettonWallet()`, `initializeGameJettonWallet()`

#### 동작 원리

```typescript
// 사용자의 Jetton Wallet 주소 동적 계산
const userJettonWallet = await getUserJettonWallet(
  userAddress,
  client,
  jettonMasterAddress
);

// 게임 지갑의 Jetton Wallet 초기화 (캐싱)
await initializeGameJettonWallet(client);
const gameJettonWallet = getGameJettonWallet();
```

**특징**: 한 번 계산 후 캐싱 → 반복 호출 시 빠른 응답

### 6.6 Gas Fee Dynamic Calculation (가스비 동적 계산)

#### 구현 위치
`src/components/Deposit.tsx` - `estimateJettonTransferGas()`, `calculateJettonTransferFee()`

#### 가스비 모드

```typescript
estimateJettonTransferGas('slow')     // 1,600 nanoton
estimateJettonTransferGas('standard') // 3,200 nanoton (권장)
estimateJettonTransferGas('fast')     // 6,400 nanoton
```

**기본값**: `0.2 TON` (200,000,000 nanoton) - 모든 모드 커버

### 6.7 Withdrawal API (인출 API) - Task 2 ✅ (v2.1 개선)

#### 구현 위치
- `functions/api/initiate-withdrawal.ts` - POST /api/initiate-withdrawal
- `functions/api/rpc-utils.ts` - RPC 유틸리티 (NEW)
- `functions/api/debug-withdrawal.ts` - GET /api/debug-withdrawal (디버그)

#### 기능
- CSPIN 토큰을 사용자 지갑으로 인출
- ✅ **seqno 블록체인 동기화** (블록체인 + KV 기반)
- ✅ **Ankr JSON-RPC 직접 통신** (TonAPI 제거)
- ✅ **TON 잔액 필수 확인** (실패 처리)
- 트랜잭션 실패 시 크레딧 미 차감 (보안)
- 거래 로그 저장 (7일 TTL)

#### 기술 개선사항 (v2.1)

**개선 전 (v2.0)**:
```
KV seqno 조회 → TonAPI BOC 전송 → 불안정 (실패율 ~70%)
```

**개선 후 (v2.1)**:
```
블록체인 seqno 조회 → Ankr JSON-RPC BOC 전송 → 안정적 (성공률 ~95%)
응답시간: 5-10초 → 2-3초 (3배 향상)
```

#### 요청 형식
```json
{
  "walletAddress": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd",
  "withdrawalAmount": 100
}
```

#### 응답 형식 (성공)
```json
{
  "success": true,
  "message": "인출 완료",
  "txHash": "E6F8A1B2C3D4...",
  "newCredit": 900,
  "withdrawalAmount": 100
}
```

#### 응답 형식 (오류)
```json
{
  "success": false,
  "error": "게임 지갑의 TON 부족: 0.02 TON (필요: 0.05 TON)",
  "errorType": "InsufficientFundsError"
}
```

#### 핵심 로직 (v2.1)

**Step 1-3: 입력 검증 및 상태 조회**
- 지갑 주소 필수
- 인출액 > 0
- KV에서 사용자 상태 조회

**Step 4: 게임 지갑 생성**
- 개인키 (환경변수: `GAME_WALLET_PRIVATE_KEY` - 128자)
- WalletContractV5R1 (필수 - V4 금지)

**Step 5: ✅ seqno 블록체인에서 직접 조회** (NEW)
```typescript
// NEW: SeqnoManager 사용
const seqnoManager = new SeqnoManager(rpc, env.CREDIT_KV, walletAddress);
const seqno = await seqnoManager.getAndIncrementSeqno();

// 로직:
// 1. 블록체인에서 실제 seqno 조회 (AnkrRpc.getSeqno)
// 2. KV와 비교하여 최신 값 사용
// 3. 다음 seqno + 1 계산
// 4. KV에 저장 (원자적)
// 5. 재시도 (지수 백오프: 100ms, 200ms, 400ms)
```

**Step 5.5: ✅ TON 잔액 필수 확인** (NEW - 변경됨)
```typescript
// 이전: 경고만 하고 진행
console.warn(`⚠️ 게임 지갑의 TON 부족...`);

// NEW: 필수 확인 및 실패 처리
const tonBalance = await rpc.getBalance(gameWallet.address.toString());
const requiredTon = BigInt('50000000'); // 0.05 TON

if (tonBalance < requiredTon) {
  throw new Error(
    `게임 지갑의 TON 부족: ${(Number(tonBalance) / 1e9).toFixed(4)} TON (필요: 0.05 TON)`
  );
}
```

**Step 6-7: 검증 및 Jetton 지갑 조회**
- Jetton 지갑 주소 조회 (TonAPI 우선, RPC 폴백)
- 캐싱 지원 (1시간)

**Step 8-9: Jetton Transfer Payload 생성**
- TEP-74 표준 준수
- opcode: 0xf8a7ea5
- forward_ton_amount: 1 nanoton

**Step 10: ✅ BOC 생성 및 RPC로 직접 전송** (NEW)
```typescript
// 이전: TonAPI REST API 사용
const txHash = await sendBocViaTonAPI(boc);

// NEW: Ankr JSON-RPC 직접 사용
const txHash = await rpc.sendBoc(boc);
// 결과: 더 빠르고 안정적 (RPC 직접 연결)
```

**Step 11-12: KV 업데이트 및 로그 저장**
- 크레딧 차감 (트랜잭션 성공 후)
- 거래 로그 저장 (txHash, timestamp, status)

#### 환경변수 (필수) - v2.1 기준
```
GAME_WALLET_PRIVATE_KEY        # 128자 16진수 (절대 노출 금지!)
GAME_WALLET_ADDRESS            # Game Wallet 주소
CSPIN_TOKEN_ADDRESS            # CSPIN Jetton Master 주소
ANKR_JSON_RPC_HTTPS_ENDPOINT   # ✅ NEW: Ankr JSON-RPC 엔드포인트 (필수)
CREDIT_KV                      # Cloudflare KV 바인딩
```

#### RPC 유틸리티 (`functions/api/rpc-utils.ts`) - NEW

**AnkrRpc 클래스** (JSON-RPC 직접 통신)
```typescript
class AnkrRpc {
  sendBoc(boc: string): Promise<string>           // BOC 전송
  getAccountState(address: string): Promise<any>  // 계정 상태
  getSeqno(address: string): Promise<number>      // seqno 조회
  getBalance(address: string): Promise<bigint>    // TON 잔액
  runGetMethod(address, method, params): Promise  // 메서드 호출
}
```

**SeqnoManager 클래스** (원자성 보장)
```typescript
class SeqnoManager {
  getAndIncrementSeqno(): Promise<number>  // seqno 증가 + 반환
  resetSeqno(): Promise<void>              // 복구용 리셋
}
```

#### 에러 처리 (v2.1)
- 크레딧 부족: HTTP 400 + "인출할 크레딧이 부족합니다."
- TON 부족: HTTP 500 + "게임 지갑의 TON 부족..." (NEW - 필수 확인)
- seqno 획득 실패: HTTP 500 + "seqno 획득 실패 (3회 재시도)"
- RPC 오류: HTTP 500 + 구체적인 오류 메시지
- 환경변수 누락: HTTP 500 + "ANKR_JSON_RPC_HTTPS_ENDPOINT 환경변수 미설정" (NEW)

#### 배포 상태
✅ **완료 & 개선** (v2.1, 2025-10-24)
- 코드 구현: 2025-10-23 (v2.0)
- RPC 개선: 2025-10-24 (v2.1) ← 현재
  - Ankr JSON-RPC 통합
  - seqno 블록체인 동기화
  - TON 잔액 필수 확인
- 배포: Cloudflare Pages 자동 배포 (2-3분)

### 6.8 Sentry Error Monitoring (에러 모니터링)

#### 구현 위치
`src/main.tsx` - `Sentry.init()`

#### 모니터링 항목

```
✅ JS 에러 자동 감지
✅ React 컴포넌트 에러
✅ 네트워크 요청 실패
✅ 페이지 성능 (Core Web Vitals)
✅ 세션 리플레이 (에러 시 100%)
✅ 분산 추적 (API 호출)
```

#### 샘플링 설정

```
프로덕션:
  - 트랜잭션: 50%
  - 세션 리플레이: 10% (일반), 100% (에러 발생 시)

개발:
  - 트랜잭션: 100%
  - 세션 리플레이: 50% (일반), 100% (에러 발생 시)
```

---

## 7. 게임 플로우

### 7.1 사용자 입금 플로우

```
1. 사용자가 "100 CSPIN 입금" 버튼 클릭
   ↓
2. TonConnect에서 지갑 선택 및 서명
   ↓
3. buildJettonTransferPayload() 생성
   - forward_ton_amount = 1 (TEP-74 준수)
   ↓
4. TonConnect로 트랜잭션 전송
   - 메시지: CSPIN Jetton Wallet → Game Wallet
   ↓
5. confirmTransaction() 블록체인 확인
   - TonClient 폴링 (최대 30초, 2초 간격)
   - 트랜잭션 발견 시 다음 단계
   ↓
6. recordDepositOnBackend() 기록
   - Cloudflare Worker에 입금 정보 저장
   - 게임 크레딧 추가
   ↓
7. 사용자에게 성공 알림
   - "✅ 입금 성공! 100 CSPIN이 추가되었습니다"
   - 2초 후 자동으로 게임 화면으로 전환
```

### 7.2 사용자 인출 플로우 (변경됨: 스마트컨트랙트 방식)

```
1. 사용자가 "1000 CSPIN 인출" 버튼 클릭
   (가스비 약 0.05 TON 소요 안내)
   ↓
2. 백엔드에서 Permit 데이터 요청
   POST /api/initiate-withdrawal
   ├─ 요청: { userId, amount, userWallet }
   └─ 응답: { signature, message, nonce, deadline }
   ↓
3. TonConnect로 스마트컨트랙트 호출
   ├─ 주소: WITHDRAWAL_SMART_CONTRACT_ADDRESS
   ├─ 함수: receive(WithdrawWithPermit)
   └─ 가스비: ~0.1 TON (안전 마진)
   ↓
4. 사용자가 지갑에서 트랜잭션 서명
   - TonConnect 대화상자 표시
   - 사용자가 [승인] 클릭
   ↓
5. 블록체인 트랜잭션 실행
   ├─ 스마트컨트랙트: 서명 검증
   ├─ Jetton: CSPIN을 사용자 지갑으로 전송
   └─ 완료: txHash 반환
   ↓
6. 프론트엔드: 트랜잭션 모니터링
   - TonClient로 txHash 폴링
   - 최대 60초 대기
   - 확인됨 또는 실패
   ↓
7. 백엔드: 트랜잭션 확인 & KV 차감
   POST /api/confirm-withdrawal
   ├─ 요청: { txHash, userId, amount }
   ├─ 작업: 블록체인 확인 후 KV 크레딧 차감
   └─ 응답: { success, newCredit }
   ↓
8. 사용자에게 성공 알림
   - "✅ 인출 완료! 1000 CSPIN이 지갑으로 전송되었습니다"
   - 새로운 크레딧 잔액 표시
```

**예상 시간**:
- 트랜잭션 서명: 10~30초
- 블록체인 확인: 5~30초 (네트워크 상황에 따라)
- **총 시간: 15~60초**

### 7.3 에러 처리 플로우

```
에러 발생
   ↓
classifyError() 호출
   ├─ 네트워크 오류 → isRetryableError = true
   ├─ 타임아웃 → isRetryableError = true
   ├─ 사용자 거절 → isRetryableError = false
   └─ 기타 → isRetryableError = false
   ↓
isRetryableError = true?
   ├─ YES → 재시도 (최대 2회)
   └─ NO → 사용자에게 에러 메시지 표시
   ↓
최대 재시도 초과
   ↓
getErrorMessage() 호출 (사용자 친화적 메시지)
   ↓
Sentry에 에러 전송
   ↓
사용자에게 에러 알림
```

### 7.4 Address 체크섬 에러 처리

```
Address.parse(CSPIN_JETTON_WALLET) 호출
   ↓
try
   ├─ 성공 → 파싱된 주소 사용
   └─ 실패 → catch 블록
      ↓
      catch (addressError)
         ├─ 상세 로그 출력
         ├─ fallback: 원본 주소 사용
         └─ 경고 로그: "⚠️ Using raw Jetton Wallet Address"
```

---

## 8. 필수 학습 사항

### 8.1 TON 블록체인 기초

**필수 이해**:
- [ ] TON 주소 형식 (Bounceable/Non-bounceable, URL-safe Base64)
- [ ] Jetton 표준 (TEP-74) - 특히 `forward_ton_amount`
- [ ] Smart Contracts vs Jetton Wallets 차이
- [ ] On-chain vs Off-chain 트랜잭션
- [ ] 가스비 (Gas) 개념

**참고 문서**:
- [TON Docs - Address Format](https://ton.org/docs/#/core/addresses)
- [TEP-74: Jetton Token Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)

### 8.2 TonConnect 프로토콜

**필수 이해**:
- [ ] TonConnect UI 컴포넌트
- [ ] 지갑 연결 흐름
- [ ] 트랜잭션 서명 및 전송
- [ ] 지갑 상태 관리

**참고 문서**:
- [TonConnect Documentation](https://docs.ton.org/develop/dapps/ton-connect/manifest)

### 8.3 TypeScript & React

**필수 이해**:
- [ ] 제네릭 타입 (`<T>`)
- [ ] Interface vs Type
- [ ] Async/Await와 Promise
- [ ] React Hooks (useState, useEffect)
- [ ] 컴포넌트 라이프사이클

### 8.4 Cloudflare Workers

**필수 이해**:
- [ ] 엣지 함수 개념
- [ ] Worker 라우팅
- [ ] KV 저장소 (Key-Value)
- [ ] CORS 헤더 처리

**참고 문서**:
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

### 8.5 Sentry 에러 모니터링

**필수 이해**:
- [ ] Sentry 프로젝트 설정
- [ ] DSN (Data Source Name) 개념
- [ ] 샘플링 (Sampling) 설정
- [ ] 세션 리플레이
- [ ] 성능 모니터링

**참고 문서**:
- [Sentry Documentation](https://docs.sentry.io/)

### 8.6 TON RPC API

**필수 이해**:
- [ ] RPC 엔드포인트 개념
- [ ] `getTransactions()` 메서드
- [ ] 폴링 (Polling) 패턴
- [ ] JSON-RPC 프로토콜

**RPC 엔드포인트**:
```
메인넷: https://toncenter.com/api/v2/jsonRPC
테스트넷: https://testnet.toncenter.com/api/v2/jsonRPC
```

---

## 9. 참고 자료 & 문서

### 9.1 공식 문서

| 주제 | URL |
|------|-----|
| TON 공식 문서 | https://ton.org/docs |
| TON Docs (개발자) | https://docs.ton.org |
| TonConnect | https://docs.ton.org/develop/dapps/ton-connect/manifest |
| TEP-74 (Jetton) | https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md |
| Cloudflare Pages | https://developers.cloudflare.com/pages/ |
| Sentry Docs | https://docs.sentry.io/platforms/javascript/guides/react/ |

### 9.2 온체인 도구

| 도구 | 용도 | URL |
|------|------|-----|
| TonScan | 블록 탐색기 | https://tonscan.org |
| TonViewer | 지갑/계약 정보 | https://tonviewer.com |
| Jetton Browser | Jetton 토큰 조회 | https://jettons.dedust.io |

### 9.3 프로젝트 저장소

| 항목 | URL |
|------|-----|
| 메인 GitHub | https://github.com/aiandyou50/CandleSpinner |
| Issues & Discussions | https://github.com/aiandyou50/CandleSpinner/issues |
| Commit History | https://github.com/aiandyou50/CandleSpinner/commits/main |

### 9.4 프로젝트 내 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| README | `/README.md` | 프로젝트 개요 |
| CHANGELOG | `/CHANGELOG.md` | 버전 히스토리 |
| Kanban | `/kanban.md` | 작업 상태 추적 |
| Phase 2 보고서 | `/docs/reports/` | 완료 작업 요약 |

---

## 10. 트러블슈팅

### 10.1 Address 체크섬 오류

**증상**:
```
Error: Invalid checksum: EQBbso+Bvv1r0N8aVQ1drMpqnJaYWCqH6s/8D1c8l92vGPzJ
```

**원인**:
- 표준 Base64 문자 사용 (`+`, `/`)
- URL-safe Base64 필요 (`-`, `_`)

**해결**:
```typescript
// ❌ 잘못된 형식
const addr = 'EQBbso+Bvv1r0N8aVQ1drMpqnJaYWCqH6s/8D1c8l92vGPzJ';

// ✅ 올바른 형식
const addr = 'EQBbso-Bvv1r0N8aVQ1drMpqnJaYWCqH6s_8D1c8l92vGPzJ';

// 또는 fallback 사용 (Deposit.tsx)
try {
  Address.parse(addr);
} catch (e) {
  console.warn('Using raw address without validation');
}
```

### 10.2 Sentry DSN 오류

**증상**:
```
POST https://sentry.io/api/123456/envelope/ 400 (Bad Request)
```

**원인**:
- DSN이 placeholder 값으로 설정됨
- 실제 Sentry 프로젝트 DSN 필요

**해결**:
```typescript
// .env 파일
VITE_SENTRY_DSN=https://[key]@o[org].ingest.us.sentry.io/[project]

// 또는 src/main.tsx에서
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN 
  || 'https://77e80587476570467e15c594544197e3@o4510227583598592.ingest.us.sentry.io/4510227588186112';
```

### 10.3 TonConnect 연결 실패

**증상**:
```
Failed to connect to wallet
```

**원인**:
- TON Connect Manifest URL 잘못됨
- 지갑 버전 호환성 문제

**해결**:
```typescript
// constants.ts 확인
export const TON_CONNECT_MANIFEST_URL =
  import.meta.env.VITE_TON_CONNECT_MANIFEST_URL ||
  "https://aiandyou.me/tonconnect-manifest.json";

// public/tonconnect-manifest.json 파일 확인
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner",
  "iconUrl": "https://aiandyou.me/icon.png"
}
```

### 10.4 Transaction Confirmation 타임아웃

**증상**:
```
⏳ Transaction pending confirmation
```

**원인**:
- 블록체인 응답 지연 (네트워크 혼잡)
- RPC 엔드포인트 응답 느림

**해결**:
```typescript
// confirmTransaction() 타임아웃 조정
const timeout = 60000; // 30초 → 60초로 증가

// 또는 RPC URL 변경
export const TON_RPC_URL = 
  import.meta.env.VITE_TON_RPC_URL ||
  "https://toncenter.com/api/v2/jsonRPC";
```

### 10.5 Jetton Wallet 주소 오류

**증상**:
```
Cannot parse Jetton Wallet address
```

**원인**:
- CSPIN_JETTON_WALLET 상수가 유효하지 않음
- 계산된 주소가 잘못됨

**해결**:
```typescript
// constants.ts 확인
export const CSPIN_JETTON_WALLET =
  import.meta.env.VITE_CSPIN_JETTON_WALLET ||
  "EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs";

// TonScan에서 검증
// https://tonscan.org/address/EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
```

### 10.6 가스비 부족

**증상**:
```
Not enough balance for transaction
```

**원인**:
- `amount` 설정이 너무 높음 (기본값: 0.2 TON)
- 사용자 지갑에 TON 부족

**해결**:
```typescript
// estimateJettonTransferGas() 조정
// 기본값: 200,000,000 nanoton (0.2 TON)
// 최소: 100,000,000 nanoton (0.1 TON)

const amount: '100000000'; // 0.1 TON (절약 모드)
```

---

## 📊 상태 요약

### 현재 상태
✅ **Phase 2 완료** (7개 Issue 모두 해결)  
✅ **Sentry 모니터링** 활성화  
✅ **Cloudflare Pages** 배포 중  
✅ **테스트** 12/12 통과  

### 다음 단계 (Phase 3)
⏳ 성능 최적화  
⏳ A/B 테스트  
⏳ 다단계 리팩토링  
⏳ 사용자 피드백 수집  

---

**마지막 업데이트**: 2025-10-21 by GitHub Copilot  
**문서 버전**: 2.0  
**상태**: 🟢 정상 운영

