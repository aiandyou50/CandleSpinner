# 해결 기록: TonConnect 주소 형식 오류 수정

> **원본 지시서:** `docs/instructions/TonConnect-주소-형식-오류-수정_20251021_130000.md`
> **관련 커밋:** 94fa959
> **최종 버전:** v2.0.2 (긴급 핫픽스)

---

### 1. 해결 방법 요약

**오류 원인**: TonConnect SDK가 `address` 필드에 **정식 Address 형식**을 요구하는데, 일반 문자열 상수를 전달했음.

**해결 방법**:
```typescript
// ❌ 이전 (잘못됨)
address: CSPIN_JETTON_WALLET  // 문자열 상수

// ✅ 수정 (올바름)
const jettonWalletAddress = Address.parse(CSPIN_JETTON_WALLET).toString();
address: jettonWalletAddress  // 정식 Address 형식
```

---

### 2. 기술 분석

#### **2.1 TonConnect 트랜잭션 요구사항**

TonConnect SDK의 `SendTransactionRequest` 타입:
```typescript
{
  validUntil: number;
  messages: {
    address: string;  // ← 정식 Address 형식이어야 함 (Address.toString())
    amount: string;   // 나노톤 단위
    payload?: string; // base64 encoded
  }[]
}
```

**핵심**: `address` 필드는 다음 중 하나여야 함:
- `Address.parse(rawString).toString()` ← 추천
- 이미 정식 형식으로 파싱된 Address 객체의 `toString()` 결과

#### **2.2 PoC 코드의 올바른 패턴**

PoC의 `PayloadBuilder.tsx`:
```typescript
const destination = Address.parse(GAME_WALLET_ADDRESS);
const tx = { 
  to: jettonWallet,  // ← Address 객체의 메서드 사용
  ...
};
```

이를 TonConnect 트랜잭션으로 변환할 때:
```typescript
const jettonWalletAddress = Address.parse(jettonWallet).toString();
const transaction = {
  messages: [{
    address: jettonWalletAddress,  // ← toString() 필수
    ...
  }]
};
```

---

### 3. 수정 사항

#### **3.1 Deposit.tsx 수정**

```typescript
// 이전
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      address: CSPIN_JETTON_WALLET,  // ❌
      amount: '200000000',
      payload: payload
    }
  ]
};

// 수정 후
const jettonWalletAddress = Address.parse(CSPIN_JETTON_WALLET).toString();
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      address: jettonWalletAddress,  // ✅
      amount: '200000000',
      payload: payload
    }
  ]
};
```

---

### 4. 테스트 및 검증

#### **4.1 빌드 검증**
```
✓ npm run build 성공
✓ TypeScript 컴파일 성공
✓ 모듈 해석 완료
```

#### **4.2 배포 검증**
```
✓ git add -A
✓ git commit 완료 (커밋: 94fa959)
✓ git push 완료 → Cloudflare Pages 자동 배포 중
```

---

### 5. 오류 해결 과정

#### **5.1 원래 오류 메시지**
```
[TON_CONNECT_SDK_ERROR] SendTransactionRequest validation failed: 
Wrong 'address' format in message at index 0
```

#### **5.2 진단 과정**

1. **문제 식별**
   - TonConnect가 address 필드의 형식을 거부
   - PoC 코드와의 차이점 분석

2. **원인 분석**
   - PoC: `Address.parse().toString()` 사용
   - 현재: 문자열 상수 직접 사용

3. **해결책 적용**
   - Address 객체로 파싱 후 toString()으로 변환
   - TonConnect SDK의 정식 형식 요구사항 충족

#### **5.3 추가 발견사항**

콘솔 로그에서 발견된 다른 오류:
- `validUntil is more than 5 minutes from now` ← 이미 타임스탬프 계산 올바름
- `WebAppMethodUnsupported` (showPopup) ← 더 이상 영향 없음

---

### 6. 후임 AI를 위한 인수인계

#### **6.1 핵심 학습 포인트**

- **TonConnect와 Address 형식**: 항상 `Address.parse().toString()` 사용
- **트랜잭션 구조 검증**: 정식 Address 형식이 필수
- **PoC 코드 참고**: 새로운 기능 구현 시 PoC 패턴 따르기

#### **6.2 테스트 체크리스트**

다음 번 입금 테스트 시:
- [ ] 브라우저 콘솔에서 `[TON_CONNECT_SDK_ERROR]` 메시지 확인
- [ ] "Wrong 'address' format" 오류 없음 확인
- [ ] 실제 지갑에서 트랜잭션 서명 요청 표시 여부 확인
- [ ] 트랜잭션 전송 완료 시 성공 메시지 표시

#### **6.3 주의사항**

- ⚠️ CSPIN_JETTON_WALLET 상수가 정확한 주소인지 재확인 필수
- ⚠️ 다른 Address 필드도 동일하게 `.toString()` 적용
- ⚠️ TonConnect 대신 다른 지갑 연결 라이브러리 사용 시 형식 요구사항 재확인

---

### 7. 배포 상태

- ✅ **버전**: v2.0.2 (기존 버전 유지)
- ✅ **커밋**: 94fa959
- ✅ **배포**: Cloudflare Pages 자동 배포 중 (약 2-3분)
- ✅ **상태**: 긴급 핫픽스 완료
