# CandleSpinner 긴급 수정 사항

## 발견된 문제

### 1. ❌ 입금 실패 문제
**현상**: CSPIN 토큰 입금이 안됨
**원인**: 아직 정확한 원인 미파악 (API 엔드포인트는 정상)
**가능성**:
- Workers 배포 시 환경변수 누락
- API_BASE_URL이 window.location.origin으로 변경되어 로컬 테스트 불가능
- verifyDeposit API 응답 오류

### 2. ⚠️ 네트워크 Fee 과다 문제
**현상**: CSPIN 입금 시 0.2 TON 비용 발생
**원인**: `src/components/Deposit.tsx` Line 208
```typescript
amount: toNano('0.2').toString(), // 0.2 TON
```

**TON Jetton Transfer 표준 권장 비용**:
- Gas: ~0.05 TON (Jetton Transfer 실행 비용)
- Forward amount: 0.000000001 TON (1 nanoton, 페이로드에 이미 설정됨)
- **권장 총액: 0.05 ~ 0.1 TON**

**현재 설정**: 0.2 TON (과다)

**MVP v2 확인 결과**: 동일하게 0.2 TON 사용 중
- MVP v2도 과다 비용 문제 있음
- 표준에 따라 0.05 TON으로 변경 필요

### 3. ❌ 관리자 페이지 접근 불가
**현상**: 관리자 지갑으로 연결해도 관리자 페이지 접근 거부
**원인**: **API 엔드포인트 불일치**

#### 프론트엔드 (AdminWithdrawals.tsx):
```typescript
fetch('/api/get-withdrawal-logs')      // ❌ 존재하지 않음!
fetch('/api/process-withdrawal')       // ❌ 존재하지 않음!
```

#### 백엔드 (src/index.ts):
```typescript
'/api/admin/pending-withdrawals'      // ✅ 실제 엔드포인트
'/api/admin/mark-processed'           // ✅ 실제 엔드포인트
```

**결론**: AdminWithdrawals.tsx가 잘못된 API 엔드포인트 호출

### 4. ⚠️ 환경변수 문제
**현상**: VITE_ADMIN_WALLET_ADDRESS가 "Not configured"로 표시
**원인**: 
1. Vite 빌드에는 환경변수가 포함되었으나
2. Cloudflare Workers 배포 시 환경변수가 반영되지 않음

**해결 방법**:
- `.env`는 로컬 개발용
- Workers 배포는 `wrangler.toml` [vars] 또는 Dashboard Secrets 사용

---

## 수정 계획

### Priority 1: 네트워크 Fee 절감 (즉시 수정 가능)
```typescript
// src/components/Deposit.tsx Line 208
amount: toNano('0.05').toString(), // 0.2 → 0.05 TON으로 변경
```

### Priority 2: 관리자 페이지 API 수정 (즉시 수정 가능)
```typescript
// AdminWithdrawals.tsx
'/api/get-withdrawal-logs' → '/api/admin/pending-withdrawals'
'/api/process-withdrawal' → '/api/admin/mark-processed'
```

### Priority 3: 환경변수 설정 (wrangler.toml 수정)
```toml
[vars]
VITE_ADMIN_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
```

### Priority 4: 입금 실패 원인 디버깅
- Workers 로그 확인
- API 응답 확인
- 환경변수 확인

---

## 다음 단계
1. Deposit.tsx 수정 (0.05 TON)
2. AdminWithdrawals.tsx 수정 (올바른 API 엔드포인트)
3. wrangler.toml 환경변수 추가
4. 빌드 및 배포
5. 테스트
