***REMOVED***CSPIN Withdrawal System - Bootstrap Guide

#***REMOVED***🚀 Quick Start (5분 안에 시작하기)

##***REMOVED***1. 환경 요구사항

**필수:**
- Node.js 18+ (LTS 버전 권장)
- npm 또는 yarn
- Git

**선택:**
- PowerShell 7+ (Windows에서 스크립트 실행)
- VS Code (IDE 권장)
- Python 3.8+ (테스트 서버용)

##***REMOVED***2. 프로젝트 클론 및 의존성 설치

```bash
***REMOVED***프로젝트 클론
git clone <repository-url>
cd contracts

***REMOVED***의존성 설치
npm install

***REMOVED***백엔드 API 의존성 설치
cd backend-api
npm install
cd ..
```

##***REMOVED***3. 환경 변수 설정

`.env` 파일 생성:

```bash
***REMOVED***루트 디렉토리에 .env 파일 생성
cp .env.example .env
```

`.env` 파일 내용:

```env
***REMOVED***Owner 니모닉 (24단어)
OWNER_MNEMONIC="your 24 word mnemonic phrase here"

***REMOVED***또는 Cloudflare Pages 호환
GAME_WALLET_PRIVATE_KEY="your 24 word mnemonic phrase here"

***REMOVED***컨트랙트 주소 (메인넷)
CONTRACT_ADDRESS="EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc"

***REMOVED***Jetton Master 주소
JETTON_MASTER="EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"
```

**⚠️ 보안 주의:**
- `.env` 파일은 **절대** Git에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요

---

#***REMOVED***📁 프로젝트 구조

```
contracts/
├── sources/                       ***REMOVED***Tact 소스 코드
│   ├── CSPINWithdrawalVoucher.tact  ***REMOVED***서명 검증 버전 (현재 사용)
│   └── CSPINWithdrawalSecure.tact   ***REMOVED***백업 버전
│
├── scripts/                       ***REMOVED***TypeScript 배포 스크립트
│   ├── deployVoucher.ts            ***REMOVED***바우처 컨트랙트 배포
│   ├── updateContractWallet.ts     ***REMOVED***Contract Jetton Wallet 설정
│   ├── pauseContract.ts            ***REMOVED***긴급 일시정지
│   ├── unpauseContract.ts          ***REMOVED***재개
│   ├── withdrawTON.ts              ***REMOVED***TON 회수
│   ├── withdrawJetton.ts           ***REMOVED***CSPIN 회수
│   ├── setClaimable.ts             ***REMOVED***최대 인출 금액 설정
│   └── checkVoucherContract.ts     ***REMOVED***컨트랙트 상태 확인
│
├── backend-api/                   ***REMOVED***백엔드 API 서버
│   ├── server.js                   ***REMOVED***Express 서버 (서명 생성)
│   ├── package.json
│   └── README.md
│
├── frontend-poc/                  ***REMOVED***프론트엔드 PoC
│   ├── index.html                  ***REMOVED***사용자 인출 UI
│   ├── emergency-pause.html        ***REMOVED***관리자 긴급 제어
│   └── test-server.html            ***REMOVED***백엔드 테스트
│
├── wrappers/                      ***REMOVED***TypeScript 래퍼 (자동 생성)
│   ├── CSPINWithdrawalVoucher.ts
│   └── ...
│
├── build/                         ***REMOVED***컴파일된 코드 (자동 생성)
│   └── CSPINWithdrawalVoucher/
│
├── tests/                         ***REMOVED***테스트 코드
│   └── LocalTestnet.spec.ts
│
├── .env                           ***REMOVED***환경 변수 (Git 제외)
├── .env.example                   ***REMOVED***환경 변수 템플릿
├── package.json
├── tsconfig.json
├── tact.config.json
└── blueprint.yaml
```

---

#***REMOVED***🔨 빌드

##***REMOVED***Tact 컨트랙트 컴파일

```bash
***REMOVED***모든 컨트랙트 빌드
npx blueprint build

***REMOVED***특정 컨트랙트만 빌드 (선택)
npx blueprint build --contract CSPINWithdrawalVoucher
```

**빌드 결과:**
- `build/CSPINWithdrawalVoucher/` - 컴파일된 코드 (BOC, ABI 등)
- `wrappers/CSPINWithdrawalVoucher.ts` - TypeScript 래퍼

**빌드 실패 시:**
```bash
***REMOVED***캐시 삭제 후 재빌드
Remove-Item -Recurse -Force .\build\CSPINWithdrawalVoucher
Remove-Item -Force .\wrappers\CSPINWithdrawalVoucher.ts
npx blueprint build
```

---

#***REMOVED***🧪 테스트

##***REMOVED***1. 로컬 테스트넷 (Sandbox)

```bash
***REMOVED***로컬 테스트 실행
npx blueprint test
```

**테스트 파일:** `tests/LocalTestnet.spec.ts`

**테스트 내용:**
- 컨트랙트 배포
- 바우처 생성 및 사용
- Pause/Unpause
- 통계 조회

##***REMOVED***2. 프론트엔드 테스트 서버

**PowerShell:**
```powershell
.\start-test-server.ps1
```

**또는 직접 실행:**
```bash
python -m http.server 8080
```

**테스트 페이지:**
- http://localhost:8080/frontend-poc/index.html
- http://localhost:8080/frontend-poc/emergency-pause.html
- http://localhost:8080/frontend-poc/test-server.html

##***REMOVED***3. 백엔드 API 테스트

```bash
cd backend-api
npm start
```

**API 엔드포인트:**
- POST http://localhost:3000/api/request-voucher
  ```json
  {
    "amount": 10,
    "recipient": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
  }
  ```

**응답:**
```json
{
  "success": true,
  "voucher": {
    "amount": 10000000000,
    "recipient": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd",
    "nonce": 1730246400000,
    "signature": "a1b2c3d4...",
    "contractAddress": "EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc",
    "expiresAt": 1730246700000
  }
}
```

---

#***REMOVED***🚀 배포 (Mainnet)

##***REMOVED***1. 컨트랙트 배포

**PowerShell (권장):**
```powershell
.\deploy-voucher-mainnet.ps1
```

**또는 TypeScript:**
```bash
npx ts-node scripts/deployVoucher.ts
```

**배포 파라미터:**
- Owner 주소: `UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd`
- Owner Public Key: (니모닉에서 자동 추출)
- Jetton Master: `EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV`
- Game Jetton Wallet: (계산됨)
- Max Withdraw: `1000000` CSPIN

**배포 후 주소:**
- Contract: `EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc`
- Contract Jetton Wallet: `EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa`

##***REMOVED***2. Contract Jetton Wallet 설정

```bash
npx ts-node scripts/updateContractWallet.ts
```

**또는:**
```powershell
.\update-contract-wallet.ps1
```

##***REMOVED***3. Unpause (재개)

```bash
npx ts-node scripts/unpauseContract.ts
```

**또는 프론트엔드:**
http://localhost:8080/frontend-poc/emergency-pause.html → "▶️ 재개" 클릭

##***REMOVED***4. CSPIN 충전

Contract Jetton Wallet에 CSPIN 전송:
```
EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```

---

#***REMOVED***🔧 유지보수

##***REMOVED***컨트랙트 상태 확인

**PowerShell:**
```powershell
.\get-contract-stats.ps1
```

**TypeScript:**
```bash
npx ts-node scripts/checkVoucherContract.ts
```

**출력:**
```
컨트랙트 상태:
- Paused: false
- Max Single Withdraw: 1,000,000 CSPIN
- Total Withdrawn: 100,000 CSPIN
- Withdraw Count: 10
- Contract Jetton Wallet: EQBsRMhs7iA5TazpkTInpVv5kb6hqMCVzWcpG3hv1lvD6gGa
```

##***REMOVED***긴급 일시정지

```bash
npx ts-node scripts/pauseContract.ts
```

##***REMOVED***TON/CSPIN 회수

```bash
***REMOVED***TON 회수
npx ts-node scripts/withdrawTON.ts

***REMOVED***CSPIN 회수
npx ts-node scripts/withdrawJetton.ts
```

##***REMOVED***최대 인출 금액 설정

```bash
npx ts-node scripts/setClaimable.ts
```

---

#***REMOVED***📚 주요 문서

- **README.md** - 프로젝트 개요 및 아키텍처
- **QUICKSTART.md** - 빠른 시작 가이드
- **ADMIN_GUIDE.md** - 관리자 가이드 (긴급 제어)
- **GAME_INTEGRATION_GUIDE.md** - 게임 연동 가이드
- **LOCAL_TEST_GUIDE.md** - 로컬 테스트 가이드
- **POC_GUIDE.md** - PoC 데모 가이드
- **VOUCHER_SETUP_GUIDE.md** - 바우처 시스템 설정
- **SECURITY_RECOMMENDATIONS.md** - 보안 권장사항
- **CLOUDFLARE_PAGES_DEPLOYMENT.md** - Cloudflare Pages 배포 가이드
- **HANDOVER.md** - 인수인계 문서

---

#***REMOVED***🆘 트러블슈팅

##***REMOVED***빌드 실패: "npm error could not determine executable to run"

```bash
***REMOVED***package.json에 blueprint가 있는지 확인
npm list @tact-lang/compiler

***REMOVED***없으면 재설치
npm install -D @tact-lang/compiler @ton/blueprint
```

##***REMOVED***deployVoucher.ts TypeScript 오류

```bash
***REMOVED***빌드 아티팩트 삭제 후 재빌드
Remove-Item -Recurse -Force .\build\CSPINWithdrawalVoucher
Remove-Item -Force .\wrappers\CSPINWithdrawalVoucher.ts
npx blueprint build
```

##***REMOVED***"Failed Transfer" 오류

**원인:** 컨트랙트가 Paused 상태이거나 서명 검증 실패

**해결:**
1. Unpause 실행: `npx ts-node scripts/unpauseContract.ts`
2. 바우처 재발급 (nonce 갱신)
3. 컨트랙트 상태 확인: `.\get-contract-stats.ps1`

##***REMOVED***백엔드 "Owner key load failed"

**원인:** `.env` 파일에 `OWNER_MNEMONIC`이 없거나 잘못됨

**해결:**
1. `.env` 파일 확인
2. 24단어 니모닉 입력
3. 백엔드 재시작: `npm start`

---

#***REMOVED***🔐 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] 니모닉이 Git에 커밋되지 않았는가?
- [ ] 프로덕션 배포 전 `paused: false` 확인
- [ ] Contract Jetton Wallet에 충분한 CSPIN이 있는가?
- [ ] 백엔드 API에 CORS 설정이 올바른가?
- [ ] Nonce가 중복되지 않는가?

---

#***REMOVED***📞 지원

**문제 발생 시:**
1. 이 문서의 "트러블슈팅" 섹션 확인
2. HANDOVER.md의 "Known Issues" 확인
3. GitHub Issues에 문의

**긴급 문의:**
- Discord: [프로젝트 Discord 링크]
- Email: [support@example.com]
