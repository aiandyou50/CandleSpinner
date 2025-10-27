# 📜 Scripts 사용 가이드

모든 관리 스크립트의 용도와 사용법을 설명합니다.

---

## 📋 스크립트 목록

### 1. deploySecure.ts
**용도**: CSPINWithdrawalSecure 컨트랙트 배포

**사용법**:
```bash
# 테스트넷 배포
npx blueprint run deploySecure --testnet

# 메인넷 배포
npx blueprint run deploySecure --mainnet
```

**입력 항목**:
1. Jetton Master 주소 (CSPIN 토큰 컨트랙트)
2. Game Wallet 주소 (토큰을 보유한 게임 지갑)

**예시**:
```
? Jetton Master Address: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
? Game Wallet Address: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
```

**주의사항**:
- ⚠️ Owner는 자동으로 배포자 지갑으로 설정됩니다
- ⚠️ 배포 후 컨트랙트 주소를 반드시 기록하세요
- ⚠️ 메인넷 배포 시 충분한 TON 잔액 필요 (약 0.5 TON)

---

### 2. setClaimable.ts
**용도**: 사용자별 인출 가능한 CSPIN 토큰 금액 설정

**사용법**:
```bash
# 테스트넷
npx blueprint run setClaimable --testnet

# 메인넷
npx blueprint run setClaimable --mainnet
```

**입력 항목**:
1. 컨트랙트 주소
2. 사용자 지갑 주소
3. 인출 가능 금액 (CSPIN 단위)

**예시**:
```
? Contract Address: EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
? User Address: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
? Amount (CSPIN): 100
```

**주의사항**:
- ⚠️ Owner 권한 필요
- ⚠️ TonConnect 세션 타임아웃 발생 시 quickSetClaimable.ts 사용
- ⚠️ 금액은 Jetton 표준 단위 (1e9 곱해짐)

---

### 3. quickSetClaimable.ts
**용도**: Mnemonic으로 빠르게 SetClaimable 실행 (TonConnect 문제 우회)

**⚠️ 보안 주의**: Mnemonic 사용 시 매번 입력 권장!

**사용법**:
```bash
# Mnemonic 선택 → 터미널에서 직접 입력
npx blueprint run quickSetClaimable --testnet
```

**Mnemonic 입력 시**:
1. "Which wallet are you using?" → **Mnemonic** 선택
2. 터미널에서 24단어 입력 요구
3. 입력 후 Enter

**또는 환경 변수 사용 (비권장)**:
```bash
$env:WALLET_MNEMONIC="your 24 words"
$env:WALLET_VERSION="v5r1"
npx blueprint run quickSetClaimable --testnet
```

**코드 수정 필요**:
```typescript
// scripts/quickSetClaimable.ts
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
const USER_ADDRESS = 'USER_WALLET_ADDRESS';
const AMOUNT = 100n; // CSPIN 단위
```

**사용 시나리오**:
- setClaimable.ts에서 TonConnect 타임아웃 발생 시
- 자동화된 배치 작업
- 여러 사용자에게 한 번에 설정

---

### 4. pauseContract.ts
**용도**: 컨트랙트 긴급 정지 (모든 인출 차단)

#### **방법 1: PC 환경 (Blueprint)**
```bash
npx blueprint run pauseContract --testnet
# 또는
npx blueprint run pauseContract --mainnet
```

**입력 항목**:
1. 컨트랙트 주소

**예시**:
```
? Contract Address: EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
✅ 컨트랙트가 일시 정지되었습니다
```

#### **방법 2: 모바일 환경 (Tonkeeper 앱) 📱**

PC 없이 모바일만으로 긴급 정지 가능:

1. **Tonkeeper 앱 열기**
2. **전송(Send)** 탭 선택
3. **수신자**: 컨트랙트 주소 입력
4. **금액**: `0.05 TON`
5. **메시지(Comment)**: `pause` (소문자로 정확히 입력)
6. **전송** 클릭

**재개는 동일하게 `unpause` 메시지 전송**

#### **방법 3: 모바일 웹 페이지 (권장) ⭐**

```
frontend-poc/emergency-pause.html
```

**사용법**:
- 모바일 브라우저에서 열기
- TonConnect로 Owner 지갑 연결
- "긴급 정지" 버튼 클릭

**장점**:
- ✅ Owner 자동 인증
- ✅ 실시간 상태 표시
- ✅ 버튼 클릭만으로 제어
- ✅ 작업 로그 확인

**사용 시나리오**:
- 🚨 보안 위협 감지
- 🚨 비정상적인 인출 패턴
- 🚨 컨트랙트 업그레이드 준비
- 🚨 긴급 점검

**주의사항**:
- ⚠️ Owner 권한 필요
- ⚠️ Pause 상태에서는 모든 ClaimRequest 거부됨
- ⚠️ unpauseContract.ts로 재개 가능

---

### 5. unpauseContract.ts
**용도**: 정지된 컨트랙트 재개

**사용법**:
```bash
npx blueprint run unpauseContract --testnet
# 또는
npx blueprint run unpauseContract --mainnet
```

**입력 항목**:
1. 컨트랙트 주소

**예시**:
```
? Contract Address: EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
✅ 컨트랙트 일시 정지가 해제되었습니다
```

**주의사항**:
- ⚠️ Owner 권한 필요
- ⚠️ 정지 원인이 해결되었는지 확인 후 재개
- ⚠️ 재개 후 즉시 인출 가능

---

### 6. withdrawTON.ts
**용도**: 컨트랙트에 쌓인 TON을 Owner 지갑으로 인출

**사용법**:
```bash
# 테스트넷
npx blueprint run withdrawTON --testnet

# 메인넷
npx blueprint run withdrawTON --mainnet
```

**입력 항목**:
1. 컨트랙트 주소
2. 인출할 TON 금액 (예: 0.5)

**예시**:
```
? 컨트랙트 주소: EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
? 인출할 TON 금액: 0.5
✅ TON 인출 요청 전송 완료!
```

**주의사항**:
- ⚠️ Owner 권한 필요
- ⚠️ 최소 0.1 TON은 컨트랙트에 남김 (저장료)
- ⚠️ 전액 인출 시도하면 오류 발생

---

### 7. deployCSPINWithdrawal.ts
**용도**: 기본 버전 (CSPINWithdrawal.tact) 배포

**사용법**:
```bash
npx blueprint run deployCSPINWithdrawal --testnet
```

**주의사항**:
- ⚠️ **권장하지 않음**: 보안 기능 없음
- ⚠️ deploySecure.ts 사용 권장
- ⚠️ PoC 및 학습 목적으로만 사용

---

## 🔐 보안 권장사항

### Mnemonic 관리

**✅ 권장 방법: TonConnect 사용**
```bash
npx blueprint run deploySecure --mainnet
# → TON Connect compatible mobile wallet 선택
# → QR 코드로 지갑 연결 (안전!)
```

**⚠️ 비권장: Mnemonic 직접 입력**
- 꼭 필요한 경우에만 사용
- 파일에 저장 금지
- 터미널에서 직접 입력
- 입력 후 즉시 터미널 clear

**❌ 절대 금지: .env 파일에 저장**
```bash
# 절대 하지 마세요!
WALLET_MNEMONIC=your mnemonic here  # 위험!
```

---

## 🔧 일반적인 사용 흐름

### 초기 배포 시
```bash
# 1. 컨트랙트 배포
npx blueprint run deploySecure --mainnet

# 2. 사용자 인출 가능 금액 설정
npx blueprint run setClaimable --mainnet

# 3. 프론트엔드 테스트
# frontend-poc/index.html 열어서 연결 테스트
```

### 긴급 상황 시
```bash
# 1. 즉시 정지
npx blueprint run pauseContract --mainnet

# 2. 문제 확인 및 해결
# ...

# 3. 재개
npx blueprint run unpauseContract --mainnet
```

---

## ❗ 문제 해결

### TonConnect 타임아웃
**증상**: "Approve in your wallet..." 메시지 후 멈춤

**해결**:
1. quickSetClaimable.ts 수정
2. Mnemonic 모드로 실행

### "Not enough TON" 오류
**해결**: 지갑에 충분한 TON 추가 (최소 0.2 TON)

### "Only owner can..." 오류
**해결**: Owner 지갑으로 실행

---

## 📞 추가 정보

자세한 관리자 기능은 [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) 참조
