# 🎰 CSPIN Withdrawal Smart Contract

TON 블록체인 기반 토큰 인출 시스템

---

## 📋 프로젝트 개요

사용자가 게임에서 획득한 CSPIN 토큰을 자신의 지갑으로 안전하게 인출할 수 있는 스마트 컨트랙트입니다.

### 두 가지 버전

| 버전 | 설명 | 사용 사례 |
|------|------|----------|
| **CSPINWithdrawalSecure** | 수동 승인 방식<br/>관리자가 SetClaimable 실행 | 완전한 통제가 필요한 경우 |
| **CSPINWithdrawalAuto** ⭐ | 자동 인출 방식<br/>게임 백엔드에서 Jetton 전송 | 즉시 자동 처리 필요 |

**핵심 특징:**
- ✅ **보안 기능** (긴급 정지, 인출 한도, Reentrancy 방지)
- ✅ **모바일 지원** (PC 없이도 긴급 정지 가능)
- ✅ **자동화 지원** (관리자 개입 없이 즉시 인출) ⭐ NEW
- ✅ **테스트넷/메인넷 지원**

**배포 상태:**
- ✅ 테스트넷 (Secure): `EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg`
- ⏳ 메인넷: 배포 대기 중

---

## 📁 프로젝트 구조

```
contracts/
├── sources/
│   ├── CSPINWithdrawalSecure.tact     # 수동 승인 방식
│   ├── CSPINWithdrawalAuto.tact       # 자동 인출 방식 ⭐ NEW
│   └── CSPINWithdrawal.tact            # 구 버전 (사용 안 함)
├── scripts/
│   ├── deploySecure.ts                 # Secure 버전 배포
│   ├── deployAuto.ts                   # Auto 버전 배포 ⭐ NEW
│   ├── setClaimable.ts                 # 수동 승인 (Secure 전용)
│   ├── updateContractWallet.ts         # Jetton Wallet 주소 업데이트 ⭐ NEW
│   ├── pauseContract.ts                # 긴급 정지
│   ├── unpauseContract.ts              # 정지 해제
│   └── withdrawTON.ts                  # TON 수수료 인출
├── frontend-poc/
│   ├── index.html                      # 사용자 인출 페이지
│   └── emergency-pause.html            # 모바일 긴급 정지 페이지
├── build/
│   ├── CSPINWithdrawalSecure/          # Secure 버전 컴파일
│   └── CSPINWithdrawalAuto/            # Auto 버전 컴파일 ⭐ NEW
├── wrappers/                           # TypeScript 래퍼
├── tests/                              # 테스트 파일
├── .env                                # 환경 변수
├── .gitignore                          # Git 보안 설정
├── README.md                           # 이 파일
├── ADMIN_GUIDE.md                      # 관리자 기능 가이드
├── SCRIPTS.md                          # 스크립트 사용법
├── POC_GUIDE.md                        # 프론트엔드 PoC 가이드
├── GAME_INTEGRATION_GUIDE.md           # 게임 백엔드 통합 가이드 ⭐ NEW
├── SECURITY_RECOMMENDATIONS.md         # 보안 권장사항
└── 부트스트랩.md                        # 새 세션용 컨텍스트
```

---

## 🚀 빠른 시작

### 1️⃣ 설치

```bash
cd contracts
npm install
```

**설치될 주요 패키지:**
- `@ton/core`, `@ton/ton` - TON 블록체인 라이브러리
- `@ton/blueprint` - 배포 도구
- `tact` - Tact 컴파일러

### 2️⃣ 환경 변수 설정

`.env` 파일 확인 (이미 생성됨):
```bash
# ⚠️ 보안: 니모닉은 여기에 저장하지 마세요!
# 스크립트 실행 시 직접 입력합니다.

WALLET_VERSION=v5r1

# 테스트넷 설정
TESTNET_CONTRACT_ADDRESS=EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg

# 메인넷 설정
MAINNET_OWNER=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
MAINNET_JETTON_MASTER=EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
MAINNET_GAME_WALLET=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
MAINNET_GAME_JETTON_WALLET=EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
```

### 3️⃣ 컴파일

**Secure 버전 (수동 승인):**
```bash
npx blueprint build CSPINWithdrawalSecure
```

**Auto 버전 (자동 인출) ⭐:**
```bash
npx blueprint build CSPINWithdrawalAuto
```

**출력:**
- `build/CSPINWithdrawal[Secure/Auto]/` 디렉토리 생성
- `.abi`, `.fc`, `.ts` 파일 생성

### 4️⃣ 테스트넷 배포

**Secure 버전:**
```bash
npx blueprint run deploySecure --testnet
```

**Auto 버전 ⭐:**
```bash
npx blueprint run deployAuto --testnet
```

**입력 항목:**
1. 관리자 주소 (Owner)
2. CSPIN Jetton Master
3. 게임 Jetton Wallet

**지갑 연결 방식:**
- **TonConnect** (QR 코드) - 권장 ✅
- **Mnemonic** (터미널 입력) - 보안상 주의

### 5️⃣ 메인넷 배포

**Secure 버전:**
```bash
npx blueprint run deploySecure --mainnet
```

**Auto 버전 ⭐ (권장):**
```bash
npx blueprint run deployAuto --mainnet
```

**준비 사항:**
- Owner 지갑에 최소 0.5 TON 보유
- Jetton Master 주소 확인
- Game Jetton Wallet에 충분한 CSPIN 보유

**Auto 버전 추가 작업:**
배포 후 컨트랙트의 Jetton Wallet 주소를 확인하여 업데이트해야 합니다.
```bash
npx blueprint run updateContractWallet --mainnet
```
자세한 내용은 `GAME_INTEGRATION_GUIDE.md` 참조

---

## 🔑 주요 기능

### 1. 사용자 기능

#### **ClaimRequest** (토큰 인출)
사용자가 설정된 금액만큼 CSPIN 토큰을 자신의 지갑으로 인출합니다.

**적용 버전:**
- ✅ CSPINWithdrawalSecure (수동 승인 필요)
- ❌ CSPINWithdrawalAuto (자동 전송으로 불필요)

**프론트엔드:**
```
frontend-poc/index.html
```

**사용법:**
1. TonConnect로 지갑 연결
2. 인출 금액 입력 (기본 100 CSPIN)
3. "인출하기" 버튼 클릭
4. 가스비 지불 (~0.1 TON)
5. 토큰 수령

### 2. 관리자 기능 (Owner 전용)

#### **SetClaimable** (인출 금액 설정)
```bash
npx blueprint run setClaimable --mainnet
```

사용자별로 인출 가능한 CSPIN 금액을 설정합니다.

**제약 조건:**
- 최대 1,000,000 CSPIN (슬롯머신 잭팟 대응)
- Owner 권한 필요

#### **Pause/Unpause** (긴급 정지/재개)

**PC 환경:**
```bash
# 정지
npx blueprint run pauseContract --mainnet

# 재개
npx blueprint run unpauseContract --mainnet
```

**모바일 환경 (3가지 방법):**

1. **Tonkeeper 앱 (가장 간단) ✅**
   - 전송(Send) → 컨트랙트 주소
   - 금액: 0.05 TON
   - 메시지: `pause` (재개는 `unpause`)

2. **모바일 웹 페이지 (권장) ⭐**
   ```
   frontend-poc/emergency-pause.html
   ```
   - TonConnect 연결 → 버튼 클릭
   - 실시간 상태 확인
   - Owner 자동 인증

3. **TonHub 앱 (고급 사용자)**
   - Advanced Transaction → Payload: `pause`

#### **UpdateGameWallet** (게임 지갑 변경)
```bash
npx blueprint run setClaimable --mainnet
# (스크립트 내에서 UpdateGameWallet 메시지 전송)
```

게임 Jetton Wallet 주소를 변경합니다.

#### **WithdrawTON** (TON 수수료 인출)
```bash
npx blueprint run withdrawTON --mainnet
```

컨트랙트에 쌓인 TON을 Owner 지갑으로 인출합니다.
- 최소 0.1 TON은 스토리지 비용으로 유지

---

## 🔒 보안 기능

### 1. 긴급 정지 (Pause/Unpause)
- ✅ 모든 인출 요청 차단
- ✅ PC/모바일 모두 지원
- ✅ SetClaimable은 여전히 가능

### 2. 인출 한도 제한
- ✅ 1회 최대 1,000,000 CSPIN
- ✅ 슬롯머신 잭팟 대응

### 3. Reentrancy 방지
- ✅ CEI 패턴 (Check-Effects-Interactions) 적용
- ✅ 상태 먼저 변경 → 외부 호출은 마지막

### 4. Access Control
- ✅ Owner 전용 관리 기능
- ✅ `requireOwner()` 검증

### 5. 최소 잔액 보호
- ✅ WithdrawTON 시 0.1 TON 유지
- ✅ 스토리지 비용 확보

### 6. Input Validation
- ✅ 금액 양수 체크
- ✅ 주소 유효성 검증

자세한 내용: [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md)

---

## 🧪 테스트

### 로컬 테스트
```bash
npm test
```

**테스트 케이스:**
- ✅ 컨트랙트 배포
- ✅ SetClaimable 설정
- ✅ ClaimRequest 인출
- ✅ Pause/Unpause 기능
- ✅ Reentrancy 방지
- ✅ 권한 검증

### 테스트넷 통합 테스트
1. 컨트랙트 배포
2. SetClaimable로 사용자 금액 설정
3. 프론트엔드에서 인출 테스트
4. Pause 테스트 (모바일 포함)
5. TON 인출 테스트

자세한 내용: [POC_GUIDE.md](./POC_GUIDE.md)

---

## 📚 문서

| 문서 | 설명 |
|------|------|
| [SCRIPTS.md](./SCRIPTS.md) | 모든 스크립트 사용법 |
| [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) | 관리자 기능 가이드 |
| [POC_GUIDE.md](./POC_GUIDE.md) | 프론트엔드 PoC 가이드 |
| [GAME_INTEGRATION_GUIDE.md](./GAME_INTEGRATION_GUIDE.md) | **게임 백엔드 통합 가이드** ⭐ NEW |
| [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md) | 보안 권장사항 |
| [부트스트랩.md](./부트스트랩.md) | 새 세션용 컨텍스트 |

---

## 🎯 작동 원리

### CSPINWithdrawalSecure (수동 승인)

```
1. 게임에서 사용자가 CSPIN 획득
         ↓
2. 백엔드에서 SetClaimable 실행 ⚠️ (관리자 개입 필요)
   (사용자 주소, 금액 설정)
         ↓
3. 사용자가 프론트엔드에서 인출 요청
   (TonConnect로 지갑 연결)
         ↓
4. 스마트 컨트랙트에서 검증
   - Pause 상태 확인
   - 인출 한도 확인
   - Claimable 금액 확인
         ↓
5. Game Jetton Wallet → 사용자 Jetton Wallet
   (CSPIN 토큰 전송)
         ↓
6. 사용자 토큰 수령 완료
```

### CSPINWithdrawalAuto (자동 인출) ⭐ 권장

```
1. 게임에서 사용자가 CSPIN 획득
         ↓
2. 게임 백엔드에서 Jetton 전송 (자동)
   (forwardPayload에 사용자 주소 포함)
         ↓
3. 컨트랙트가 JettonTransferNotification 수신
         ↓
4. 스마트 컨트랙트에서 검증
   - Sender 확인 (contractJettonWallet인지)
   - Pause 상태 확인
   - 인출 한도 확인
         ↓
5. 컨트랙트 Jetton Wallet → 사용자 Jetton Wallet
   (CSPIN 토큰 자동 전송)
         ↓
6. 사용자 토큰 수령 완료 (즉시 처리)
```

**장점:**
- ✅ 관리자 개입 불필요
- ✅ 즉시 자동 처리
- ✅ 게임 백엔드에서 직접 제어
- ✅ 니모닉 하드코딩 없음 (환경 변수 관리)

---

## ⚙️ 컨트랙트 설정값

### CSPINWithdrawalSecure (수동)
```tact
contract CSPINWithdrawalSecure {
    owner: Address;                     // 관리자 주소
    jettonMaster: Address;              // CSPIN Jetton Master
    gameJettonWallet: Address;          // 게임 Jetton Wallet
    paused: Bool = false;               // 초기 상태: 정상
    maxSingleWithdraw: Int = 1000000000000000;  // 1,000,000 CSPIN
    claimableAmounts: map<Address, Int>;  // 사용자별 인출 가능 금액
}
```

### CSPINWithdrawalAuto (자동) ⭐
```tact
contract CSPINWithdrawalAuto {
    owner: Address;                     // 관리자 주소
    jettonMaster: Address;              // CSPIN Jetton Master
    gameJettonWallet: Address;          // 게임 Jetton Wallet
    contractJettonWallet: Address;      // 컨트랙트 Jetton Wallet (자동 인출용)
    paused: Bool = false;               // 초기 상태: 정상
    maxSingleWithdraw: Int = 1000000000000000;  // 1,000,000 CSPIN
    totalWithdrawn: Int;                // 총 인출 통계
    withdrawCount: Int;                 // 인출 횟수
}
```

**변경 가능한 값:**
- `maxSingleWithdraw`: 최대 인출 제한 (Line 59)
- `minBalance`: 최소 TON 잔액 (Line 95, 현재 0.1 TON)
- `forwardTonAmount`: Jetton 전송 수수료 (Line 138, 현재 0.01 TON)

---

## 📱 모바일 긴급 정지

PC 환경이 없는 상황에서도 긴급 정지 가능:

### 방법 1: Tonkeeper 앱
1. 전송(Send) → 컨트랙트 주소 입력
2. 금액: 0.05 TON
3. 메시지: `pause`
4. 전송

### 방법 2: 모바일 웹 페이지 (권장)
```
frontend-poc/emergency-pause.html
```
- Owner 지갑 연결 (TonConnect)
- "긴급 정지" 버튼 클릭
- 실시간 상태 확인

### 방법 3: TonHub 앱
- Advanced Transaction
- Payload: `pause` 입력

자세한 내용: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md#2-pause-긴급-정지)

---

## 🔄 프로젝트 히스토리

### 최근 변경 사항 (2025-10-27)

1. **최대 인출 제한 증가**
   - 1,000 CSPIN → 1,000,000 CSPIN
   - 슬롯머신 잭팟 대응

2. **모바일 긴급 정지 기능 추가**
   - `emergency-pause.html` 페이지 생성
   - Tonkeeper 앱 직접 전송 방법 문서화

3. **보안 강화**
   - Mnemonic 파일 저장 제거
   - .gitignore 추가
   - WithdrawTON 기능 추가

4. **문서화 개선**
   - 부트스트랩.md (새 세션용) 추가
   - 모든 문서에 모바일 방법 추가

### 배포 상태
- ✅ Testnet: 2025-10-27 배포 완료
- ✅ Pause/Unpause 테스트 완료
- ✅ 네트워크 감지 검증 완료
- ⏳ Mainnet: 배포 대기 중

---

## 💡 사용 예시

### 관리자 워크플로우

```bash
# 1. 컨트랙트 배포
npx blueprint run deploySecure --mainnet

# 2. 사용자에게 인출 금액 설정
npx blueprint run setClaimable --mainnet
# 입력: 사용자 주소, 금액 (예: 100 CSPIN)

# 3. 사용자가 프론트엔드에서 인출
# (frontend-poc/index.html)

# 4. 필요 시 긴급 정지
npx blueprint run pauseContract --mainnet
# 또는 모바일로 즉시 정지

# 5. TON 수수료 인출
npx blueprint run withdrawTON --mainnet
# 입력: 인출할 TON 금액
```

### 사용자 워크플로우

1. `frontend-poc/index.html` 접속
2. "지갑 연결" 버튼 클릭 (TonConnect)
3. Tonkeeper/MyTonWallet으로 QR 스캔
4. 인출 금액 입력 (기본 100 CSPIN)
5. "인출하기" 버튼 클릭
6. 가스비 승인 (~0.1 TON)
7. 토큰 수령 완료

---

## ⚠️ 주의사항

### 1. 보안
- ❌ `.env`에 Mnemonic 저장 금지
- ✅ TonConnect (QR 코드) 사용 권장
- ✅ `.gitignore`로 민감 정보 보호

### 2. 배포 전 체크리스트
- [ ] Testnet에서 완전 테스트 완료
- [ ] Owner 지갑에 0.5 TON 이상 보유
- [ ] Jetton Master 주소 확인
- [ ] Game Jetton Wallet 주소 확인
- [ ] Game Jetton Wallet에 충분한 CSPIN 보유
- [ ] 긴급 정지 방법 숙지 (모바일 포함)

### 3. 운영
- 정기적으로 컨트랙트 상태 확인
- TON 수수료 주기적으로 인출
- 비정상적인 인출 패턴 모니터링

### 4. 긴급 상황
- 모바일만 있으면 즉시 긴급 정지 가능
- `emergency-pause.html` 북마크 권장
- Owner 지갑 백업 필수

---

## 📞 지원

문제가 발생하면 다음 문서를 확인하세요:

1. **스크립트 오류** → [SCRIPTS.md](./SCRIPTS.md)
2. **관리 기능** → [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
3. **프론트엔드 통합** → [POC_GUIDE.md](./POC_GUIDE.md)
4. **보안 질문** → [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md)
5. **새 세션 시작** → [부트스트랩.md](./부트스트랩.md)

---

## 🔗 참고 자료

- **TON 공식 문서**: https://ton.org
- **Tact 언어**: https://tact-lang.org
- **Blueprint**: https://github.com/ton-org/blueprint
- **Jetton 표준 (TEP-74)**: https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
- **TonConnect**: https://docs.ton.org/develop/dapps/ton-connect/overview

---

## 📜 라이선스

MIT License

---

**개발**: CandleSpinner Game Team  
**마지막 업데이트**: 2025-10-27  
**버전**: 1.0.0 (Production Ready)
