# CandleSpinner MVP v2 - 완성본 아카이브

**작성일**: 2025-11-02  
**버전**: MVP v2.0 (완성)  
**상태**: ✅ 프로덕션 배포 완료

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [빠른 시작](#빠른-시작)
4. [핵심 기능](#핵심-기능)
5. [배포 가이드](#배포-가이드)
6. [문제 해결](#문제-해결)
7. [학습 자료](#학습-자료)

---

## 🎯 프로젝트 개요

### 무엇을 만들었나?

**CandleSpinner**: TON 블록체인 기반 슬롯머신 게임

- **입금**: CSPIN 토큰을 게임 크레딧으로 전환
- **게임**: 크레딧으로 슬롯머신 플레이
- **인출**: 크레딧을 CSPIN 토큰으로 출금
- **관리**: 인출 요청 관리 대시보드

### 왜 이 방식인가?

**문제**: TON 블록체인에서 게임→사용자 토큰 전송 불가능

**이유**:
```
Jetton Transfer는 서명자의 토큰만 전송 가능 (TEP-74 표준)

입금: 사용자 서명 → ✅ 가능
인출: 게임 서명 필요 → ❌ Cloudflare Workers에서 불가능
```

**해결**:
1. **입금**: 자동 (블록체인 검증)
2. **인출**: 수동 (관리자가 직접 처리)

### 기술 스택

| 구분 | 기술 | 이유 |
|------|------|------|
| **프론트엔드** | React + TypeScript + Vite | 빠른 개발, 타입 안정성 |
| **UI** | Tailwind CSS | 반응형 디자인 |
| **블록체인** | TON Connect | 지갑 연결 표준 |
| **백엔드** | Cloudflare Workers | 서버리스, 저비용 |
| **스토리지** | Cloudflare KV | 크레딧 저장 |
| **배포** | Cloudflare Workers | 자동 배포, CDN |

---

## 🏗️ 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자 (React App)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  입금    │  │   게임   │  │  인출    │  │   관리자    │  │
│  │ Deposit  │  │   Slot   │  │ Withdraw │  │    Admin    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
└───────┼─────────────┼─────────────┼────────────────┼─────────┘
        │             │             │                │
        │ TON Connect │ API         │ API            │ API
        ↓             ↓             ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers (src/index.ts)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API 라우팅                                          │   │
│  │  - /api/verify-deposit   (입금 확인)                │   │
│  │  - /api/spin             (게임 실행)                │   │
│  │  - /api/withdraw-request (인출 요청)                │   │
│  │  - /api/admin/*          (관리자 기능)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cloudflare KV (크레딧 스토리지)                     │   │
│  │  - credit:{address}     → { credit: 100 }            │   │
│  │  - withdrawal:{id}      → { amount, status, ... }    │   │
│  │  - withdrawals:pending  → [id1, id2, ...]            │   │
│  │  - nonce:{uuid}         → "used" (보안)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │                                           ↑
        │ 블록체인 조회                             │ 수동 전송
        ↓                                           │
┌─────────────────────────────────────────────────────────────┐
│                    TON 블록체인                              │
│  ┌──────────────┐          ┌──────────────┐                 │
│  │  CSPIN 토큰  │  ←→      │  게임 지갑   │                 │
│  │  (Jetton)    │          │  (Wallet)    │                 │
│  └──────────────┘          └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 입금 흐름 (자동)

```
1. [사용자] TON Connect로 트랜잭션 생성
   - destination: 게임 Jetton Wallet 주소
   - amount: 100 CSPIN
   - forward_ton_amount: 0.2 TON

2. [사용자] 지갑에서 트랜잭션 서명 및 전송

3. [블록체인] 트랜잭션 처리 (5-10초)

4. [프론트엔드] 백엔드에 트랜잭션 해시 전송
   POST /api/verify-deposit
   { txHash: "abc123..." }

5. [백엔드] TON Center API로 트랜잭션 검증
   - 발신자 = 사용자 주소?
   - 수신자 = 게임 Jetton Wallet?
   - 금액 = 100 CSPIN?

6. [백엔드] 검증 성공 → 크레딧 추가
   KV: credit:{address} = { credit: 100 }

7. [프론트엔드] 크레딧 갱신 표시
```

### 인출 흐름 (수동)

```
1. [사용자] 인출 요청
   - amount: 50 CSPIN
   - timestamp: Date.now()
   - nonce: crypto.randomUUID()

2. [백엔드] 보안 검증
   ✅ 타임스탬프 5분 이내?
   ✅ 논스 중복 없음?
   ✅ 크레딧 충분?

3. [백엔드] 크레딧 차감 + 대기열 추가
   KV: credit:{address} -= 50
   KV: withdrawal:{id} = { amount: 50, status: "pending", ... }

4. [사용자] "12~24시간 처리" 안내

--- 관리자 처리 ---

5. [관리자] /admin 페이지 접속
   - 게임 운영자 지갑으로 인증

6. [관리자] 대기 목록 확인
   GET /api/admin/pending-withdrawals

7. [관리자] TON Connect로 토큰 전송
   - 각 인출 건마다 수동 트랜잭션

8. [관리자] [✅ 처리] 버튼 클릭
   POST /api/admin/mark-processed
   { withdrawalId: "..." }

9. [백엔드] 상태 업데이트
   KV: withdrawal:{id}.status = "completed"
```

---

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.dev.vars)
GAME_WALLET_MNEMONIC="word1 word2 ... word24"
GAME_WALLET_ADDRESS="UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
CSPIN_JETTON_MASTER="EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
CSPIN_JETTON_WALLET="EQD6zAw4rXWKLdYDgT4ITvW1FaNuNAE8pFST_h0OjBpXALjY"
TONCENTER_API_KEY="your_api_key_here"
```

### 2. 로컬 개발

```bash
# 프론트엔드 개발 서버 (포트 3000)
npm run dev

# 백엔드 개발 서버 (포트 8787)
npx wrangler dev
```

### 3. 빌드 및 배포

```bash
# 빌드
npm run build

# Cloudflare Workers 배포
npx wrangler deploy
```

---

## 🔑 핵심 기능

### 1. 입금 (Deposit.tsx)

**목표**: CSPIN 토큰 → 게임 크레딧

**핵심 코드**:
```typescript
// TEP-74 표준 Jetton Transfer
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{
    address: GAME_JETTON_WALLET,  // 게임의 Jetton Wallet
    amount: '200000000',  // 0.2 TON (gas)
    payload: beginCell()
      .storeUint(0xf8a7ea5, 32)  // op::transfer
      .storeUint(0, 64)  // query_id
      .storeCoins(depositAmount)  // Jetton amount
      .storeAddress(Address.parse(GAME_WALLET_ADDRESS))  // destination
      .storeAddress(Address.parse(walletAddress))  // response_destination
      .storeBit(0)  // custom_payload
      .storeCoins(toNano('0.05'))  // forward_ton_amount
      .storeBit(0)  // forward_payload
      .endCell()
      .toBoc()
      .toString('base64')
  }]
};

await tonConnectUI.sendTransaction(transaction);
```

**시행착오**:
- ❌ destination을 GAME_WALLET_ADDRESS로 설정 → 토큰 손실
- ✅ destination을 GAME_JETTON_WALLET로 수정 → 정상 작동

**검증 로직**:
```typescript
// src/index.ts - handleVerifyDeposit
const tx = await toncenterClient.getTransaction(txHash);

// 1. 발신자 확인
if (tx.in_msg?.source !== walletAddress) {
  return error('Wrong sender');
}

// 2. 수신자 확인 (게임 Jetton Wallet)
if (tx.in_msg?.destination !== CSPIN_JETTON_WALLET) {
  return error('Wrong destination');
}

// 3. 금액 확인
const jettonAmount = parseJettonTransfer(tx.in_msg?.body);
if (jettonAmount < expectedAmount) {
  return error('Insufficient amount');
}

// 4. 크레딧 추가
await env.CREDIT_KV.put(`credit:${walletAddress}`, JSON.stringify({
  credit: currentCredit + jettonAmount
}));
```

### 2. 인출 (Withdraw.tsx)

**목표**: 게임 크레딧 → CSPIN 토큰

**왜 수동인가?**:
```
문제: 게임 지갑이 Cloudflare Workers에서 트랜잭션 서명 불가
이유: @ton/ton 라이브러리가 window 객체 필요 (브라우저 전용)

시도한 방법:
1. ❌ 백엔드 RPC: "window is not defined"
2. ❌ 프론트엔드 TON Connect: 사용자가 서명 → 사용자→게임 (반대 방향)
3. ✅ 수동 처리: 크레딧 차감 + 대기열 + 관리자 처리
```

**핵심 코드**:
```typescript
// Withdraw.tsx - 보안 토큰 생성
const timestamp = Date.now();
const nonce = crypto.randomUUID();

const withdrawRequest = {
  action: 'withdraw',
  amount: withdrawAmount,
  userAddress: walletAddress,
  timestamp,
  nonce
};

// src/index.ts - handleWithdrawRequest
// 1. 타임스탬프 검증 (5분)
const age = Date.now() - body.timestamp;
if (age > 300000 || age < 0) {
  return error('Request expired');
}

// 2. 논스 중복 확인 (리플레이 공격 방지)
const nonceKey = `nonce:${body.nonce}`;
const existingNonce = await env.CREDIT_KV.get(nonceKey);
if (existingNonce) {
  return error('Duplicate request');
}

// 3. 논스 저장 (10분 TTL)
await env.CREDIT_KV.put(nonceKey, 'used', { expirationTtl: 600 });

// 4. 크레딧 차감
const newCredit = currentCredit - body.amount;
await env.CREDIT_KV.put(`credit:${body.userAddress}`, JSON.stringify({
  credit: newCredit
}));

// 5. 대기열 추가
const withdrawalId = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
await env.CREDIT_KV.put(`withdrawal:${withdrawalId}`, JSON.stringify({
  id: withdrawalId,
  walletAddress: body.userAddress,
  amount: body.amount,
  status: 'pending',
  requestedAt: new Date().toISOString()
}));
```

### 3. 관리자 대시보드 (AdminWithdrawals.tsx)

**목표**: 인출 요청 관리 및 처리

**인증 로직**:
```typescript
const { isConnected, walletAddress } = useTonConnect();

// 게임 운영자 지갑 확인
const isAdminWallet = isConnected && 
  walletAddress?.toLowerCase() === GAME_WALLET_ADDRESS.toLowerCase();

if (!isConnected) {
  return <div>🔐 관리자 인증 필요</div>;
}

if (!isAdminWallet) {
  return (
    <div>
      <p>❌ 접근 권한 없음</p>
      <p>현재: {walletAddress}</p>
      <p>필요: {GAME_WALLET_ADDRESS}</p>
    </div>
  );
}
```

**인출 처리 흐름**:
```typescript
// 1. 대기 목록 조회
const response = await fetch('/api/admin/pending-withdrawals');
const withdrawals = await response.json();

// 2. TON Connect로 토큰 전송 (수동)
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{
    address: GAME_JETTON_WALLET,
    amount: '200000000',  // 0.2 TON
    payload: createJettonTransferPayload({
      jettonAmount: withdrawal.amount,
      destination: withdrawal.walletAddress,  // 사용자
      responseDestination: GAME_WALLET_ADDRESS
    })
  }]
};

await tonConnectUI.sendTransaction(transaction);

// 3. 처리 완료 표시
await fetch('/api/admin/mark-processed', {
  method: 'POST',
  body: JSON.stringify({ withdrawalId: withdrawal.id })
});
```

---

## 📦 배포 가이드

### Cloudflare Workers 배포

#### 1. 환경 변수 설정

**Cloudflare Dashboard**:
```
1. https://dash.cloudflare.com/workers
2. candlespinner-workers → Settings → Variables
3. Secrets 추가:
   - GAME_WALLET_MNEMONIC (보안)
   - GAME_WALLET_ADDRESS
   - CSPIN_JETTON_MASTER
   - CSPIN_JETTON_WALLET
   - TONCENTER_API_KEY
```

**또는 CLI**:
```bash
npx wrangler secret put GAME_WALLET_MNEMONIC
npx wrangler secret put TONCENTER_API_KEY
```

#### 2. KV Namespace 생성

```bash
# KV 생성
npx wrangler kv:namespace create CREDIT_KV

# 출력된 ID를 wrangler.toml에 추가
[[kv_namespaces]]
binding = "CREDIT_KV"
id = "your_kv_id_here"
```

#### 3. 배포

```bash
# 빌드
npm run build

# 배포
npx wrangler deploy
```

**출력**:
```
Deployed candlespinner-workers triggers
  https://candlespinner-workers.your-subdomain.workers.dev
Current Version ID: abc123...
```

#### 4. 커스텀 도메인 설정

```
1. Cloudflare Dashboard → Workers → candlespinner-workers
2. Triggers → Custom Domains
3. Add Custom Domain: aiandyou.me
4. DNS 자동 설정 완료
```

---

## 🐛 문제 해결

### 자주 발생하는 오류

#### 1. Error 1101 - Worker threw exception

**증상**: /admin 접속 시 Error 1101

**원인**: `env.ASSETS`가 undefined

**해결**:
```toml
# wrangler.toml
[assets]
directory = "./dist"
binding = "ASSETS"  # 명시적 바인딩 추가
```

```typescript
// src/index.ts - ASSETS 에러 핸들링
if (!env.ASSETS) {
  return new Response('ASSETS binding not configured', { status: 500 });
}
```

#### 2. "window is not defined"

**증상**: 백엔드에서 @ton/ton 사용 시 오류

**원인**: Cloudflare Workers는 브라우저 환경 아님

**해결**: ❌ 백엔드에서 트랜잭션 생성 불가능
→ ✅ 프론트엔드(TON Connect) 또는 수동 처리

#### 3. 입금 후 토큰 손실

**증상**: 입금했는데 크레딧 증가 안 됨, 토큰도 사라짐

**원인**: destination을 GAME_WALLET_ADDRESS로 설정

**해결**:
```typescript
// ❌ 잘못된 코드
const transaction = {
  messages: [{
    address: GAME_JETTON_WALLET,
    payload: beginCell()
      .storeAddress(Address.parse(GAME_WALLET_ADDRESS))  // ❌ 잘못됨!
      .endCell()
  }]
};

// ✅ 올바른 코드
const transaction = {
  messages: [{
    address: GAME_JETTON_WALLET,
    payload: beginCell()
      .storeAddress(Address.parse(GAME_JETTON_WALLET))  // ✅ 올바름!
      .endCell()
  }]
};
```

#### 4. 인출 시 사용자→게임 방향

**증상**: 인출했는데 토큰이 빠져나감 (입금과 동일)

**원인**: TON Connect는 사용자가 서명 → 사용자→게임 방향

**해결**: 수동 인출 시스템 (관리자가 게임 지갑으로 서명)

#### 5. 리플레이 공격

**증상**: 동일한 인출 요청을 여러 번 전송

**해결**:
```typescript
// 타임스탬프 + 논스 검증
const age = Date.now() - body.timestamp;
if (age > 300000) {  // 5분
  return error('Request expired');
}

const nonceKey = `nonce:${body.nonce}`;
const existing = await env.CREDIT_KV.get(nonceKey);
if (existing) {
  return error('Duplicate request');
}

await env.CREDIT_KV.put(nonceKey, 'used', { expirationTtl: 600 });
```

---

## 📚 학습 자료

### TEP-74: Jetton Standard

**필수 이해 사항**:
1. Jetton Transfer는 **서명자의 토큰만** 전송 가능
2. destination은 **Jetton Wallet 주소**, 아님 일반 주소
3. forward_ton_amount는 **알림용 TON**

**Payload 구조**:
```typescript
beginCell()
  .storeUint(0xf8a7ea5, 32)  // op::transfer
  .storeUint(0, 64)  // query_id
  .storeCoins(amount)  // Jetton amount
  .storeAddress(destination)  // Jetton Wallet 주소!
  .storeAddress(response_destination)
  .storeBit(0)  // custom_payload
  .storeCoins(forward_ton_amount)  // 0.05 TON
  .storeBit(0)  // forward_payload
  .endCell()
```

### Cloudflare Workers

**제약사항**:
- ❌ window, document 등 브라우저 API 없음
- ❌ @ton/ton 라이브러리 사용 불가
- ✅ Fetch API, Crypto API 사용 가능
- ✅ KV 스토리지 사용 가능

**ASSETS 바인딩**:
```toml
[assets]
directory = "./dist"
binding = "ASSETS"
```

```typescript
// SPA 리디렉션
if (!url.pathname.startsWith('/api')) {
  const indexRequest = new Request(new URL('/', url), request);
  return env.ASSETS.fetch(indexRequest);
}
```

### TON Connect

**트랜잭션 전송**:
```typescript
const [tonConnectUI] = useTonConnectUI();

await tonConnectUI.sendTransaction({
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{ address, amount, payload }]
});
```

**지갑 상태**:
```typescript
const { isConnected, walletAddress } = useTonConnect();
```

---

## 🎯 다음 단계

### MVP → 메인넷

#### 1. 자동 인출 구현

**방법 A**: Node.js 서버 추가
```
[Cloudflare Workers] → [Node.js Server] → [TON 블록체인]
- Node.js에서 @ton/ton 사용 가능
- 비용: $20~50/월
```

**방법 B**: 스마트 컨트랙트
```
[사용자] → [스마트 컨트랙트] → [자동 토큰 전송]
- 온체인 검증
- 배포 비용: ~5 TON
```

#### 2. 크레딧 수수료

```typescript
const FEE_CSPIN = 5;  // 5 CSPIN 수수료

if (current.credit < body.amount + FEE_CSPIN) {
  return error('Insufficient credit');
}

const newCredit = current.credit - body.amount - FEE_CSPIN;
```

**효과**: 게임 수익 발생, 비용 절감

#### 3. 최소 인출 금액

```typescript
const MIN_WITHDRAW = 50;  // 50 CSPIN

if (body.amount < MIN_WITHDRAW) {
  return error(`Minimum: ${MIN_WITHDRAW} CSPIN`);
}
```

**효과**: 인출 건수 감소 (80% 절감)

---

## 📁 파일 구조

```
archive/mvp-v2-완성본/
├── src/
│   ├── index.ts              ← Cloudflare Workers 엔트리
│   ├── App.tsx               ← React Router 설정
│   ├── main.tsx              ← React 엔트리
│   ├── constants.ts          ← 상수 (주소, 금액)
│   ├── components/
│   │   ├── Deposit.tsx       ← 입금 컴포넌트
│   │   ├── Withdraw.tsx      ← 인출 컴포넌트
│   │   ├── AdminWithdrawals.tsx  ← 관리자 대시보드
│   │   └── WalletConnect.tsx ← TON Connect
│   ├── hooks/
│   │   ├── useCredit.ts      ← 크레딧 관리
│   │   └── useTonConnect.ts  ← TON Connect 훅
│   └── utils/
│       ├── logger.ts         ← 디버그 로깅
│       └── jetton.ts         ← Jetton 유틸리티
├── functions/
│   └── src/
│       └── withdraw-handler.ts  ← 인출 핸들러 (미사용)
├── public/
│   ├── icon.png
│   └── tonconnect-manifest.json
├── package.json              ← 의존성
├── tsconfig.json             ← TypeScript 설정
├── vite.config.ts            ← Vite 빌드 설정
├── wrangler.toml             ← Cloudflare Workers 설정
├── tailwind.config.js        ← Tailwind CSS
└── index.html                ← HTML 엔트리
```

---

## ✅ 체크리스트

### 새 개발자/AI가 확인할 사항

- [ ] TEP-74 표준 이해 (Jetton Transfer)
- [ ] Cloudflare Workers 제약사항 이해
- [ ] destination = Jetton Wallet 주소 (중요!)
- [ ] 수동 인출의 필요성 이해
- [ ] ASSETS 바인딩 설정 (wrangler.toml)
- [ ] 환경 변수 설정 (Secrets)
- [ ] KV Namespace 생성 및 바인딩
- [ ] 보안 검증 (타임스탬프 + 논스)
- [ ] React Router SPA 리디렉션
- [ ] TON Connect 지갑 인증

### 배포 전 확인

- [ ] npm run build 성공
- [ ] dist/_routes.json 생성 확인
- [ ] .dev.vars 환경 변수 설정
- [ ] wrangler.toml KV ID 설정
- [ ] Cloudflare Dashboard Secrets 설정
- [ ] npx wrangler deploy 성공
- [ ] https://your-domain.me 접속 테스트
- [ ] https://your-domain.me/admin 접속 테스트
- [ ] 입금 테스트 (테스트넷)
- [ ] 인출 요청 테스트
- [ ] 관리자 처리 테스트

---

## 🎉 완성!

이 문서와 코드만으로 동일한 시스템을 구현할 수 있습니다.

**핵심 교훈**:
1. **TEP-74**: destination은 Jetton Wallet 주소
2. **Cloudflare Workers**: @ton/ton 사용 불가
3. **인출**: 수동 처리가 MVP 최적해
4. **보안**: 타임스탬프 + 논스 검증 필수
5. **SPA**: ASSETS 바인딩 + 리디렉션

**시행착오 제로로 구현 가능!** 🚀
