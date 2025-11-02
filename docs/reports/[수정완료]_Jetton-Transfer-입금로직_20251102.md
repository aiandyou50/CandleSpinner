# Jetton Transfer 입금 로직 수정 완료 (2025-11-02)

## 🔴 문제 상황

### 1. 잘못된 트랜잭션 주소
**증상:**
- 지갑에서 "Sent failed" 표시
- 블록체인에서 트랜잭션 실패 기록
- CSPIN 토큰이 차감되지 않음

**원인:**
```typescript
// ❌ 잘못된 구현 (이전)
address: CSPIN_JETTON_WALLET  // 게임 운영 지갑의 Jetton Wallet
// EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
```

**문제점:**
- 사용자가 **다른 사람의 Jetton Wallet**으로 트랜잭션을 보내려고 시도
- Jetton Transfer는 **자기 자신의 Jetton Wallet**으로 메시지를 보내야 함

### 2. 높은 네트워크 비용
- **이전:** 0.055 TON (약 380원)
- **불필요:** forward_ton_amount (0.005 TON)는 적절하지만, 전체 비용이 과도

## ✅ 해결 방법

### 1. 사용자의 Jetton Wallet 동적 계산

```typescript
// ✅ 올바른 구현 (현재)
import { TonClient, JettonMaster } from '@ton/ton';

// 사용자의 CSPIN Jetton Wallet 주소를 동적으로 계산
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});

const userAddress = Address.parse(walletAddress);
const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);
const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));

const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
const userJettonWalletRaw = userJettonWalletAddress.toString({ 
  urlSafe: true, 
  bounceable: false 
});

// 트랜잭션
const transaction = {
  messages: [{
    address: userJettonWalletRaw,  // ✅ 사용자의 Jetton Wallet
    amount: toNano('0.03').toString(),
    payload: payloadBase64,
  }]
};
```

### 2. 네트워크 비용 최적화

| 항목 | 이전 | 현재 | 절감 |
|------|------|------|------|
| transaction.amount | 0.055 TON | 0.03 TON | **45%** |
| forward_ton_amount | 0.005 TON | 0.005 TON | - |
| 합계 | 0.055 TON | 0.03 TON | 0.025 TON |
| 원화 (TON=$5) | ~380원 | ~210원 | ~170원 |

## 📊 Jetton Transfer 흐름 (TEP-74 표준)

```
1. 사용자가 트랜잭션 서명
   ↓
   대상: 사용자의 CSPIN Jetton Wallet (동적 계산)
   비용: 0.03 TON

2. 사용자의 Jetton Wallet 컨트랙트 실행
   ↓
   - 사용자 CSPIN 잔액 차감
   - Internal message 생성

3. Internal message 전송
   ↓
   From: 사용자의 Jetton Wallet
   To: 게임 운영 지갑의 Jetton Wallet
   금액: forward_ton_amount (0.005 TON)
   Payload: InternalTransfer

4. 게임 운영 지갑의 Jetton Wallet 실행
   ↓
   - 게임 운영 지갑 CSPIN 잔액 증가
   - Notification 전송 (optional)
```

## 🔧 수정 파일

### `src/components/Deposit.tsx`

#### Import 추가
```typescript
import { TonClient, JettonMaster } from '@ton/ton';
```

#### CSPIN_JETTON_WALLET import 제거
```typescript
// Before
import { GAME_WALLET_ADDRESS, CSPIN_JETTON_WALLET, CSPIN_TOKEN_ADDRESS } from '@/constants';

// After
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from '@/constants';
```

#### 동적 계산 로직 추가
```typescript
// ✅ 사용자의 CSPIN Jetton Wallet 주소를 동적으로 계산
logger.info('사용자의 Jetton Wallet 계산 중...');
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});

const userAddress = Address.parse(walletAddress);
const masterAddress = Address.parse(CSPIN_TOKEN_ADDRESS);
const jettonMaster = tonClient.open(JettonMaster.create(masterAddress));

const userJettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
const userJettonWalletRaw = userJettonWalletAddress.toString({ 
  urlSafe: true, 
  bounceable: false 
});

logger.info(`✅ 사용자 Jetton Wallet: ${userJettonWalletRaw}`);
```

#### 트랜잭션 비용 수정
```typescript
const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 300,
  messages: [{
    address: userJettonWalletRaw,  // ✅ 동적 계산된 주소
    amount: toNano('0.03').toString(),  // ✅ 0.055 → 0.03
    payload: payloadBase64,
  }]
};
```

## 🧪 테스트 방법

### 로컬 테스트
```bash
npm run dev
# http://localhost:3000 접속
```

### 프로덕션 테스트 (1-2분 후)
```bash
# https://aiandyou.me 접속
```

### 예상 동작
1. TON 지갑 연결
2. "입금하기" 클릭
3. 금액 입력 (예: 10 CSPIN)
4. **예상 비용:** 0.03 TON
5. 트랜잭션 서명
6. ✅ **성공:** CSPIN 토큰 차감 + 크레딧 증가

### 디버그 로그 확인
```javascript
[INFO] 사용자의 Jetton Wallet 계산 중...
[INFO] ✅ 사용자 Jetton Wallet: UQC...
[DEBUG] 트랜잭션 전송:
  address: "UQC..."  // 사용자의 Jetton Wallet
  amount: "30000000"  // 0.03 TON
```

## 📝 MVP v1과의 비교

### 공통점
- `buildJettonTransferPayload()` 함수 동일
- `getUserJettonWallet()` 로직 동일 (MVP v2에서 inline 구현)
- `destination`: 게임 운영 지갑 (UQBFPDd...)

### 차이점
| 항목 | MVP v1 | MVP v2 |
|------|--------|--------|
| 구조 | 별도 함수 (`getUserJettonWallet`) | Inline 구현 |
| TonClient | 재사용 | 매번 생성 |
| 비용 | 0.2 TON | 0.03 TON |
| validUntil | 600초 (10분) | 300초 (5분) |
| 트랜잭션 확인 | `confirmTransaction()` | 백엔드에서 처리 |

## 🚀 배포 상태

### Git 커밋
```bash
9145754 (HEAD -> main, origin/main) fix: Calculate user's Jetton Wallet dynamically + reduce fee to 0.03 TON
a7425f5 chore: Force rebuild for Cloudflare deployment
```

### Cloudflare 배포
- GitHub push → 자동 배포 트리거됨
- 배포 완료 예상 시간: 1-2분

### 브라우저 캐시
⚠️ **중요:** 강제 새로고침 필요
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- **Mobile:** 브라우저 설정 → 캐시 지우기

## 🔍 트러블슈팅

### 문제: "오래된 코드가 실행됨"
**증상:**
```javascript
[INFO] CSPIN Jetton Wallet: EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
[DEBUG] amount: "55000000"  // 0.055 TON
```

**원인:**
- Cloudflare 배포 지연
- 브라우저 캐시

**해결:**
1. 강제 새로고침 (Ctrl + Shift + R)
2. 시크릿 모드로 접속
3. 1-2분 대기 후 재접속

### 문제: "Invalid checksum"
**원인:**
- 주소 복사 오류 (BI vs Bl)

**해결:**
- 동적 계산으로 해결됨 (현재 코드)

### 문제: "Transaction failed"
**가능한 원인:**
1. CSPIN 잔액 부족
2. TON 잔액 부족 (0.03 TON 미만)
3. 네트워크 오류

**확인 방법:**
- 디버그 로그 모달 열기 (화면 상단 버튼)
- 에러 메시지 복사 후 분석

## 📚 참고 자료

### TON 공식 문서
- [TEP-74: Jettons Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON Connect: Jetton Transfer](https://docs.ton.org/develop/dapps/ton-connect/transactions)
- [Gas Costs](https://docs.ton.org/develop/smart-contracts/fees)

### 프로젝트 파일
- `src/components/Deposit.tsx`: 입금 컴포넌트
- `scripts/calculate-jetton-wallet.mjs`: Jetton Wallet 계산 스크립트
- `scripts/analyze-jetton-flow.mjs`: 전송 흐름 분석
- `scripts/test-minimum-fee.mjs`: 비용 최적화 분석

## ✅ 체크리스트

- [x] 사용자의 Jetton Wallet 동적 계산 구현
- [x] 네트워크 비용 0.03 TON으로 최적화
- [x] forward_ton_amount 0.005 TON 유지
- [x] 디버그 로그 추가
- [x] Git 커밋 및 푸시
- [x] Cloudflare 재배포 트리거
- [ ] 프로덕션 테스트 (사용자 확인 필요)
- [ ] 입금 성공 확인

---

**작성일:** 2025-11-02  
**작성자:** GitHub Copilot  
**관련 이슈:** Jetton Transfer 실패, 높은 네트워크 비용
