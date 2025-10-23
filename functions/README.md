# ⚙️ Backend - Cloudflare Workers (functions/)

Cloudflare Workers로 구현된 서버리스 백엔드입니다. TON 블록체인 트랜잭션, CSPIN 토큰 관리, 게임 로직 등을 담당합니다.

---

## 📂 폴더 구조

```
functions/
├── README.md                # 본 파일
├── _bufferPolyfill.ts       # Buffer 폴리필 (Node.js 호환성)
├── _rateLimit.ts            # Rate Limiting 구현
├── _headers                 # HTTP 헤더 설정
│
└── 📁 api/                  # API 엔드포인트
    ├── RATE_LIMITING_GUIDE.md
    │
    ├── 💰 입금 (Deposit)
    │   ├── initiate-deposit.ts      # ✅ 입금 시작 (V5R1, SendMode 적용)
    │   ├── deposit.ts               # 입금 완료 처리
    │   ├── deposit-rpc.ts           # RPC 호출
    │   └── credit-deposit.ts        # 크레딧 적용
    │
    ├── 💸 인출 (Withdrawal)
    │   ├── initiate-withdrawal.ts   # ✅ 인출 시작 (V5R1, SendMode 적용)
    │   ├── debug-withdrawal.ts      # 인출 디버그
    │   ├── get-withdrawal-logs.ts   # 인출 기록 조회
    │   └── double-up.ts             # 배팅 가능 금액 계산
    │
    ├── 🎮 게임 로직 (Game Logic)
    │   ├── spin.ts                  # 스핀 결과 계산 (오프체인)
    │   ├── collect-winnings.ts      # 상금 수집
    │   ├── save-game-state.ts       # 게임 상태 저장
    │   └── get-credit.ts            # 크레딧 조회
    │
    ├── 🔐 보안 & 검증 (Security)
    │   ├── generate-wallet.ts       # 지갑 생성 (테스트용, V5R1)
    │   ├── debug-private-key.ts     # ✅ 개인키 검증 (V5R1)
    │   └── check-developer-password.ts # 개발자 모드
    │
    └── 📝 로깅 & 모니터링
        └── (Sentry 통합)
```

---

## 🔄 API 엔드포인트

### 입금 (Deposit) 시리즈

#### POST `/api/initiate-deposit`
**CSPIN 토큰 입금 시작**

**요청:**
```json
{
  "jettonWalletAddress": "EQA...",
  "amount": "1000000000"  // nanoCCSPIN
}
```

**응답:**
```json
{
  "boc": "te6cckECWAEAA/...",
  "hash": "4e6568d1..."
}
```

**구현 위치:** `functions/api/initiate-deposit.ts`

**기술 사항:**
- ✅ WalletContractV5R1 사용
- ✅ SendMode 적용 (PAY_GAS_SEPARATELY | IGNORE_ERRORS)
- ✅ 개인키 Cloudflare 환경변수에서만 로드

---

#### POST `/api/deposit`
입금 거래 완료 처리

---

### 인출 (Withdrawal) 시리즈

#### POST `/api/initiate-withdrawal`
**CSPIN 토큰을 TON으로 변환하여 인출**

**요청:**
```json
{
  "amount": "500000000"  // nanoCCSPIN
}
```

**응답:**
```json
{
  "boc": "te6cckECWAEAA/...",
  "tonAmount": "100000000",  // nanoTON
  "hash": "..."
}
```

**구현 위치:** `functions/api/initiate-withdrawal.ts`

**기술 사항:**
- ✅ WalletContractV5R1 사용
- ✅ SendMode 적용 (PAY_GAS_SEPARATELY | IGNORE_ERRORS)
- ✅ CSPIN ↔ TON 환율 적용

---

#### GET `/api/get-withdrawal-logs`
인출 기록 조회

---

### 게임 로직 (Game Logic)

#### POST `/api/spin`
**스핀 결과 계산 (오프체인)**

**요청:**
```json
{
  "betAmount": "1000000"
}
```

**응답:**
```json
{
  "result": [1, 2, 3],  // 3개 릴 결과 (1-7)
  "winAmount": "0",      // 상금
  "multiplier": 0
}
```

**구현 위치:** `functions/api/spin.ts`

**기술 사항:**
- 순수 오프체인 계산 (빠르고 저비용)
- 온체인 검증 필요 시 나중에 추가

---

#### POST `/api/collect-winnings`
상금 수집 (토큰 전송)

---

### 보안 & 검증

#### POST `/api/debug-private-key`
**개인키 유효성 검증 (테스트용)**

**응답:**
```json
{
  "addressMatches": true,
  "walletVersion": "V5R1",
  "address": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
}
```

**구현 위치:** `functions/api/debug-private-key.ts`

**⚠️ 주의:** 프로덕션에서는 비활성화 권장

---

#### POST `/api/generate-wallet`
**새로운 V5R1 지갑 생성 (테스트용)**

---

## 🔐 보안 설정

### Cloudflare 환경변수 (필수)

**URL:** https://dash.cloudflare.com/Pages/candlespinner/Settings/Environment-variables

**Production 환경:**
```
GAME_WALLET_PRIVATE_KEY = [128-char hex value]
```

**코드에서의 사용:**
```typescript
// ✅ 올바름
const privateKey = env.GAME_WALLET_PRIVATE_KEY;

// ❌ 절대 금지
const privateKey = "4e6568d1...";  // 하드코딩 금지
```

---

### Rate Limiting

API 남용 방지를 위해 Rate Limiting 구현됨.

**설정 위치:** `functions/_rateLimit.ts`

**참고:** `functions/api/RATE_LIMITING_GUIDE.md`

---

## 📝 구현 기준

### WalletContractV5R1 사용 (V4 금지)

**모든 지갑 관련 API에서 V5R1 사용 필수:**

```typescript
// ✅ 올바름
import { WalletContractV5R1 } from '@ton/ton';

const wallet = WalletContractV5R1.create({
  publicKey: keyPair.publicKey,
  workchain: 0
});

// ❌ 금지
import { WalletContractV4 } from '@ton/ton';  // 사용 금지
```

---

### SendMode 설정

**모든 메시지 전송 시 다음 SendMode 적용:**

```typescript
// ✅ 올바름
const transfer = wallet.createTransfer({
  seqno,
  secretKey: keyPair.secretKey,
  messages: [transferMessage],
  sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS
});

// ❌ 잘못된 설정
sendMode: SendMode.PAY_GAS_SEPARATELY  // 단독 사용 금지
```

**SendMode 의미:**
- `PAY_GAS_SEPARATELY`: 가스비 별도 차감
- `IGNORE_ERRORS`: 실패 시에도 계속 진행

---

## 🚀 배포 & 테스트

### 로컬 개발
```bash
# Wrangler로 로컬 테스트
npm run dev

# API 테스트
curl http://localhost:8787/api/debug-private-key
```

### 프로덕션 배포
```bash
# 빌드 & 배포
npm run deploy

# Cloudflare Pages에 자동 배포
```

---

## 📊 에러 처리

모든 API는 다음 형식의 에러 응답을 반환합니다:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-23T12:34:56Z"
}
```

**예시:**
```json
{
  "error": "Invalid private key format",
  "code": "INVALID_KEY",
  "timestamp": "2025-10-23T12:34:56Z"
}
```

---

## 🔍 트러블슈팅

### Q: "Invalid private key" 에러
**A:** Cloudflare 환경변수 확인
```bash
# Wrangler로 환경변수 확인
wrangler secret list
```

### Q: "Wallet version mismatch"
**A:** WalletContractV5R1 사용 확인
```typescript
// ❌ 잘못됨
WalletContractV4  // 사용 금지

// ✅ 올바름
WalletContractV5R1  // 필수
```

### Q: "SendMode 오류"
**A:** SendMode 비트 조합 확인
```typescript
// ❌ 잘못됨
sendMode: SendMode.PAY_GAS_SEPARATELY  // 단독 사용

// ✅ 올바름
sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS  // 비트 OR 조합
```

---

## 📚 참고

- **TON SDK**: https://ton.org/docs/#/dev/tutorial
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **TonWeb**: https://github.com/toncenter/tonweb
- **Jetton 표준**: https://github.com/ton-blockchain/TEPs/blob/main/text/0074-jettons-standard.md

---

**마지막 업데이트:** 2025-10-23  
**핵심 기술:** Cloudflare Workers + TON SDK + V5R1  
**배포 상태:** 🟢 Production Ready

