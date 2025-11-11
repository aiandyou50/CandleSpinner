# "window is not defined" 오류 해결 - 인출 기능

**작성일**: 2025-11-02  
**오류**: `{"success":false,"error":"window is not defined"}`  
**상태**: 🔧 임시 해결, 프론트엔드 재구현 필요

---

## 🐛 오류 원인 분석

### 발생한 오류
```json
{
  "success": false,
  "error": "window is not defined"
}
```

### 근본 원인
**Cloudflare Workers 환경**(서버 사이드)에서 **@ton/ton** 라이브러리가 브라우저 전용 `window` 객체를 참조하려고 함

### 기술적 설명
```typescript
// functions/src/withdraw-handler.ts
import { WalletContractV5R1, Address } from '@ton/ton';  // ❌ 문제!
import { mnemonicToPrivateKey } from '@ton/crypto';      // ❌ 문제!

// @ton/ton 라이브러리 내부에서:
if (typeof window !== 'undefined') {  // ← Cloudflare Workers에는 window 없음!
  // 브라우저 전용 코드
}
```

**Cloudflare Workers**:
- ✅ Node.js API 일부 지원
- ❌ 브라우저 API (window, document, localStorage 등) 미지원
- ❌ @ton/ton 라이브러리의 일부 기능 사용 불가

---

## ✅ 해결 방법

### 방법 1: 프론트엔드 기반 인출 (권장) ✅

**개념**: 입금과 동일하게 TON Connect 사용

**장점**:
- ✅ 브라우저 환경에서 실행 (window 객체 사용 가능)
- ✅ @ton/ton 라이브러리 정상 동작
- ✅ 사용자가 직접 서명 (보안성 향상)
- ✅ 입금과 일관된 UX

**구조**:
```
사용자 지갑 (프론트엔드)
    ↓ TON Connect sendTransaction()
사용자 Jetton Wallet
    ↓ Jetton Transfer (TEP-74)
게임 TON 지갑 (destination)
    ↓ 자동 계산
게임 Jetton Wallet (실제 수신)
```

**구현 상태**:
- ⏳ Withdraw.tsx에 TODO 코드 추가됨
- ⏳ 입금 코드 참고하여 구현 예정

### 방법 2: 백엔드 RPC 방식 (실패) ❌

**시도했으나 실패**:
```typescript
// functions/src/withdraw-handler.ts
import { WalletContractV5R1 } from '@ton/ton';  // ❌ window is not defined

// Buffer 폴리필 시도 → 실패
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;  // ✅ Buffer는 해결됨
// ❌ 그러나 @ton/ton 내부의 다른 브라우저 API 참조로 실패
```

**근본적 한계**:
- @ton/ton 라이브러리는 브라우저 환경 가정
- Cloudflare Workers는 서버 사이드 환경
- 완전한 폴리필 불가능

---

## 🔧 임시 해결 (현재 상태)

### Withdraw.tsx 수정

**현재 동작**:
```typescript
throw new Error(
  '⚠️ 인출 기능은 현재 개발 중입니다.\n\n' +
  '문제: 백엔드 RPC 방식이 Cloudflare Workers에서 "window is not defined" 오류 발생\n' +
  '해결: 프론트엔드 TON Connect 기반으로 재구현 예정 (입금과 동일한 방식)'
);
```

**사용자에게 표시**:
- 명확한 오류 메시지
- 개발 중임을 알림
- 디버그 로그로 상세 정보 제공

---

## 🚀 프론트엔드 기반 인출 구현 계획

### Phase 1: 코드 작성 (1-2시간)

**Withdraw.tsx 완성**:
```typescript
// 1. 사용자 Jetton Wallet 계산
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});
const userJettonWallet = await jettonMaster.getWalletAddress(userAddress);

// 2. Jetton Transfer Payload 생성
const payload = buildJettonTransferPayload(
  amountNano,
  Address.parse(GAME_WALLET_ADDRESS),  // ✅ 게임 TON 지갑 (인출 목적지)
  Address.parse(walletAddress)         // 응답 주소
);

// 3. TON Connect 트랜잭션
const transaction = {
  messages: [{
    address: userJettonWalletRaw,
    amount: toNano('0.2').toString(),
    payload
  }]
};

await tonConnectUI.sendTransaction(transaction);
```

### Phase 2: 백엔드 API 수정 (30분)

**새 엔드포인트**: `/api/withdraw-confirm`

```typescript
// src/index.ts
async function handleWithdrawConfirm(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as {
    walletAddress: string;
    amount: number;
    txHash: string;
  };
  
  // 크레딧 차감 (트랜잭션 검증 후)
  const key = `credit:${body.walletAddress}`;
  const current = await env.CREDIT_KV.get(key, 'json') as { credit: number } | null;
  
  if (!current || current.credit < body.amount) {
    return new Response(JSON.stringify({ error: 'Insufficient credit' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const newCredit = current.credit - body.amount;
  await env.CREDIT_KV.put(key, JSON.stringify({
    credit: newCredit,
    lastUpdated: new Date().toISOString()
  }));
  
  return new Response(JSON.stringify({
    success: true,
    credit: newCredit
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

### Phase 3: 테스트 (30분)

**테스트 시나리오**:
1. 게임 화면 진입
2. 크레딧 확인 (10 CSPIN)
3. 인출 시도 (1 CSPIN)
4. TON Connect 서명 팝업 확인
5. 트랜잭션 전송
6. 블록체인 익스플로러 확인
7. 크레딧 감소 확인 (9 CSPIN)

---

## 📊 비교: 입금 vs 인출

| 항목 | 입금 | 인출 |
|------|------|------|
| 방향 | 사용자 → 게임 | 사용자 → 게임 (동일!) |
| 서명 | 사용자 (TON Connect) | 사용자 (TON Connect) |
| destination | GAME_WALLET_ADDRESS | GAME_WALLET_ADDRESS |
| 메시지 시작점 | 사용자 Jetton Wallet | 사용자 Jetton Wallet |
| 백엔드 역할 | 크레딧 증가 | 크레딧 감소 |
| 구현 방식 | TON Connect | TON Connect |

**핵심 깨달음**: 
> 인출도 입금과 동일하게 **사용자 → 게임** 방향!  
> 차이점은 **크레딧 증가 vs 감소**만!

**왜 그런가?**:
- 게임의 Jetton Wallet → 사용자의 Jetton Wallet 전송은 **게임이 서명** 필요
- 백엔드 RPC는 Cloudflare Workers 제약으로 불가능
- 대신 **사용자가 게임에게 인출 요청**하는 방식
- 게임은 별도 프로세스로 인출 처리 (또는 크레딧 차감만)

---

## 🎯 최종 아키텍처 (권장)

### 입금 (구현 완료) ✅
```
사용자 → [TON Connect] → 사용자 Jetton Wallet → 게임 Jetton Wallet
백엔드: 크레딧 증가
```

### 인출 (재설계 필요) 🔧
```
Option A: 크레딧 차감만 (간단)
- 사용자: 인출 요청
- 백엔드: 크레딧 차감
- 별도: 관리자가 수동 인출 처리

Option B: 자동 인출 (복잡)
- 사용자: 인출 요청
- 백엔드: 크레딧 차감 + 인출 큐 등록
- Worker: 백그라운드에서 실제 인출 처리 (Node.js 환경)
```

**권장**: Option A (크레딧 차감만)
- 간단하고 안정적
- Cloudflare Workers 제약 없음
- 초기 MVP로 충분

---

## 📋 실행 계획

### 즉시 실행 (임시 해결) ✅
- [x] Withdraw.tsx 오류 메시지 개선
- [x] 디버그 로그 추가
- [x] 사용자에게 개발 중임을 알림

### 다음 단계 (프론트엔드 재구현)
- [ ] Withdraw.tsx TODO 코드 활성화
- [ ] `/api/withdraw-confirm` 엔드포인트 추가
- [ ] 입금 코드 참고하여 완성
- [ ] 로컬 테스트
- [ ] 배포 및 검증

### 장기 계획 (자동 인출)
- [ ] Node.js Worker 구현
- [ ] 인출 큐 시스템
- [ ] 자동 인출 처리
- [ ] 모니터링 및 알림

---

## 💡 핵심 교훈

1. **환경 이해가 중요**
   - Cloudflare Workers ≠ Node.js
   - 브라우저 API 사용 불가
   - 라이브러리 호환성 확인 필수

2. **간단한 것이 최선**
   - 복잡한 백엔드 RPC보다
   - 프론트엔드 TON Connect가 더 안정적

3. **입금 패턴 재사용**
   - 검증된 코드 활용
   - 일관된 UX
   - 개발 시간 단축

4. **MVP 접근**
   - 완벽한 자동화보다
   - 동작하는 기본 기능 우선

---

**현재 상태**: 임시 오류 메시지 표시 ✅  
**다음 단계**: 프론트엔드 기반 인출 재구현 (1-2시간 예상)
