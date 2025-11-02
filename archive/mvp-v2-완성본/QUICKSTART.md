# MVP v2 아카이빙 완성본 - 빠른 참조 가이드

**배포 완료일**: 2025-11-02  
**상태**: ✅ 프로덕션 운영 중

---

## 📂 폴더 구조

```
archive/mvp-v2-완성본/
├── README.md                    ← 시작은 여기서!
├── docs/
│   ├── 01-입금-구현-가이드.md
│   ├── 02-인출-구현-가이드.md
│   ├── 03-배포-가이드.md
│   └── 04-시행착오-및-해결책.md
├── src/                         ← 프론트엔드 + 백엔드
│   ├── index.ts                 ← Cloudflare Workers 엔트리
│   ├── App.tsx                  ← React Router
│   ├── components/
│   │   ├── Deposit.tsx          ← 입금 (TEP-74)
│   │   ├── Withdraw.tsx         ← 인출 (수동)
│   │   └── AdminWithdrawals.tsx ← 관리자 대시보드
│   └── ...
├── functions/                   ← 백엔드 핸들러 (미사용)
├── public/                      ← 정적 파일
├── package.json
├── tsconfig.json
├── vite.config.ts              ← _routes.json 자동 생성
├── wrangler.toml               ← Cloudflare Workers 설정
└── .gitignore
```

---

## 🚀 5분 만에 시작하기

### 1. 문서 읽기 (필수!)

```
1. README.md              (프로젝트 전체 개요)
2. 01-입금-구현-가이드.md  (TEP-74 이해)
3. 02-인출-구현-가이드.md  (수동 시스템 이해)
4. 04-시행착오-및-해결책.md (실수 방지)
```

### 2. 환경 설정

```bash
npm install

# .dev.vars 생성
GAME_WALLET_MNEMONIC="word1 word2 ... word24"
GAME_WALLET_ADDRESS="UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
CSPIN_JETTON_MASTER="EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
CSPIN_JETTON_WALLET="EQD6zAw4rXWKLdYDgT4ITvW1FaNuNAE8pFST_h0OjBpXALjY"
TONCENTER_API_KEY="your_api_key"
```

### 3. 로컬 실행

```bash
npm run dev        # 프론트엔드 (포트 3000)
npx wrangler dev   # 백엔드 (포트 8787)
```

### 4. 배포

```bash
npm run build
npx wrangler deploy
```

**배포 가이드**: `docs/03-배포-가이드.md`

---

## ⚠️ 반드시 알아야 할 3가지

### 1. destination은 Jetton Wallet 주소!

```typescript
// ❌ 절대 이렇게 하지 마세요!
.storeAddress(Address.parse(GAME_WALLET_ADDRESS))

// ✅ 이렇게 해야 합니다
.storeAddress(Address.parse(GAME_JETTON_WALLET))
```

**이유**: 잘못하면 토큰 영구 손실!

### 2. @ton/ton은 프론트엔드 전용!

```typescript
// ❌ Cloudflare Workers에서 사용 불가
import { mnemonicToPrivateKey } from '@ton/crypto';
// Error: "window is not defined"

// ✅ 프론트엔드에서만 사용
// src/components/Deposit.tsx
import { Address, beginCell } from '@ton/ton';
```

### 3. 인출은 수동 처리!

```
자동 인출 불가능한 이유:
- Jetton Transfer는 서명자의 토큰만 전송
- 게임→사용자는 게임이 서명해야 함
- Cloudflare Workers에서 서명 불가능

해결: 수동 인출 시스템
1. 사용자: 인출 요청
2. 백엔드: 크레딧 차감 + 대기열
3. 관리자: 수동으로 토큰 전송
```

---

## 🎯 핵심 파일

### 입금: src/components/Deposit.tsx
```typescript
// TEP-74 Jetton Transfer
const payload = beginCell()
  .storeUint(0xf8a7ea5, 32)  // op::transfer
  .storeCoins(amount)
  .storeAddress(GAME_JETTON_WALLET)  // ⚠️ Jetton Wallet!
  .storeCoins(toNano('0.05'))  // forward_ton_amount
  .endCell();
```

### 인출: src/components/Withdraw.tsx
```typescript
// 보안 토큰 생성
const timestamp = Date.now();
const nonce = crypto.randomUUID();

// 백엔드에 요청
await fetch('/api/withdraw-request', {
  body: JSON.stringify({ 
    action: 'withdraw',
    amount,
    userAddress,
    timestamp,
    nonce
  })
});
```

### 관리자: src/components/AdminWithdrawals.tsx
```typescript
// 게임 운영자 인증
const isAdmin = walletAddress === GAME_WALLET_ADDRESS;

// 대기 목록 조회
const withdrawals = await fetch('/api/admin/pending-withdrawals');

// 수동 처리 (TON Connect)
await tonConnectUI.sendTransaction({ ... });
```

---

## 🐛 자주 묻는 질문

### Q1. "destination을 뭘로 해야 하나요?"
**A**: `GAME_JETTON_WALLET` (Jetton 지갑 주소)
- ❌ GAME_WALLET_ADDRESS (일반 지갑) → 토큰 손실!

### Q2. "백엔드에서 트랜잭션 생성이 안 돼요"
**A**: Cloudflare Workers에서 @ton/ton 사용 불가
- 프론트엔드(TON Connect) 또는 Node.js 서버 필요

### Q3. "인출 시 토큰이 빠져나가요"
**A**: TON Connect는 사용자가 서명
- 사용자 서명 = 사용자→게임 (입금)
- 게임→사용자는 게임이 서명해야 함 (수동 처리)

### Q4. "/admin 접속 시 Error 1101"
**A**: ASSETS 바인딩 누락
```toml
[assets]
directory = "./dist"
binding = "ASSETS"  ← 추가!
```

### Q5. "리플레이 공격은 어떻게 막나요?"
**A**: 타임스탬프 + 논스 검증
```typescript
// 5분 이내 확인
if (Date.now() - timestamp > 300000) error();

// 논스 중복 확인
if (await kv.get(`nonce:${nonce}`)) error();

// 논스 저장 (10분 TTL)
await kv.put(`nonce:${nonce}`, 'used', { expirationTtl: 600 });
```

---

## 📚 추가 학습 자료

### TON 블록체인
- TEP-74: https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
- TON Docs: https://docs.ton.org/

### Cloudflare Workers
- Docs: https://developers.cloudflare.com/workers/
- Assets: https://developers.cloudflare.com/workers/static-assets/

### React + TypeScript
- React Router: https://reactrouter.com/
- TON Connect: https://docs.ton.org/develop/dapps/ton-connect/

---

## ✅ 체크리스트

### 코드 작성
- [ ] 04-시행착오-및-해결책.md 읽기 (필수!)
- [ ] destination = GAME_JETTON_WALLET 확인
- [ ] forward_ton_amount >= 0.05 TON
- [ ] @ton/ton 프론트엔드만 사용
- [ ] 타임스탬프 + 논스 검증

### 배포
- [ ] 03-배포-가이드.md 따라하기
- [ ] wrangler.toml 설정
- [ ] 환경 변수 Secrets 설정
- [ ] KV Namespace 생성
- [ ] npm run build 성공
- [ ] npx wrangler deploy 성공

### 테스트
- [ ] 테스트넷에서 입금
- [ ] 테스트넷에서 인출 요청
- [ ] 관리자 인증
- [ ] 관리자 처리
- [ ] 메인넷 배포

---

## 🎉 성공!

**이 아카이브만 있으면**:
- ✅ 시행착오 없이 구현 가능
- ✅ 동일한 실수 방지
- ✅ 빠른 이해 및 확장

**새 개발자/AI에게**:
1. README.md부터 읽기
2. 각 기능별 가이드 순서대로 읽기
3. 04-시행착오 꼭 읽기 (중요!)
4. 테스트넷에서 충분히 테스트
5. 메인넷 신중하게 배포

**Happy Coding!** 🚀
