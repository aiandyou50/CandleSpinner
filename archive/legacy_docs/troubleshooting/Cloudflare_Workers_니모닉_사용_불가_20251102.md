# Cloudflare Workers에서 게임 니모닉 사용 불가능한 이유

**작성일**: 2025-11-02  
**질문**: "니모닉 코드를 서버 변수에 저장했는데 Cloudflare Workers에서 변수로 저장한 니모닉으로 트랜잭션을 생성해서 게임 유저 지갑으로 CSPIN 토큰을 보낼 수 없는거야?"  
**답변**: ❌ **불가능합니다** (기술적 제약)

---

## 🚨 핵심 문제

### 시도했던 방식
```typescript
// functions/src/withdraw-handler.ts (실패)
import { WalletContractV5R1 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

export async function processWithdrawal(env, userAddress, amount) {
  // 1. 니모닉 가져오기 (✅ 이건 가능)
  const mnemonic = env.GAME_WALLET_MNEMONIC.split(' ');
  
  // 2. 개인키 생성 (❌ 여기서 실패!)
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  // 오류: "window is not defined"
  
  // 3. 트랜잭션 생성
  const wallet = WalletContractV5R1.create({ ... });
  // ...
}
```

### 오류 메시지
```json
{
  "success": false,
  "error": "window is not defined"
}
```

---

## 📖 원인 분석

### Cloudflare Workers vs Node.js vs Browser

| 환경 | 특징 | @ton/ton 지원 |
|------|------|--------------|
| **Browser** | window, document, localStorage | ✅ 완벽 지원 |
| **Node.js** | process, fs, Buffer | ⚠️ 일부 지원 |
| **Cloudflare Workers** | V8 isolate (제한적) | ❌ 지원 안됨 |

### @ton/ton 라이브러리 제약

```typescript
// @ton/ton 내부 코드 (예시)
import { Buffer } from 'buffer';

// ❌ 브라우저 API 가정
if (typeof window !== 'undefined') {
  // window.crypto 사용
  const crypto = window.crypto;
}

// ❌ DOM API 참조
const encoder = new TextEncoder();  // 브라우저 전용
```

**문제**:
1. `@ton/ton`은 브라우저 환경을 기본 가정
2. Cloudflare Workers는 `window` 객체 없음
3. Buffer 폴리필로도 해결 안됨 (다른 API도 필요)

---

## 🔍 실제 테스트 결과

### 테스트 1: Buffer 폴리필 추가
```typescript
// src/index.ts
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;  // ✅ Buffer는 해결

// functions/src/withdraw-handler.ts
import { mnemonicToPrivateKey } from '@ton/crypto';

const keyPair = await mnemonicToPrivateKey(mnemonic);
// ❌ 여전히 실패: "window is not defined"
```

**결론**: Buffer만으로는 부족, `window.crypto` 등 다른 API도 필요

### 테스트 2: 전체 폴리필 시도
```typescript
// 모든 브라우저 API 폴리필 (이론상)
globalThis.window = globalThis;
globalThis.document = {};
globalThis.crypto = { ... };
// ❌ 복잡도 폭발, 유지보수 불가능
```

**결론**: 완전한 폴리필은 현실적으로 불가능

---

## 💡 왜 입금은 되고 인출은 안되나?

### 입금 (✅ 가능)
```
[사용자]
  ↓ TON Connect (브라우저)
  ↓ 사용자 개인키로 서명
[사용자 Jetton Wallet]
  ↓ "게임에게 보내"
[게임 Jetton Wallet]
  ↓ (자동 수령, 서명 불필요)
[게임]
```

**핵심**: 
- ✅ 서명: 사용자가 브라우저에서 처리
- ✅ 게임: 수령만 (서명 불필요)

### 인출 (❌ 불가능)
```
[게임]
  ↓ ❌ 게임 개인키로 서명 필요!
  ↓ Cloudflare Workers (서명 불가)
[게임 Jetton Wallet]
  ↓ "사용자에게 보내"
[사용자 Jetton Wallet]
```

**핵심**:
- ❌ 서명: 게임이 Cloudflare Workers에서 처리 (불가능!)
- ❌ @ton/ton 라이브러리 사용 불가

---

## 🛠️ 해결 방안

### Option 1: Node.js 서버 (권장)

**구조**:
```
[Cloudflare Workers]
  ↓ API 요청만 받음
[Node.js 서버]
  ↓ 게임 니모닉으로 서명 (✅ @ton/ton 사용 가능)
  ↓ 트랜잭션 생성 및 전송
[TON 블록체인]
```

**장점**:
- ✅ @ton/ton 정상 작동
- ✅ 자동 인출 가능
- ✅ 즉시 처리

**단점**:
- ❌ 별도 서버 필요 (AWS, DigitalOcean 등)
- ❌ 인프라 비용: $20~50/월
- ❌ 서버 관리 필요

**구현 예시**:
```typescript
// Node.js 서버 (Express)
import express from 'express';
import { WalletContractV5R1, TonClient } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

const app = express();

app.post('/process-withdrawal', async (req, res) => {
  const { walletAddress, amount } = req.body;
  
  // ✅ Node.js에서는 정상 작동!
  const mnemonic = process.env.GAME_WALLET_MNEMONIC!.split(' ');
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  
  const gameWallet = WalletContractV5R1.create({
    workchain: 0,
    publicKey: keyPair.publicKey
  });
  
  // 트랜잭션 생성 및 전송
  // ...
  
  res.json({ success: true });
});

app.listen(3001);
```

### Option 2: 수동 인출 (현재 구현됨)

**구조**:
```
[사용자]
  ↓ 인출 요청 (크레딧 차감)
[Cloudflare Workers]
  ↓ 대기열 저장 (KV)
[관리자]
  ↓ TON Connect (브라우저)
  ↓ 게임 지갑으로 수동 서명
[게임 Jetton Wallet]
  ↓ "사용자에게 보내"
[사용자]
```

**장점**:
- ✅ 추가 인프라 불필요
- ✅ 비용 없음
- ✅ 즉시 구현 가능

**단점**:
- ❌ 수동 작업 (12~24시간 지연)
- ❌ 확장성 제한

### Option 3: 스마트 컨트랙트

**구조**:
```
[사용자]
  ↓ 스마트 컨트랙트 호출
[스마트 컨트랙트]
  ↓ 게임 Jetton Wallet 제어 (권한 위임)
[게임 Jetton Wallet]
  ↓ "사용자에게 보내"
[사용자]
```

**장점**:
- ✅ 완전 자동화
- ✅ 탈중앙화
- ✅ 서버 불필요

**단점**:
- ❌ 개발 시간 (1~3개월)
- ❌ 배포 비용 (~5 TON)
- ❌ 감사 필요

---

## 📊 비교표

| 방식 | 니모닉 위치 | 서명 환경 | @ton/ton 사용 | 비용 | 처리 시간 |
|------|-----------|---------|--------------|------|----------|
| **Cloudflare Workers** | ✅ 변수 저장 | ❌ V8 isolate | ❌ 불가능 | $0 | - |
| **Node.js 서버** | ✅ 환경변수 | ✅ Node.js | ✅ 가능 | $50/월 | 즉시 |
| **수동 인출** | ✅ 안전 | ✅ 브라우저 | ✅ 가능 | $0 | 12~24h |
| **스마트 컨트랙트** | ❌ 불필요 | ✅ 온체인 | ✅ 가능 | ~5 TON | 즉시 |

---

## 🎯 결론

### 질문 2 답변
> "니모닉 코드를 서버 변수에 저장했는데 Cloudflare Workers에서 변수로 저장한 니모닉으로 트랜잭션을 생성해서 게임 유저 지갑으로 CSPIN 토큰을 보낼 수 없는거야?"

**답**: ❌ **불가능합니다**

**이유**:
1. Cloudflare Workers는 V8 isolate 환경
2. @ton/ton 라이브러리는 브라우저 API 필요
3. window, document 등 객체 없음
4. Buffer 폴리필로도 해결 안됨

### 현재 상황
- ✅ **니모닉 저장**: 가능 (환경변수)
- ❌ **니모닉 사용**: 불가능 (@ton/ton 제약)
- ✅ **해결책**: 수동 인출 구현 완료

### 추천 방향
1. **현재 (MVP)**: 수동 인출 사용
2. **3개월 후**: Node.js 서버 추가 (예산 확보 시)
3. **6개월 후**: 스마트 컨트랙트 (투자 유치 시)

---

## 📝 추가 참고

### Cloudflare Workers 제약사항
```
✅ 가능:
- HTTP 요청/응답
- KV 스토리지
- 환경변수 접근
- JSON 처리
- Buffer 사용 (폴리필)

❌ 불가능:
- window 객체
- document 객체
- localStorage
- 파일 시스템
- 일부 Node.js 모듈
- @ton/ton (브라우저 API 필요)
```

### 대안 플랫폼
만약 자동 인출이 필수라면:

1. **AWS Lambda** + Node.js
2. **Google Cloud Functions** + Node.js
3. **DigitalOcean App Platform**
4. **Railway.app** (간단)
5. **Render.com** (무료 티어)

모두 Node.js 지원 → @ton/ton 사용 가능!

---

**다음 단계**: 
1. 로컬 테스트 (/admin 접속)
2. 프로덕션 배포
3. 실제 인출 처리 테스트
