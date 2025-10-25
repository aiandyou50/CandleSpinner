# 🚀 테스트넷 배포 준비 가이드

## 개요
`npm run deploy -- --testnet` 실행을 위한 필수 준비사항

---

## 1단계: 테스트넷 CSPIN 토큰 확인

### 필요 정보
- **CSPIN Jetton Master Address** (테스트넷)
- **Game Jetton Wallet** (테스트넷에서 관리하는 지갑)

### 테스트넷 주소 찾기

#### 방법 1: tonscan.org에서 검색
1. https://testnet.tonscan.org 접속
2. CSPIN 토큰 검색
3. Jetton Master 주소 복사

#### 방법 2: 프로젝트 기존 설정 확인
```bash
# 프로젝트에서 테스트넷 주소 사용하는 코드 검색
grep -r "testnet" src/
grep -r "0QBynBO" .  # Jetton Master 주소
grep -r "0QA_rjh" .  # Jetton Wallet 주소
```

#### 방법 3: TON Testnet Faucet
1. https://testnet.ton.org/docs/#/func/comments (테스트 토큰)
2. Telegram 봇에서 테스트 토큰 요청
3. 지갑 주소로 토큰 수령

---

## 2단계: Deployer 프라이빗 키 준비

### 안전한 프라이빗 키 생성

#### 방법 1: Tonkeeper 지갑 (권장)
```bash
# Tonkeeper에서 testnet 계정 생성
1. Tonkeeper 앱 열기
2. Settings → Advanced → Testnet 활성화
3. 새 지갑 생성
4. "Export Private Key" 클릭
```

#### 방법 2: ton-docs 스크립트 사용
```bash
# 프로젝트에서 제공하는 스크립트
cd wallet-tools
node mnemonic-to-key.mjs "your seed phrase"

# 또는 안전한 방식 (키 입력 프롬프트)
node secure-mnemonic-to-key.mjs
```

#### 방법 3: TON 명령어
```bash
# @ton/ton 라이브러리 사용
npx ts-node -e "
import { mnemonicToWalletKey } from '@ton/crypto';
const key = await mnemonicToWalletKey(['word1', 'word2', ...]);
console.log(key.secretKey.toString('hex'));
"
```

### ⚠️ 보안 주의사항
- 프라이빗 키는 **절대 GitHub에 커밋하지 말 것**
- `.env.local`은 `.gitignore`에 등록됨 ✅
- 테스트넷 키는 테스트용만 사용
- 메인넷 키는 별도로 안전하게 보관

---

## 3단계: 환경 변수 설정

### `.env.local` 파일 업데이트

```bash
# contracts/.env.local

# CSPIN Jetton 마스터 주소 (테스트넷)
CSPIN_JETTON=0QBynBO23TS0KSnWvEJ_vgbLiVpXnyy3jVMD-2gQbRAe0-7J

# 게임이 관리하는 Jetton 지갑 (테스트넷)
GAME_JETTON_WALLET=0QA_rjh0mNQVT2hA-wlJKhNrqLmhTHShMBY3T0Dba2b_0_-J

# 배포자 프라이빗 키 (테스트넷)
DEPLOYER_PRIVATE_KEY=your_testnet_private_key_here

# RPC 엔드포인트 (자동으로 설정되지만 명시 가능)
TON_RPC_ENDPOINT=https://testnet.toncenter.com/api/v2/jsonRPC
```

### PowerShell에서 환경 변수 설정
```powershell
# 임시 설정 (이 세션만)
$env:CSPIN_JETTON="0QBynBO23TS0KSnWvEJ_vgbLiVpXnyy3jVMD-2gQbRAe0-7J"
$env:GAME_JETTON_WALLET="0QA_rjh0mNQVT2hA-wlJKhNrqLmhTHShMBY3T0Dba2b_0_-J"
$env:DEPLOYER_PRIVATE_KEY="your_testnet_private_key_here"

# 확인
echo $env:CSPIN_JETTON
```

### Bash/Linux에서 환경 변수 설정
```bash
# 임시 설정
export CSPIN_JETTON="0QBynBO23TS0KSnWvEJ_vgbLiVpXnyy3jVMD-2gQbRAe0-7J"
export GAME_JETTON_WALLET="0QA_rjh0mNQVT2hA-wlJKhNrqLmhTHShMBY3T0Dba2b_0_-J"
export DEPLOYER_PRIVATE_KEY="your_testnet_private_key_here"

# 확인
echo $CSPIN_JETTON
```

---

## 4단계: 배포 실행

### 테스트넷 배포 명령어
```bash
# contracts 디렉토리에서
cd contracts

# 배포 실행 (Tonkeeper 지갑 연결 필요)
npm run deploy -- --testnet
```

### 예상 동작
```
🚀 WithdrawalManager 배포 시작

📡 네트워크: TESTNET
🔗 RPC 엔드포인트: https://testnet.toncenter.com/api/v2/jsonRPC

✅ 환경 변수 확인:
   CSPIN_JETTON: 0QBynBO...
   GAME_JETTON_WALLET: 0QA_rjh...

🔌 RPC 클라이언트 초기화 완료

📝 컨트랙트 생성 중...

? Which network do you want to use? testnet
? Which wallet are you using? TON Connect compatible mobile wallet
? Choose your wallet Tonkeeper

[QR 코드 표시]
Scan the QR code in your wallet...
```

---

## 5단계: 지갑 승인

### Tonkeeper에서
1. QR 코드 스캔
2. "Connect" 클릭
3. 배포 트랜잭션 확인
4. "Approve" 버튼 클릭

### 예상 비용
- **가스 비용**: ~0.05 TON (~$0.15)
- **배포 시간**: 30초 ~ 2분

---

## 6단계: 배포 완료 확인

### 성공 메시지
```
✅ 배포 작업 완료!

📍 컨트랙트 주소: EQA1234567890...

📋 다음 단계:
   1. wrangler.toml에 컨트랙트 주소 저장:
      WITHDRAWAL_MANAGER = "EQA1234567890..."
   
   2. 게임 Jetton 지갑에 CSPIN 토큰 예치
   
   3. 백엔드에서 스마트컨트랙트 호출 시작
```

### 배포된 주소 저장
```bash
# wrangler.toml [env.production] 섹션에 추가
WITHDRAWAL_MANAGER = "EQA..." # 배포 완료 후 받은 주소
```

---

## 7단계: 컨트랙트 검증

### tonscan.org에서 확인
1. https://testnet.tonscan.org 접속
2. 컨트랙트 주소 검색
3. 배포 정보 확인
4. Getter 함수 테스트

### 예시: stats() 함수 호출
```bash
# 컨트랙트 통계 조회
curl "https://testnet.toncenter.com/api/v2/jsonRPC" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "runGetMethod",
    "params": {
      "address": "EQA...",
      "method": "stats"
    }
  }'

# 응답 예시:
{
  "ok": true,
  "result": [
    "0",      // processedRequests
    "0",      // totalWithdrawn
    "0",      // totalGasCollected
    "false"   // isPaused
  ]
}
```

---

## 📋 체크리스트

배포 전 확인사항:

- [ ] `contracts/package.json`에서 의존성 설치 완료
  ```bash
  npm install
  ```

- [ ] `.env.local` 파일에 환경 변수 입력
  ```bash
  CSPIN_JETTON=0QBynBO...
  GAME_JETTON_WALLET=0QA_rjh...
  DEPLOYER_PRIVATE_KEY=...
  ```

- [ ] Tonkeeper 앱에서 테스트넷 계정 생성
  - Settings → Advanced → Testnet ON
  - 테스트 TON 토큰 요청 (faucet)

- [ ] 프라이빗 키 안전하게 저장
  - 비밀번호 매니저 사용 또는 `.env.local`
  - **GitHub에 커밋하지 않기**

- [ ] 배포 명령어 실행
  ```bash
  npm run deploy -- --testnet
  ```

- [ ] QR 코드 Tonkeeper에서 승인

- [ ] 배포 완료 메시지에서 주소 받기

- [ ] `wrangler.toml`에 주소 저장

---

## 🔄 메인넷 배포 (이후)

### 메인넷 배포 명령어
```bash
npm run deploy -- --mainnet
```

### 주의사항
- **비용**: ~$6 (약 2 TON)
- **환경 변수**: MAINNET 주소로 변경
- **테스트 완료 후**: 테스트넷에서 충분히 검증 후 진행
- **백업**: 배포 주소 기록 및 백업

---

## ❌ 트러블슈팅

### 문제 1: "App manifest content error"
```
ManifestContentErrorError: [TON_CONNECT_SDK_ERROR]...
```
**해결**: Tonkeeper 앱 업데이트 또는 다시 시도

### 문제 2: "Invalid checksum"
```
Error: Invalid checksum: 0QBynBO...
```
**해결**: 환경 변수 주소 확인 (0Q로 시작하는지 확인)

### 문제 3: 지갑 연결 타임아웃
```
Unable to connect to wallet.
```
**해결**:
1. Tonkeeper 앱 재시작
2. 인터넷 연결 확인
3. 다시 배포 시도

### 문제 4: "Environment variable not found"
```
CSPIN_JETTON: ❌
```
**해결**:
```bash
# PowerShell 새 터미널에서 다시 설정
$env:CSPIN_JETTON="0QBynBO..."
npm run deploy -- --testnet
```

---

## 📚 추가 리소스

- [TON Testnet Faucet](https://testnet.ton.org)
- [Tonkeeper 앱](https://tonkeeper.com)
- [tonscan.org (테스트넷)](https://testnet.tonscan.org)
- [TON Blueprint 문서](https://github.com/ton-org/blueprint)
- [Tact 언어](https://docs.tact-lang.org)

---

**최종 수정**: 2025-10-25 KST  
**상태**: 준비 완료 ✅
