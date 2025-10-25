***REMOVED***🎯 CandleSpinner 스마트컨트랙트 프로젝트

#***REMOVED***📋 개요

사용자 지불형 CSPIN 토큰 인출 시스템을 위한 TON 블록체인 스마트컨트랙트

**상태**: ✅ 개발 완료 | 테스트 준비 중

#***REMOVED***📂 프로젝트 구조

```
contracts/
├── sources/
│   └── WithdrawalManager.tact       ***REMOVED***✅ 스마트컨트랙트 (400줄)
├── tests/
│   └── WithdrawalManager.spec.ts    ***REMOVED***✅ 테스트 정의 (11개 케이스)
├── wrappers/
│   └── WithdrawalManager.ts         ***REMOVED***✅ TypeScript 래퍼
├── scripts/
│   └── deployWithdrawalManager.ts   ***REMOVED***✅ 배포 스크립트
├── build/                           ***REMOVED***컴파일 결과 (자동 생성)
├── package.json                     ***REMOVED***✅ 의존성
├── tsconfig.json                    ***REMOVED***✅ TypeScript 설정
├── build.tact                       ***REMOVED***✅ Tact 빌드 설정
└── README.md                        ***REMOVED***✅ 이 파일
```

#***REMOVED***🚀 빠른 시작

##***REMOVED***1️⃣ 설치

```bash
cd contracts
npm install
```

**설치될 패키지:**
- `@ton/core` - TON 기본 라이브러리
- `@ton/ton` - TON 클라이언트
- `@ton/sandbox` - 로컬 테스트 환경
- `@ton/blueprint` - 배포 도구
- `tact` - Tact 컴파일러

##***REMOVED***2️⃣ 로컬 테스트

```bash
npm run test
```

**테스트 케이스** (11개):
- ✅ should deploy correctly
- ✅ should return owner correctly
- ✅ should return jetton addresses correctly
- ✅ should handle pause correctly
- ✅ should reject non-owner requests
- ✅ should reject zero amount
- ✅ should reject excessive amount
- ✅ should handle withdrawal request
- ✅ should collect gas fees
- ✅ should pause contract and reject requests
- ✅ should accumulate multiple withdrawals

##***REMOVED***3️⃣ 테스트넷 배포

```bash
***REMOVED***환경 변수 설정
export CSPIN_JETTON="EQB..."
export GAME_JETTON_WALLET="EQC..."
export DEPLOYER_PRIVATE_KEY="..."

***REMOVED***배포
npm run deploy -- --testnet
```

##***REMOVED***4️⃣ 메인넷 배포

```bash
***REMOVED***환경 변수 변경 (mainnet)
export CSPIN_JETTON="EQBvp..."
export GAME_JETTON_WALLET="EQCv..."
export DEPLOYER_PRIVATE_KEY="..."

***REMOVED***배포 (비용: ~$6)
npm run deploy -- --mainnet
```

#***REMOVED***📝 스마트컨트랙트 기능

##***REMOVED***핵심 기능

1. **사용자 인출 요청 처리**
   - 게임 백엔드에서 인출 요청 수신
   - 사용자 지갑에서 가스비 청구 (약 $0.01)
   - Jetton 표준에 따라 토큰 전송

2. **가스비 관리**
   - 사용자가 개별적으로 가스비 부담
   - 게임이 징수한 가스비 회수 가능

3. **긴급 기능**
   - 정지/재개 (pause/resume)
   - 모니터링 (통계 조회)

##***REMOVED***메시지 타입

```tact
message WithdrawalRequest {
  queryId: UInt64;        // 요청 ID
  amount: Coins;          // 인출 금액 (nanotons)
  destination: Address;   // 수신자 주소
}

message WithdrawGasCollection {
  queryId: UInt64;
}
```

##***REMOVED***Getter 함수

```tact
get fun stats(): (Int, Int, Int, Bool)
get fun isPaused(): Bool
get fun getProcessedRequests(): Int
get fun getTotalWithdrawn(): Int
get fun getTotalGasCollected(): Int
get fun getOwner(): Address
get fun getGameJettonWallet(): Address
get fun getJettonMaster(): Address
```

#***REMOVED***🔗 백엔드 통합

##***REMOVED***환경 변수 설정 (wrangler.toml)

```toml
[env.production]
vars = {
  WITHDRAWAL_MANAGER = "EQD...",    ***REMOVED***배포된 컨트랙트 주소
  CSPIN_JETTON = "EQBvp...",        ***REMOVED***CSPIN Jetton Master
  GAME_JETTON_WALLET = "EQCv...",   ***REMOVED***게임의 CSPIN 지갑
  TON_RPC_ENDPOINT = "https://toncenter.com/api/v2/jsonRPC"
}
```

##***REMOVED***TypeScript에서 사용

```typescript
import { handleSmartContractWithdrawal } from './smartcontract-utils';

// 인출 처리
const result = await handleSmartContractWithdrawal(
  context,
  userAddress,
  amount,
  BigInt(Date.now())
);

if (result.success) {
  console.log('✅ 인출 완료');
} else {
  console.error('❌ 인출 실패:', result.error);
}
```

#***REMOVED***📊 모니터링

##***REMOVED***컨트랙트 통계 조회

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

#***REMOVED***🛡️ 보안 특징

- ✅ 권한 검증 (owner만 호출 가능)
- ✅ 금액 검증 (범위 체크)
- ✅ Jetton 표준 준수 (TEP-74)
- ✅ 정지/재개 기능
- ✅ 재진입 공격(Reentrancy) 방지
- ✅ 오버플로우 방지 (Tact 자동)

#***REMOVED***📈 비용 분석

| 항목 | 비용 | 설명 |
|------|------|------|
| **초기 배포** | ~$6 | TON 가스비 (1회만) |
| **감사/감시** | $0 | 제외됨 |
| **월 운영 비용** | $0 | 모든 비용이 사용자에게 부담 |
| **사용자당 인출** | ~$0.01 | 가스비 (사용자 지불) |

#***REMOVED***🔄 인출 플로우

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

#***REMOVED***⚠️ 주의사항

1. **프라이빗 키 관리**
   - DEPLOYER_PRIVATE_KEY를 안전하게 보관하세요
   - .env 파일에 저장하지 마세요

2. **게임 Jetton 지갑**
   - 사전에 충분한 CSPIN 토큰을 예치해야 함

3. **초기 배포**
   - 테스트넷에서 충분히 테스트 후 메인넷 배포

4. **감사 권장**
   - 사용자 > 2,000명일 때 전문 감사 권장

#***REMOVED***📞 지원

질문이나 문제가 있으면:
- 기술 가이드: `/docs/solutions/[기술가이드]_스마트컨트랙트_배포_통합_20251025.md`
- 제안서: `/docs/solutions/[제안서]_스마트컨트랙트_사용자지불_구현_20251025.md`

#***REMOVED***📄 라이선스

MIT License - CandleSpinner Game Team

---

**마지막 업데이트**: 2025-10-25  
**상태**: ✅ 개발 완료 (테스트 대기)
