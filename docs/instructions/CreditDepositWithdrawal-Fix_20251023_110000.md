# 명령 지시서: 크레딧 입금/인출 로직 완전 수정

**지시서 ID:** CreditDepositWithdrawal-Fix  
**발급일:** 2025년 10월 23일  
**우선순위:** 🔴 Blocking (MVP 기능 마비)  
**워크플로우:** Lite (코드 수정 중심)

---

## 📋 작업 개요

MVP 테스트 중 발견된 3가지 Blocking 이슈:

### Issue 1: 입금 후 크레딧이 증가하지 않음
- **현상**: CSPIN 100개 입금 후에도 UI 크레딧 = 1,000 (변화 없음)
- **원인**: 
  - KV 키 불일치: `state:0:${walletAddress}` vs `state:${walletAddress}`
  - 프론트엔드 상태 미동기화: `/api/deposit` 응답을 활용하지 않음
- **목표**: 입금 후 UI에 즉시 반영 (예: 1,000 → 1,100)

### Issue 2: 인출 버튼이 API를 호출하지 않음
- **현상**: "1000 CSPIN 인출 요청 보냈습니다" 메시지만 표시
- **원인**: GameComplete.tsx 라인 766-768에서 UI 상태만 변경, 실제 API 호출 없음
- **목표**: 클릭 시 `/api/initiate-withdrawal` 호출 → 블록체인 트랜잭션 발생

### Issue 3: 초기 크레딧 설정 혼재
- **현상**: 모든 사용자가 1,000으로 시작, 기존 사용자의 KV 값 무시
- **원인**: `useGameState(initialCredit = 1000)` 하드코딩 + KV 미조회
- **목표**: 신규 사용자 1,000 / 기존 사용자 KV 유지

---

## 🛠️ 수정 대상 파일

| 파일 | 수정 항목 | 이유 |
|------|---------|------|
| `src/hooks/useGameState.ts` | KV 키 통일 + 초기값 동기화 | KV 키 일관성 |
| `functions/api/deposit.ts` | KV 키 통일 (기존 로직 정상) | KV 키 일관성 |
| `src/components/Deposit.tsx` | onDepositSuccess 콜백 동작 확인 | 입금 후 상태 반영 |
| `src/components/GameComplete.tsx` | 인출 버튼 → API 호출 추가 | 실제 인출 기능 구현 |
| `functions/api/initiate-withdrawal.ts` | seqno 원자성 + Jetton 트랜잭션 완성 | 인출 기능 완성 |
| `functions/api/get-credit.ts` | 초기값 조회 시 사용 | 기존 사용자 크레딧 복구 |

---

## 📍 핵심 변경 사항

### 1. KV 키 통일
```typescript
// ❌ 현재 (불일치)
state:0:${walletAddress}      // useGameState에서 사용
state:${walletAddress}         // /api/deposit에서 사용

// ✅ 수정 후 (통일)
state:${walletAddress}         // 모든 곳에서 통일
```

### 2. 입금 후 상태 동기화
```typescript
// Deposit.tsx에서 onDepositSuccess 콜백 받음
// GameComplete.tsx에서 처리:
if (onDepositSuccess) onDepositSuccess(amount);
// → useEffect로 `/api/get-credit` 호출
// → updateCredit(new_value) 적용
```

### 3. 인출 버튼 API 호출
```typescript
// GameComplete.tsx 라인 766-768 수정
onClick={() => {
  // ❌ 현재
  showToast(`${withdrawAmount} CSPIN 인출 요청을 보냈습니다.`);
  updateCredit(userCredit - withdrawAmount);
  
  // ✅ 수정 후
  fetch('/api/initiate-withdrawal', {
    method: 'POST',
    body: JSON.stringify({
      walletAddress: wallet.account.address,
      withdrawalAmount
    })
  }).then(...)
}}
```

### 4. 초기 크레딧 설정
```typescript
// useGameState에서 컴포넌트 마운트 시
useEffect(() => {
  if (!wallet?.account?.address) return;
  fetch(`/api/get-credit?walletAddress=${wallet.account.address}`)
    .then(r => r.json())
    .then(data => setCredit(data.credit))  // KV 값으로 초기화
}, [wallet?.account?.address]);
```

---

## ✅ 체크리스트

- [ ] `src/hooks/useGameState.ts`: KV 키 표준화 + useEffect 추가
- [ ] `src/components/GameComplete.tsx`: 인출 버튼 API 호출 구현
- [ ] `functions/api/deposit.ts`: KV 키 확인 (기존 정상)
- [ ] `functions/api/initiate-withdrawal.ts`: seqno 관리 + Jetton 트랜잭션
- [ ] `src/components/Deposit.tsx`: onDepositSuccess 콜백 확인
- [ ] npm test (12/12 통과 확인)
- [ ] git commit + push (v2.4.0 또는 2.3.1)
- [ ] kanban.md 업데이트

---

**상태:** 명령 기록 저장 완료, [Step 3] 코드 수정 진행 중 ⏳
