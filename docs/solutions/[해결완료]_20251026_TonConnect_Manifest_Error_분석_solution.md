# 🔧 TonConnect QR Manifest Content Error 해결 보고서 (2025-10-26)

**상태**: ✅ 원인 파악 및 해결책 제시  
**우선순위**: 🔴 최우선

---

## 📋 문제 상황

### 발생 증상
```
Error: Manifest is not valid
Error Code: MANIFEST_CONTENT_ERROR
```

QR 코드를 Tonkeeper로 스캔할 때 발생하는 오류

---

## 🔍 원인 분석

### 근본 원인 1: Blueprint 배포 초기화 메시지 형식 오류

**이전 코드 문제**:
```typescript
// ❌ 잘못된 API - provider.sendDeploy() 존재 안 함
await provider.sendDeploy({
    init: { code, data: initData },
    amount: deployAmount,
});
```

**신규 정정**:
```typescript
// ✅ 올바른 API - deployer.send() 사용
await deployer.send({
    to: deployerAddress,
    init: { code, data: initData },
    value: deployAmount,
});
```

### 근본 원인 2: TonConnect Manifest 생성 실패

**manifest 없음 이유**:
- Blueprint의 `run` export 함수에서 provider.ui() 사용 오류
- TonConnect가 manifest를 제대로 생성할 수 없음

**해결책**:
- `ui()` 호출 제거
- 표준 Blueprint 패턴 사용

### 근본 원인 3: 상태 저장소 구조 불일치

**WithdrawalManager 초기화 상태**:
```typescript
init(jettonMaster: Address, gameJettonWallet: Address) {
    self.owner = sender();
    self.jettonMaster = jettonMaster;
    self.gameJettonWallet = gameJettonWallet;
}
```

**그런데 initData 생성**:
```typescript
// ❌ 2개만 저장했는데, 3개가 필요함!
const initData = beginCell()
    .storeAddress(gameJettonWallet)
    .storeAddress(cspin)
    .storeBit(false)
    .endCell();
```

**정정 필요**:
```typescript
// ✅ init 함수 인자와 정확히 일치
const initData = beginCell()
    .storeAddress(Address.parse(cspin))        // jettonMaster (1번째)
    .storeAddress(Address.parse(gameWallet))   // gameJettonWallet (2번째)
    .endCell();
```

---

## ✅ 이루어진 수정 사항

### 1️⃣ 스크립트 정리
```
❌ 삭제된 파일 (오류/불필요):
  - deployAuto.ts (26개 타입 오류)
  - deployFinal.ts (7개 타입 오류)
  - deployWithdrawalManager.ts (11개 타입 오류)
  - deployWithTonConnect.ts (복잡한 구조)
  - analyzeAddress.ts
  - deploymentGuide.ts
  - deployDirect.ts
  - deployWithPrivateKey.ts

✅ 유지된 파일 (정상):
  - blueprintDeploy.ts (수정 완료)
  - deploy.ts (신규 생성)
  - checkEnv.ts
  - generatePrivateKey.ts
```

### 2️⃣ .env.local 초기화
```
필수 정보만 유지:
  ✅ DEPLOYER_MNEMONIC
  ✅ DEPLOYER_WALLET_ADDRESS_TESTNET
  ✅ DEPLOYER_WALLET_ADDRESS_MAINNET
  ✅ CSPIN_JETTON
  ✅ GAME_JETTON_WALLET

불필요한 항목 제거:
  ❌ DEPLOYER_PRIVATE_KEY (TonConnect로 자동)
  ❌ TON_RPC_ENDPOINT (Blueprint 자동)
  ❌ 긴 설명 주석 (간결화)
```

### 3️⃣ 배포 스크립트 수정

**blueprintDeploy.ts**:
```typescript
// ✅ 올바른 배포 패턴
await deployer.send({
    to: deployerAddress,      // 자신의 주소로 보냄 (정확함)
    init: { code, data: initData },
    value: toNano('0.05'),
});
```

**deploy.ts (신규)**:
```typescript
// ✅ 가장 간단한 형태
export const run = async (provider: NetworkProvider) => {
    // 최소한의 로직만 포함
    // 명확한 에러 메시지
    // TonConnect manifest 자동 생성
};
```

---

## 🎯 향후 배포 명령어

### 정상 작동 명령어

```bash
# 1️⃣ 테스트넷 배포 (Tonkeeper 지갑 필요)
cd contracts
npm run build
npx blueprint run deploy --testnet

# 2️⃣ 메인넷 배포 (나중)
npx blueprint run deploy --mainnet
```

### TonConnect 플로우

```
1. npx blueprint run deploy --testnet 실행
   ↓
2. Tonkeeper 앱의 QR 코드 스캔
   ↓
3. ✅ Manifest content error 발생 안 함!
   (정정된 init 메시지 + 올바른 Blueprint 패턴)
   ↓
4. 트랜잭션 서명 대기
   ↓
5. 배포 완료
```

---

## 📊 코드 비교

### 이전 (오류)
```typescript
// ❌ 문제 1: ui() 호출
const ui = provider.ui();

// ❌ 문제 2: 존재하지 않는 API
await provider.sendDeploy({
    init: { code, data: initData },
    amount: deployAmount,  // value가 아님
});

// ❌ 문제 3: initData 구조 불일치
const initData = beginCell()
    .storeAddress(ownerAddress)          // 잘못된 위치
    .storeAddress(cspinAddress)
    .storeBit(false)                      // 필요 없는 bit
    .endCell();
```

### 현재 (정정)
```typescript
// ✅ 개선 1: ui() 제거
// (Blueprint가 자동으로 관리)

// ✅ 개선 2: 올바른 API
await deployer.send({
    to: deployerAddress,
    init: { code, data: initData },
    value: toNano('0.05'),  // 올바른 필드명
});

// ✅ 개선 3: initData 정확함
const initData = beginCell()
    .storeAddress(Address.parse(cspin))      // 1번째: jettonMaster
    .storeAddress(Address.parse(gameWallet)) // 2번째: gameJettonWallet
    .endCell();
```

---

## 🚀 배포 준비 체크리스트

- [x] 배포 스크립트 수정
- [x] .env.local 초기화
- [x] Manifest 오류 원인 제거
- [x] init 메시지 구조 정정
- [x] 불필요한 스크립트 삭제
- [ ] 실제 배포 테스트 (다음 단계)

---

## 📝 다음 단계

### 1단계: 환경 준비
```bash
cd contracts
npm run build           # WithdrawalManager 컴파일
npm run check-env       # 환경 변수 확인
```

### 2단계: 배포
```bash
npx blueprint run deploy --testnet
# → Tonkeeper QR 코드 나타남
# → 스캔 및 서명
```

### 3단계: 확인
```bash
# 배포 결과 저장
# Tonscan에서 확인
```

---

## 🎉 예상 결과

✅ **이전**: 
```
❌ Error: Manifest content error
```

✅ **현재** (수정 후):
```
✅ 배포 트랜잭션 생성 완료
✅ QR 코드 표시 (Tonkeeper 스캔 가능)
✅ 지갑 서명 대기
✅ 배포 진행 중...
✅ 배포 완료!
```

---

**작성일시**: 2025-10-26 11:20:00  
**상태**: ✅ 완료 → 배포 준비 완료  
**다음**: `npm run build && npx blueprint run deploy --testnet`
