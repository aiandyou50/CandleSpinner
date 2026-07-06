***REMOVED***🎫 바우처 발급 실패 해결 가이드

#***REMOVED***문제 진단

##***REMOVED***❌ 현재 상황
```
[오전 12:37:58] 📡 백엔드에서 바우처 요청 중...
[오전 12:37:58] ❌ 인출 실패: 바우처 발급 실패
```

##***REMOVED***🔍 원인 분석
백엔드 서버의 `OWNER_MNEMONIC`이 실제 니모닉이 아닌 더미 값입니다:
```javascript
// backend-api/server.js (Line 21)
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC || 'tornado run casual carbon ...'; // ❌ 더미 값
```

이로 인해:
1. `initOwnerKey()` 함수가 잘못된 키페어 생성
2. 바우처 서명이 유효하지 않음
3. 컨트랙트가 서명 검증 실패

---

#***REMOVED***📚 바우처 발급 시스템 이해

##***REMOVED***1️⃣ 바우처란?
**Signed Voucher = 서명된 인출 허가증**
- Owner가 서명한 디지털 쿠폰
- 사용자가 이 바우처를 컨트랙트에 제출하면 CSPIN 인출 가능
- 서명이 유효해야 컨트랙트가 승인

##***REMOVED***2️⃣ 바우처 발급 조건

###***REMOVED***A. 백엔드 요구사항 ✅
- [x] Owner의 **정확한 니모닉 24단어** 필요
- [x] `@ton/crypto` 라이브러리로 키페어 생성
- [ ] **실제 니모닉 입력 필요** ← **현재 누락!**

###***REMOVED***B. 사용자 요청 검증 ✅
```javascript
// 다음 조건들을 모두 통과해야 바우처 발급
if (!userId || !amount || !recipientAddress) {
    return { error: 'Missing required fields' };
}

if (amount <= 0 || amount > MAX_SINGLE_WITHDRAW) {
    return { error: 'Invalid amount' };
}

if (!Address.parse(recipientAddress)) {
    return { error: 'Invalid recipient address' };
}

// 실제 환경에서는 추가 검증:
// - userId가 유효한 사용자인지
// - 게임 내 크레딧이 충분한지
// - 일일 인출 한도 체크
// - 중복 요청 방지
```

##***REMOVED***3️⃣ 바우처 발급 과정

```
사용자 요청
    ↓
[1] 백엔드 수신
    - userId: "demo-user"
    - amount: 100 (CSPIN)
    - recipientAddress: "0:ac04..."
    ↓
[2] 입력 검증
    - 필수 필드 확인
    - 금액 범위 확인 (1 ~ 1,000,000)
    - 주소 형식 확인
    ↓
[3] Nonce 생성
    - timestamp + random
    - 중복 방지 및 재사용 공격 방지
    ↓
[4] 메시지 구성
    ┌─────────────────────────────┐
    │ ClaimWithVoucher 메시지      │
    ├─────────────────────────────┤
    │ opcode: 0x7a0c23c0          │
    │ amount: 100,000,000,000     │ (nanoCSPIN)
    │ recipient: 0:ac04...        │
    │ nonce: 1730140800123        │
    └─────────────────────────────┘
    ↓
[5] 서명 생성 (핵심!)
    - 메시지 → Hash
    - Hash + Owner PrivateKey → Signature
    - crypto.sign(messageHash, ownerPrivateKey)
    ↓
[6] 바우처 반환
    {
      "success": true,
      "voucher": {
        "amount": 100000000000,
        "recipient": "0:ac04...",
        "nonce": 1730140800123,
        "signature": "***REDACTED-EXAMPLE-SIGNATURE***...",  ← 서명!
        "contractAddress": "EQA...",
        "expiresAt": 1730141100000
      }
    }
    ↓
사용자가 트랜잭션 전송
    ↓
컨트랙트 검증
    - Owner PublicKey로 서명 검증
    - 서명 유효 ✅ → CSPIN 전송
    - 서명 무효 ❌ → 트랜잭션 실패
```

##***REMOVED***4️⃣ 서명 검증 원리

**백엔드 (서명 생성):**
```javascript
const messageHash = messageToSign.hash();
const signature = crypto.sign(null, messageHash, ownerKeyPair.secretKey);
//                                                 ^^^^^^^^^^^^^^^^^^^^
//                                                 Owner의 Private Key 필요!
```

**컨트랙트 (서명 검증):**
```tact
receive(msg: ClaimWithVoucher) {
    // Owner의 Public Key로 서명 검증
    let signatureValid = checkSignature(
        msg.hash(),
        msg.signature,
        self.owner_public_key  // 컨트랙트에 저장된 Owner Public Key
    );
    
    if (!signatureValid) {
        throw(401); // Unauthorized
    }
    
    // ✅ 서명 유효 → CSPIN 전송
}
```

**중요**: Private Key와 Public Key는 한 쌍!
- Private Key로 서명 → Public Key로 검증
- 니모닉 틀리면 → 다른 Private Key → 다른 Public Key → 서명 검증 실패!

---

#***REMOVED***🛠️ 해결 방법

##***REMOVED***방법 1: 환경 변수 설정 (권장 ⭐)

###***REMOVED***A. `.env` 파일 생성
```bash
***REMOVED***backend-api/.env
OWNER_MNEMONIC="your actual 24 word mnemonic here"
CONTRACT_ADDRESS="EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc"
MAX_SINGLE_WITHDRAW=1000000
PORT=3000
```

###***REMOVED***B. `dotenv` 설치
```powershell
cd backend-api
npm install dotenv
```

###***REMOVED***C. `server.js` 수정
```javascript
// 파일 맨 위에 추가
require('dotenv').config();

// 설정 부분
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
if (!OWNER_MNEMONIC || OWNER_MNEMONIC.includes('tornado run casual')) {
    console.error('❌ OWNER_MNEMONIC 환경 변수가 설정되지 않았습니다!');
    console.error('💡 backend-api/.env 파일에 실제 니모닉을 입력하세요.');
    process.exit(1);
}
```

###***REMOVED***D. `.gitignore` 추가
```gitignore
***REMOVED***backend-api/.gitignore
.env
node_modules/
```

##***REMOVED***방법 2: PowerShell 환경 변수 (임시)

```powershell
***REMOVED***환경 변수 설정
$env:OWNER_MNEMONIC = "your actual 24 word mnemonic here"

***REMOVED***백엔드 시작
cd backend-api
node server.js
```

⚠️ **주의**: 터미널 닫으면 사라짐!

##***REMOVED***방법 3: 시작 스크립트 생성 (추천)

###***REMOVED***`backend-api/start.ps1`
```powershell
***REMOVED***Owner 니모닉 입력
Write-Host "🔐 Owner 니모닉 입력:" -ForegroundColor Yellow
$mnemonic = Read-Host "24단어를 입력하세요" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mnemonic)
$env:OWNER_MNEMONIC = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

***REMOVED***백엔드 시작
Write-Host "🚀 백엔드 서버 시작..." -ForegroundColor Green
node server.js
```

---

#***REMOVED***📝 니모닉 찾는 방법

##***REMOVED***1. Tonkeeper 앱에서 확인
1. Tonkeeper 앱 열기
2. 설정 → 지갑 백업
3. "Show Recovery Phrase" 클릭
4. 24단어 복사

##***REMOVED***2. 메인넷 배포 시 사용한 니모닉
```
❓ 질문: deploy-voucher-mainnet.ps1 실행 시 입력한 니모닉 기억하시나요?
   - 그 니모닉을 backend-api/.env에 입력하세요!
   - Owner 주소: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
```

##***REMOVED***3. 컨트랙트 Owner 확인
```powershell
***REMOVED***Tonscan에서 확인
https://tonscan.org/address/EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc
```
- "Get Methods" → `get_owner()`
- 반환값이 Owner 주소 (Public Key 아님!)

---

#***REMOVED***🧪 바우처 발급 테스트

##***REMOVED***1. 올바른 니모닉 설정 확인
```javascript
// server.js 로그
✅ Owner 키 로드 완료
📍 Public Key: ***REDACTED-EXAMPLE-SIGNATURE***...
```

##***REMOVED***2. API 테스트
```powershell
***REMOVED***PowerShell에서 테스트
$body = @{
    userId = "test-user"
    amount = 100
    recipientAddress = "0:ac0491ea8b74e2f5d3a32e9e98e0f6b8a5c7d9e1f2a3b4c5d6e7f8a9b0c1d2e3"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/request-voucher" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

##***REMOVED***3. 예상 응답
```json
{
  "success": true,
  "voucher": {
    "amount": "100000000000",
    "recipient": "0:ac04...",
    "nonce": 1730140800123,
    "signature": "***REDACTED-EXAMPLE-SIGNATURE***...",
    "contractAddress": "EQAOLUHmaA1J_LCHjJ2UjFrB5-AYKCw1Grw586WVkVGxrNIc",
    "expiresAt": 1730141100000
  }
}
```

---

#***REMOVED***🎯 실행 순서

##***REMOVED***1단계: 니모닉 설정 ⭐
```bash
***REMOVED***backend-api/.env 생성
OWNER_MNEMONIC="actual 24 words here"
```

##***REMOVED***2단계: dotenv 설치
```powershell
cd backend-api
npm install dotenv
```

##***REMOVED***3단계: server.js 수정
```javascript
require('dotenv').config();
// ... (환경 변수 검증 추가)
```

##***REMOVED***4단계: 백엔드 재시작
```powershell
node server.js
```

##***REMOVED***5단계: 프론트엔드 테스트
```
http://localhost:8080/index.html
```
1. 지갑 연결
2. 100 CSPIN 입력
3. "💎 CSPIN 인출하기" 클릭
4. ✅ 성공!

---

#***REMOVED***🔒 보안 권장사항

##***REMOVED***❌ 절대 하지 말 것
```javascript
// ❌ 니모닉을 코드에 하드코딩
const OWNER_MNEMONIC = "tornado run casual carbon ...";

// ❌ 니모닉을 Git에 커밋
git add backend-api/.env  // 절대 금지!
```

##***REMOVED***✅ 해야 할 것
```bash
***REMOVED***✅ .env 파일 사용
backend-api/.env

***REMOVED***✅ .gitignore에 추가
.env
*.env
```

##***REMOVED***🛡️ 프로덕션 환경
- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- 또는 최소한: 서버 환경 변수

---

#***REMOVED***📞 추가 도움이 필요한 경우

##***REMOVED***니모닉을 잊어버린 경우
1. Tonkeeper 앱에서 Recovery Phrase 확인
2. 다른 Owner 지갑으로 재배포 고려
3. 컨트랙트 업그레이드 기능 추가 고려

##***REMOVED***바우처 발급은 되는데 인출 실패
- 컨트랙트 Paused 상태 확인
- Contract Jetton Wallet CSPIN 잔액 확인
- Tonscan에서 트랜잭션 오류 확인

##***REMOVED***서명 검증 실패
- 백엔드 Public Key와 컨트랙트 Owner Public Key 비교
- 니모닉이 배포 시 사용한 것과 동일한지 확인

---

#***REMOVED***요약

**바우처 발급 실패 원인**: 백엔드에 실제 니모닉 미설정  
**해결 방법**: `.env` 파일에 Owner 니모닉 입력 후 서버 재시작  
**핵심**: Private Key로 서명 → Public Key로 검증 (한 쌍이어야 함!)

🎉 올바른 니모닉 설정 후 모든 기능이 정상 작동합니다!
