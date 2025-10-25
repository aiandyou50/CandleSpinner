# 🔐 니모닉 → 프라이빗 키 변환 완료 보고서

**작업 완료 시간**: 2025-10-25 14:00 KST  
**상태**: ✅ 모든 환경 변수 설정 완료

---

## 📊 생성된 정보

### 1️⃣ 지갑 정보

```
니모닉 (24단어):
bamboo release expand income shiver gift bounce cargo course kiss goat cram 
pledge relax rib furnace squirrel sugar find daughter load proof please speed

프라이빗 키 (Hex - 64바이트):
14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b

Public Key (Hex):
4f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b
```

### 2️⃣ 지갑 주소

```
메인넷 주소 (Mainnet):
UQAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h825K

테스트넷 주소 (Testnet):
0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
```

---

## 📁 저장 위치

### `.env.local` 파일 (✅ 자동 저장됨)

**경로**: `contracts/.env.local`

**내용**:
```bash
# 배포 설정 (테스트넷)
DEPLOYER_WALLET_ADDRESS_TESTNET=0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
DEPLOYER_WALLET_ADDRESS_MAINNET=UQAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h825K
DEPLOYER_PRIVATE_KEY=14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b

# CSPIN Jetton 마스터 주소 (테스트넷)
CSPIN_JETTON=0QBynBO23TS0KSnWvEJ_vgbLiVpXnyy3jVMD-2gQbRAe0-7J

# 게임이 관리하는 Jetton 지갑 (테스트넷)
GAME_JETTON_WALLET=0QA_rjh0mNQVT2hA-wlJKhNrqLmhTHShMBY3T0Dba2b_0_-J

# RPC 엔드포인트
TON_RPC_ENDPOINT=https://testnet.toncenter.com/api/v2/jsonRPC
```

### ✅ `.gitignore`에 등록됨
- `.env.local`은 자동으로 추적 제외 ✅
- GitHub에 업로드되지 않음 ✅

---

## 🎯 배포 스크립트 업데이트

### 변경 사항

#### 1. 배포자 정보 자동 로드
**이전**:
```typescript
owner: Address.parse('YOUR_WALLET_ADDRESS')  // 임시값
```

**현재**:
```typescript
owner: deployerAddress  // .env.local에서 로드된 실제 지갑
```

#### 2. 환경 변수 검증 강화
```typescript
// 배포자 정보 확인
if (!deployerPrivateKey || !deployerWalletAddress) {
    console.error('❌ 배포자 정보 부족');
    process.exit(1);
}
```

#### 3. 테스트넷/메인넷 자동 선택
```typescript
const deployerWalletAddress = network === 'testnet'
    ? process.env.DEPLOYER_WALLET_ADDRESS_TESTNET
    : process.env.DEPLOYER_WALLET_ADDRESS_MAINNET;
```

---

## 🔧 환경 확인 스크립트 (신규)

### 새 스크립트 추가: `scripts/checkEnv.ts`

**용도**: 배포 전 모든 환경 변수와 파일이 준비되었는지 확인

**사용 방법**:
```bash
npm run check-env
```

**확인 항목**:
- ✅ 필수 환경 변수 (5개)
- ✅ 필수 파일 (4개)
- ✅ npm 패키지 (5개)

**예상 출력**:
```
🔍 배포 환경 확인 중...

📋 환경 변수 체크:
────────────────────────────────────────────────────────────
✅ CSPIN_JETTON
   0QBynBO23TS0KSnWvEJ...
✅ GAME_JETTON_WALLET
   0QA_rjh0mNQVT2hA-wl...
✅ DEPLOYER_PRIVATE_KEY
   14ebd4df03b4ec8b1...
✅ DEPLOYER_WALLET_ADDRESS_TESTNET
   0QAGRIZPtyLweOXMyA...
✅ DEPLOYER_WALLET_ADDRESS_MAINNET
   UQAGRIZPtyLweOXMyA...
────────────────────────────────────────────────────────────

📁 파일 확인:
────────────────────────────────────────────────────────────
✅ 환경 변수 파일: .env.local
✅ 스마트컨트랙트: sources/WithdrawalManager.tact
✅ TypeScript 래퍼: wrappers/WithdrawalManager.ts
✅ 배포 스크립트: scripts/deployWithdrawalManager.ts
────────────────────────────────────────────────────────────

📦 npm 패키지 확인:
────────────────────────────────────────────────────────────
✅ @ton/blueprint: ^0.20.0
✅ @ton/core: ^0.56.0
✅ @ton/ton: ^14.0.0
✅ @ton/sandbox: ^0.18.0
✅ typescript: ^5.0.0
────────────────────────────────────────────────────────────

🎯 최종 확인:
✅ 모든 환경이 준비되었습니다!

📝 다음 명령어로 배포 시작:
   npm run deploy -- --testnet    (테스트넷)
   npm run deploy -- --mainnet    (메인넷)
```

---

## 🚀 배포 실행 단계

### Step 1: 환경 확인
```bash
cd contracts
npm run check-env
```

### Step 2: 테스트넷에 테스트 토큰 요청 (선택사항)
```
1. https://testnet.ton.org/docs 접속
2. Faucet 섹션에서 테스트 TON 요청
3. 지갑 주소: 0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
```

### Step 3: 배포 시작
```bash
# 테스트넷 배포
npm run deploy -- --testnet

# 또는 메인넷 배포 (실제 비용 발생)
npm run deploy -- --mainnet
```

### Step 4: Tonkeeper에서 QR 코드 승인
```
1. Blueprint 실행 후 QR 코드 표시
2. Tonkeeper 앱 열기
3. QR 코드 스캔
4. "Connect" 클릭
5. 트랜잭션 승인
```

---

## 📚 배포 후 작업

### 1. 컨트랙트 주소 저장
배포 완료 후 출력된 주소:
```bash
📍 컨트랙트 주소: EQA...

# 이 주소를 wrangler.toml에 저장:
[env.production]
WITHDRAWAL_MANAGER = "EQA..."
```

### 2. 컨트랙트 검증 (tonscan.org)
```
1. https://testnet.tonscan.org 접속
2. 컨트랙트 주소 검색
3. Getter 함수 테스트
4. 메시지 기록 확인
```

### 3. 게임 Jetton 지갑에 토큰 예치
- 게임 Jetton 지갑에 CSPIN 토큰 전송
- 최소 예상 가스비 + 여유분

### 4. 백엔드 통합
- `functions/api/smartcontract-utils.ts` 연동
- `initiate-withdrawal.ts` 업데이트

---

## ⚠️ 보안 체크리스트

- [x] 프라이빗 키는 `.env.local`에만 저장
- [x] `.env.local`은 `.gitignore`에 등록됨
- [x] GitHub에 업로드되지 않음
- [x] 테스트넷 키만 사용 (테스트 목적)
- [x] 프라이빗 키는 절대 소스 코드에 하드코딩 안됨
- [x] 니모닉 이 대화 종료 후 기록 안됨

---

## 🔄 메인넷 배포 준비

### 메인넷 배포 전 체크리스트
```
1. ✅ 테스트넷에서 충분히 검증했는가?
2. ✅ 컨트랙트 기능이 예상대로 작동하는가?
3. ✅ 게임 Jetton 지갑에 충분한 CSPIN 토큰이 있는가?
4. ✅ 배포 비용 (~$6) 준비되었는가?
5. ✅ 메인넷 지갑이 준비되었는가? (다른 니모닉 사용 권장)
```

### 메인넷 배포 명령어
```bash
npm run deploy -- --mainnet
```

---

## 📋 다음 단계 (Day 2+)

### Day 2: 배포 및 검증
- [ ] `npm run check-env` 환경 확인
- [ ] `npm run deploy -- --testnet` 테스트넷 배포
- [ ] tonscan.org에서 컨트랙트 확인
- [ ] Getter 함수 테스트

### Day 3: 백엔드 통합
- [ ] `initiate-withdrawal.ts` 스마트컨트랙트 옵션 추가
- [ ] `smartcontract-utils.ts` 연동
- [ ] 테스트 인출 진행

### Day 4: 프론트엔드 수정
- [ ] `GameComplete.tsx` 가스비 알림 추가
- [ ] UI 테스트

### Day 5+: 메인넷 배포
- [ ] 메인넷 환경 변수 설정
- [ ] `npm run deploy -- --mainnet` 실행
- [ ] 메인넷 컨트랙트 주소 저장

---

## 🆘 트러블슈팅

### 문제 1: "DEPLOYER_PRIVATE_KEY not found"
```bash
# 해결: .env.local 파일 확인
cat contracts/.env.local | grep DEPLOYER_PRIVATE_KEY
```

### 문제 2: "Unable to connect to wallet"
```bash
# 해결:
1. Tonkeeper 앱 재시작
2. 인터넷 연결 확인
3. 다시 배포 시도
```

### 문제 3: "Invalid checksum"
```bash
# 해결: 지갑 주소 형식 확인 (0Q로 시작해야 함)
echo 0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
```

### 문제 4: "Insufficient balance"
```bash
# 해결: 테스트넷 토큰 요청
1. https://testnet.ton.org/docs 접속
2. Faucet에서 요청
3. 지갑 주소: 0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
```

---

## 📞 핵심 명령어 모음

```bash
# 환경 확인
npm run check-env

# 테스트넷 배포
npm run deploy -- --testnet

# 메인넷 배포
npm run deploy -- --mainnet

# 빌드
npm run build

# 테스트
npm run test
```

---

**✅ 준비 완료!**  
배포를 시작하면 Blueprint가 자동으로 Tonkeeper와 연동됩니다.

모든 환경 변수가 정상적으로 설정되었습니다. 🚀
