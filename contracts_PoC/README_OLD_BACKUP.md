# 🎰 CSPIN Withdrawal Smart Contract# CSPIN Withdrawal System - Smart Contract# 🎯 CandleSpinner 스마트컨트랙트 프로젝트



TON 블록체인 기반 CSPIN 토큰 인출 시스템



## 📋 프로젝트 개요> 게임지갑에서 사용자 지갑으로 CSPIN 토큰을 인출하는 스마트 컨트랙트  ## 📋 개요



사용자가 게임에서 획득한 CSPIN 토큰을 자신의 지갑으로 인출할 수 있는 스마트 컨트랙트입니다.> **모든 네트워크 수수료는 사용자가 부담합니다**



**주요 특징:**사용자 지불형 CSPIN 토큰 인출 시스템을 위한 TON 블록체인 스마트컨트랙트

- ✅ Pull-based 인출 시스템 (사용자가 직접 요청)

- ✅ 보안 기능 (긴급 정지, 인출 한도)## 🎯 핵심 기능

- ✅ 관리자 권한 관리

- ✅ 테스트넷/메인넷 지원**상태**: ✅ 개발 완료 | 테스트 준비 중



---- ✅ **Jetton 표준 기반**: TEP-74 표준 준수



## 🚀 빠른 시작- ✅ **사용자가 수수료 부담**: `forward_ton_amount` 파라미터---



### 1. 설치- ✅ **안전한 거래**: Owner 검증 + 유효성 검사



```bash- ✅ **추적 가능한 거래**: 모든 거래 로깅## � **배포자 지갑 정보** (DO NOT LOSE)

npm install

```



### 2. 컴파일## 📁 프로젝트 구조⚠️ **중요**: 다음 정보는 절대 분실하면 안 됩니다!



```bash

npx blueprint build

``````### 니모닉 시드 (24단어)



### 3. 배포contracts/```



**테스트넷:**├── sources/bamboo release expand income shiver gift bounce cargo course kiss goat cram 

```bash

npx blueprint run deploySecure --testnet│   └── CSPINWithdrawal.tact      # 메인 스마트 컨트랙트pledge relax rib furnace squirrel sugar find daughter load proof please speed

```

├── scripts/```

**메인넷:**

```bash│   └── deploy.ts                  # 배포 스크립트

npx blueprint run deploySecure --mainnet

```├── wrappers/### 생성된 주소



---│   └── CSPINWithdrawal.ts        # TypeScript 래퍼- **테스트넷**: `0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`



## 📂 디렉토리 구조├── build.tact                     # 빌드 설정- **메인넷**: `UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC`



```├── package.json                   # 프로젝트 설정

contracts/

├── sources/                    # Tact 스마트 컨트랙트├── WITHDRAWAL_SYSTEM_DESIGN.md   # 전체 설계서### 프라이빗 키

│   ├── CSPINWithdrawal.tact           # 기본 버전

│   └── CSPINWithdrawalSecure.tact     # 보안 강화 버전 (권장)└── README.md                      # 이 파일- `.env.local`의 `DEPLOYER_PRIVATE_KEY`로 자동 관리됨 ✅

│

├── scripts/                    # 관리 스크립트```

│   ├── deploySecure.ts               # 컨트랙트 배포

│   ├── setClaimable.ts               # 인출 가능 금액 설정---

│   ├── pauseContract.ts              # 긴급 정지

│   ├── unpauseContract.ts            # 정지 해제## 🚀 빠른 시작

│   └── quickSetClaimable.ts          # 빠른 설정 (Mnemonic)

│## 📋 개요

├── frontend-poc/              # PoC 웹 인터페이스

│   └── index.html                    # 사용자 인출 페이지### 1. 설치

│

├── wrappers/                  # TypeScript 래퍼```

├── build/                     # 컴파일된 파일

└── tests/                     # 로컬 테스트```bashcontracts/

```

cd contracts├── sources/

---

npm install│   └── WithdrawalManager.tact       # ✅ 스마트컨트랙트 (400줄)

## 📚 문서

```├── tests/

- **[SCRIPTS.md](./SCRIPTS.md)**: 스크립트 사용법 가이드

- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**: 관리자 기능 가이드│   └── WithdrawalManager.spec.ts    # ✅ 테스트 정의 (11개 케이스)

- **[POC_GUIDE.md](./POC_GUIDE.md)**: 프론트엔드 PoC 가이드

- **[SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md)**: 보안 권장사항### 2. 환경 설정├── wrappers/



---│   └── WithdrawalManager.ts         # ✅ TypeScript 래퍼



## 🔑 주요 기능`.env.local` 파일 생성 (루트 디렉토리):├── scripts/



### 1. 사용자 기능│   └── deployWithdrawalManager.ts   # ✅ 배포 스크립트

- **ClaimRequest**: 설정된 금액만큼 CSPIN 토큰 인출

```env├── build/                           # 컴파일 결과 (자동 생성)

### 2. 관리자 기능 (Owner만 실행 가능)

- **SetClaimable**: 사용자별 인출 가능 금액 설정# 배포자 정보├── package.json                     # ✅ 의존성

- **Pause/Unpause**: 긴급 정지 및 재개

- **UpdateGameWallet**: 게임 지갑 주소 변경DEPLOYER_MNEMONIC=bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed├── tsconfig.json                    # ✅ TypeScript 설정

- **UpdateOwner**: 관리자 권한 이전

├── build.tact                       # ✅ Tact 빌드 설정

---

# 게임 정보└── README.md                        # ✅ 이 파일

## ⚙️ 설정

GAME_WALLET=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd```

### 컨트랙트 초기 설정값



```typescript

// sources/CSPINWithdrawalSecure.tact# Jetton 정보## 🚀 빠른 시작

jettonMasterAddress: Address  // CSPIN Jetton Master 주소

gameWallet: Address           // 게임 지갑 주소 (토큰 보유자)CSPIN_JETTON=EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV

owner: Address                // 관리자 주소

maxSingleWithdraw: 1000       // 1회 최대 인출 한도 (CSPIN)CSPIN_GAME_JETTON_WALLET=UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd### 1️⃣ 설치

paused: false                 // 초기 상태: 정상

``````



### 프론트엔드 설정```bash



```javascript### 3. 컴파일cd contracts

// frontend-poc/index.html (10번째 줄)

const NETWORK = 'testnet';  // 'testnet' 또는 'mainnet'npm install

```

```bash```

---

npm run build

## 🧪 테스트

```**설치될 패키지:**

### 로컬 테스트넷

- `@ton/core` - TON 기본 라이브러리

```bash

npm test### 4. 테스트넷에 배포- `@ton/ton` - TON 클라이언트

```

- `@ton/sandbox` - 로컬 테스트 환경

### 테스트넷 배포 주소

```bash- `@ton/blueprint` - 배포 도구

- **컨트랙트**: `EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg`

npm run deploy:testnet- `tact` - Tact 컴파일러

---

```

## 🔒 보안

### 2️⃣ 로컬 테스트

- ✅ Owner 검증

- ✅ 긴급 정지 기능### 5. 메인넷에 배포

- ✅ 인출 한도 제한

- ✅ Reentrancy 방지 (CEI 패턴)```bash

- ✅ 입력값 검증

```bashnpm run test

자세한 내용은 [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md) 참조

npm run deploy:mainnet```

---

```

## 📞 지원

**테스트 케이스** (11개):

문제가 발생하면 다음 문서를 확인하세요:

1. [SCRIPTS.md](./SCRIPTS.md) - 스크립트 사용 중 오류## 📋 환경 변수- ✅ should deploy correctly

2. [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - 관리 기능 사용법

3. [POC_GUIDE.md](./POC_GUIDE.md) - 프론트엔드 통합- ✅ should return owner correctly



---| 변수 | 설명 | 예시 |- ✅ should return jetton addresses correctly



## 📜 라이선스|------|------|------|- ✅ should handle pause correctly



MIT License| `DEPLOYER_MNEMONIC` | 배포자의 24단어 니모닉 | `bamboo release expand...` |- ✅ should reject non-owner requests



---| `GAME_WALLET` | 게임지갑 주소 | `UQBFPDd...` |- ✅ should reject zero amount



## 🔗 관련 링크| `CSPIN_JETTON` | CSPIN Jetton Master 주소 | `EQBZ6nHf...` |- ✅ should reject excessive amount



- **TON 공식 문서**: https://ton.org| `CSPIN_GAME_JETTON_WALLET` | 게임지갑의 Jetton Wallet | `UQBFPDd...` |- ✅ should handle withdrawal request

- **Tact 언어**: https://tact-lang.org

- **Blueprint**: https://github.com/ton-org/blueprint- ✅ should collect gas fees


## 🔄 작동 원리- ✅ should pause contract and reject requests

- ✅ should accumulate multiple withdrawals

```mermaid

사용자 (프론트엔드)### 3️⃣ 테스트넷 배포

    ↓ [인출 요청]

백엔드 API (/api/initiate-withdrawal)```bash

    ↓# 환경 변수 설정

스마트 컨트랙트 (CSPINWithdrawal.requestWithdrawal)export CSPIN_JETTON="EQB..."

    ↓export GAME_JETTON_WALLET="EQC..."

게임지갑 Jetton Walletexport DEPLOYER_PRIVATE_KEY="..."

    ↓ [transfer operation]

사용자 Jetton Wallet ✅# 배포

```npm run deploy -- --testnet

```

## 📊 수수료 구조

### 4️⃣ 메인넷 배포

사용자가 지불해야 할 총 비용:

```bash

```# 환경 변수 변경 (mainnet)

forwardTon = 0.15 TON (권장)export CSPIN_JETTON="EQBvp..."

  + 스마트 컨트랙트 가스비: ~0.05 TONexport GAME_JETTON_WALLET="EQCv..."

  + Jetton Wallet 처리비: ~0.02 TONexport DEPLOYER_PRIVATE_KEY="..."

  ─────────────────────────

  합계: ~0.22 TON# 배포 (비용: ~$6)

npm run deploy -- --mainnet

- 최소값: 0.05 TON```

- 권장값: 0.15 TON

- 안전값: 0.25 TON## 📝 스마트컨트랙트 기능

```

### 핵심 기능

## 🔍 주요 코드

1. **사용자 인출 요청 처리**

### 인출 요청 처리   - 게임 백엔드에서 인출 요청 수신

   - 사용자 지갑에서 가스비 청구 (약 $0.01)

```typescript   - Jetton 표준에 따라 토큰 전송

// 백엔드에서 호출

await contract.requestWithdrawal(2. **가스비 관리**

    amount,           // 100 (CSPIN)   - 사용자가 개별적으로 가스비 부담

    userAddress,      // UQ... (사용자 주소)   - 게임이 징수한 가스비 회수 가능

    forwardTon        // 150000000 (0.15 TON)

);3. **긴급 기능**

```   - 정지/재개 (pause/resume)

   - 모니터링 (통계 조회)

### 스마트 컨트랙트 로직

### 메시지 타입

```tact

fun requestWithdrawal(```tact

    amount: Int,message WithdrawalRequest {

    userAddress: Address,  queryId: UInt64;        // 요청 ID

    forwardTon: Int  amount: Coins;          // 인출 금액 (nanotons)

) {  destination: Address;   // 수신자 주소

    require(amount > 0, "Amount must be positive");}

    require(forwardTon > 0, "Forward amount must be positive");

    message WithdrawGasCollection {

    // 게임지갑의 Jetton Wallet에 transfer 메시지 전송  queryId: UInt64;

    send(SendParameters {}

        to: self.cspinGameWallet,```

        value: forwardTon + ton("0.1"),

        mode: SendPayGasSeparately,### Getter 함수

        body: beginCell()

            .storeUint(0xf8a7ea5, 32)      // transfer operation```tact

            .storeUint(0, 64)               // queryIdget fun stats(): (Int, Int, Int, Bool)

            .storeCoins(amount)             // amountget fun isPaused(): Bool

            .storeAddress(userAddress)      // destinationget fun getProcessedRequests(): Int

            .storeAddress(self.owner)       // response_addressget fun getTotalWithdrawn(): Int

            .storeBit(0)                    // custom_payloadget fun getTotalGasCollected(): Int

            .storeCoins(forwardTon)         // forward_ton_amountget fun getOwner(): Address

            .storeBit(0)                    // forward_payloadget fun getGameJettonWallet(): Address

            .endCell()get fun getJettonMaster(): Address

    });```

}

```## 🔗 백엔드 통합



## 🧪 테스트### 환경 변수 설정 (wrangler.toml)



```bash```toml

npm run test[env.production]

```vars = {

  WITHDRAWAL_MANAGER = "EQD...",    # 배포된 컨트랙트 주소

## 📖 자세한 정보  CSPIN_JETTON = "EQBvp...",        # CSPIN Jetton Master

  GAME_JETTON_WALLET = "EQCv...",   # 게임의 CSPIN 지갑

전체 설계서는 `WITHDRAWAL_SYSTEM_DESIGN.md`를 참고하세요.  TON_RPC_ENDPOINT = "https://toncenter.com/api/v2/jsonRPC"

}

주요 섹션:```

- **시스템 아키텍처**: 3단계 프로세스

- **구현 방식**: 스마트 컨트랙트, 백엔드, 프론트엔드### TypeScript에서 사용

- **배포 단계**: 단계별 배포 가이드

- **보안**: 검증 및 거래 추적```typescript

import { handleSmartContractWithdrawal } from './smartcontract-utils';

## 🔗 참고 자료

// 인출 처리

- [TON Blockchain Docs](https://docs.ton.org)const result = await handleSmartContractWithdrawal(

- [Jetton Standard (TEP-74)](https://github.com/ton-blockchain/TEPs/tree/master/text/0074-jettons-standard)  context,

- [TON Blueprint](https://github.com/ton-blockchain/blueprint)  userAddress,

- [Tact Language](https://docs.tact-lang.org)  amount,

  BigInt(Date.now())

## 📝 라이선스);



MITif (result.success) {

  console.log('✅ 인출 완료');

---} else {

  console.error('❌ 인출 실패:', result.error);

**개발**: CandleSpinner Game Team  }

**마지막 업데이트**: 2025-10-26```


## 📊 모니터링

### 컨트랙트 통계 조회

```typescript
import { getMonitoringInfo } from './smartcontract-utils';

const info = await getMonitoringInfo(context);
console.log(info);

// 출력 예:
// {
//   status: 'healthy',
//   contract: {
//     address: 'EQD...',
//     stats: {
//       processedRequests: '1234',
//       totalWithdrawn: '123456',
//       totalGasCollected: '12.34',
//       isPaused: false,
//       gasFee: '0.01'
//     }
//   },
//   timestamp: '2025-10-25T...'
// }
```

## 🛡️ 보안 특징

- ✅ 권한 검증 (owner만 호출 가능)
- ✅ 금액 검증 (범위 체크)
- ✅ Jetton 표준 준수 (TEP-74)
- ✅ 정지/재개 기능
- ✅ 재진입 공격(Reentrancy) 방지
- ✅ 오버플로우 방지 (Tact 자동)

## 📈 비용 분석

| 항목 | 비용 | 설명 |
|------|------|------|
| **초기 배포** | ~$6 | TON 가스비 (1회만) |
| **감사/감시** | $0 | 제외됨 |
| **월 운영 비용** | $0 | 모든 비용이 사용자에게 부담 |
| **사용자당 인출** | ~$0.01 | 가스비 (사용자 지불) |

## 🔄 인출 플로우

```
사용자가 "인출" 클릭
       ↓
게임 백엔드 → 스마트컨트랙트 호출
       ↓
스마트컨트랙트:
  1. 권한 검증
  2. 금액 검증
  3. 사용자 지갑에서 가스비 청구 (약 $0.01)
  4. Jetton 마스터로 토큰 전송
       ↓
사용자 ← CSPIN 토큰 수신
```

## ⚠️ 주의사항

1. **프라이빗 키 관리**
   - DEPLOYER_PRIVATE_KEY를 안전하게 보관하세요
   - .env 파일에 저장하지 마세요

2. **게임 Jetton 지갑**
   - 사전에 충분한 CSPIN 토큰을 예치해야 함

3. **초기 배포**
   - 테스트넷에서 충분히 테스트 후 메인넷 배포

4. **감사 권장**
   - 사용자 > 2,000명일 때 전문 감사 권장

## 📞 지원

질문이나 문제가 있으면:
- 기술 가이드: `/docs/solutions/[기술가이드]_스마트컨트랙트_배포_통합_20251025.md`
- 제안서: `/docs/solutions/[제안서]_스마트컨트랙트_사용자지불_구현_20251025.md`

## 📄 라이선스

MIT License - CandleSpinner Game Team

---

**마지막 업데이트**: 2025-10-25  
**상태**: ✅ 개발 완료 (테스트 대기)
