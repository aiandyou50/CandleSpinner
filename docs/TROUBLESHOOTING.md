# 🔧 환경 변수 & 배포 문제 해결 가이드 (2025-10-26)

## 📌 현재 상황 정리

### 😞 발생한 문제들

#### 1️⃣ TonConnect Manifest 오류
```
Error: Manifest is not valid
URL: https://app.tonkeeper.com/ton-connect?v=2&id=...
```

**원인**: 
- Blueprint의 배포 스크립트가 생성하는 Manifest가 Tonkeeper에서 인식되지 않음
- 또는 지갑 주소/프라이빗 키 불일치로 인한 인증 실패

---

#### 2️⃣ 환경 변수 오류
```
지갑 주소가 변경되었습니다:
- 이전 (잘못됨): 0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
- 현재 (올바름): 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
```

**원인**: 
- 프라이빗 키가 제공된 니모닉과 일치하지 않음
- 다른 니모닉에서 생성된 프라이빗 키가 저장되어 있음

---

## 🎯 해결 전략 (3단계)

### Step 1️⃣: 올바른 프라이빗 키 생성

제공하신 니모닉에서 올바른 프라이빗 키를 생성합니다:

```bash
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts

# 프라이빗 키 생성 스크립트 실행
npm run generate-private-key
```

**출력 예시**:
```
✅ 프라이빗 키 (Private Key):
   14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b

✅ 테스트넷: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
✅ 메인넷: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

---

### Step 2️⃣: .env.local 업데이트

생성된 프라이빗 키를 복사하여 .env.local에 붙여넣습니다:

**파일 위치**: `contracts/.env.local`

**수정 대상**:
```bash
# 이 부분을 업데이트:
DEPLOYER_PRIVATE_KEY=<Step 1에서 생성한 프라이빗 키>

# 예시:
DEPLOYER_PRIVATE_KEY=14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b
```

---

### Step 3️⃣: 환경 검증

모든 설정이 올바른지 확인합니다:

```bash
npm run check-env
```

**성공 시 출력**:
```
✅ CSPIN_JETTON
✅ GAME_JETTON_WALLET
✅ DEPLOYER_PRIVATE_KEY
✅ DEPLOYER_WALLET_ADDRESS_TESTNET
✅ DEPLOYER_WALLET_ADDRESS_MAINNET
```

---

## 🚀 배포 방법 (2가지 선택)

### 방법 A: Blueprint를 통한 TonConnect 배포 (권장)

```bash
npm run deploy
```

**절차**:
1. 네트워크 선택: `testnet`
2. 지갑 선택: `TON Connect compatible mobile wallet`
3. 지갑 선택: `Tonkeeper`
4. QR 코드 스캔 (Tonkeeper 앱)
5. 트랜잭션 서명

---

### 방법 B: 프라이빗 키를 사용한 직접 배포

```bash
npm run deploy:direct -- --testnet
```

**특징**:
- TonConnect 필요 없음
- 자동 트랜잭션 생성
- Tonkeeper 앱 불필요

---

## ⚠️ 문제 해결 FAQ

### Q1: "Manifest is not valid" 오류가 계속 나옵니다

**해결책**:
1. .env.local 파일이 올바르게 저장되었는지 확인
2. 프라이빗 키가 지갑 주소와 일치하는지 확인
3. 방법 B (직접 배포)를 시도

```bash
npm run generate-private-key
# 프라이빗 키 복사 & 업데이트
npm run check-env
npm run deploy:direct -- --testnet
```

---

### Q2: 프라이빗 키 생성 후 지갑 주소가 다릅니다

**원인**: 제공된 니모닉이 다를 수 있습니다

**해결책**:
1. 니모닉이 정확한지 다시 확인
2. 공백이나 단어 순서가 맞는지 확인
3. 다음 커맨드로 니모닉 검증:

```bash
npm run generate-private-key
```

출력된 주소가 다음과 일치해야 합니다:
- 테스트넷: `0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`
- 메인넷: `UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC`

---

### Q3: 배포 후 스마트컨트랙트 주소를 어디서 확인하나요?

**배포 완료 후**:
1. 터미널 출력에서 스마트컨트랙트 주소 복사
2. 또는 다음 파일에서 확인:

```
docs/deployment-info.json
```

테스트넷 탐색기에서 확인:
```
https://testnet.tonscan.org/address/[스마트컨트랙트주소]
```

---

### Q4: 테스트 TON이 부족합니다

**테스트 TON 받는 방법**:
1. 테스트넷 Faucet: https://testnet.tonwhales.com/
2. 테스트넷 수도꼭지: https://toncenter.com/api/

배포자 지갑 주소를 입력하고 0.5 TON 이상 요청

---

## 📋 최종 체크리스트

배포 전 다음을 확인하세요:

- [ ] 프라이빗 키를 생성하고 .env.local에 업데이트함
- [ ] `npm run check-env` 모두 ✅ 표시됨
- [ ] 지갑 주소가 다음과 일치함:
  - [ ] 테스트넷: `0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`
  - [ ] 메인넷: `UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC`
- [ ] 테스트넷 TON 0.05 이상 보유
- [ ] `npm run build` 완료됨

---

## 🎯 다음 실행 단계

### 지금 바로 실행할 명령어:

```bash
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts

# 1단계: 프라이빗 키 생성
npm run generate-private-key

# 2단계: 출력된 프라이빗 키 복사 후 .env.local에 붙여넣기
# (수동으로 파일 편집)

# 3단계: 환경 검증
npm run check-env

# 4단계: 배포 (A 또는 B 선택)
# A: TonConnect 방식
npm run deploy

# B: 직접 배포 방식
npm run deploy:direct -- --testnet
```

---

## 📞 문제 발생 시

**1단계**: 다음 파일 확인
- `docs/ENV_FIX_GUIDE.md` - 환경 변수 가이드
- `contracts/.env.local` - 환경 변수 설정
- `contracts/DEPLOYMENT_GUIDE.md` - 배포 가이드

**2단계**: 환경 검증 실행
```bash
npm run check-env
```

**3단계**: 문제 분석 및 수동 수정

---

**작성일**: 2025-10-26  
**상태**: 🔄 Step 1-3 실행 대기 중  
**다음 단계**: 프라이빗 키 생성 및 .env.local 업데이트
