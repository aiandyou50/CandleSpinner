# 🎯 CSPIN 인출 시스템 PoC 완전 가이드

## 📋 목차
1. [준비사항](#준비사항)
2. [테스트넷 배포](#테스트넷-배포)
3. [프론트엔드 테스트](#프론트엔드-테스트)
4. [관리자 기능](#관리자-기능)
5. [메인 프로젝트 통합](#메인-프로젝트-통합)

---

## 🎯 PoC 목표

사용자가 간단한 웹 페이지에서:
1. TON 지갑 연결
2. 인출할 CSPIN 토큰 개수 입력 (기본 100)
3. 인출 버튼 클릭
4. 가스비 지불 후 토큰 수령

---

## 1. 준비사항

### ✅ 체크리스트

- [ ] 테스트넷 지갑 준비 (`0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`)
- [ ] 테스트넷 TON 받기 (faucet)
- [ ] 스마트폰에 TON 지갑 앱 설치 (Tonkeeper/MyTonWallet)
- [ ] Node.js 설치 확인

### 📱 테스트넷 TON 받기

```bash
# Telegram Bot 사용
https://t.me/testgiver_ton_bot

# 또는 웹사이트
https://testnet.tonscan.org
```

**최소 필요 금액**: 0.3 TON (배포 + 테스트용)

---

## 2. 테스트넷 배포

### Step 1: 보안 강화 버전 배포

```bash
cd c:\Users\x0051\Desktop\DEV\contracts

# 배포 실행
npx blueprint run deploySecure --testnet --tonconnect
```

### Step 2: 배포 시 입력 값

```
? 관리자 주소 (Owner): 
0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g

? CSPIN Jetton Master:
0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
(테스트용 - 실제로는 사용되지 않음)

? 게임 Jetton Wallet:
0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
(테스트용 - 실제로는 사용되지 않음)
```

### Step 3: 배포 확인

배포가 완료되면 다음과 같은 출력이 나옵니다:

```
✅ 배포 완료!

📊 컨트랙트 정보:
   주소: kQABC...XYZ
   네트워크: Testnet
   ...

🔗 Tonscan:
   https://testnet.tonscan.org/address/kQABC...XYZ
```

**⚠️ 중요: 컨트랙트 주소를 복사하세요!**

---

## 3. 프론트엔드 테스트

### Step 1: 컨트랙트 주소 설정

`frontend-poc/index.html` 파일을 열고:

```javascript
// 18번째 줄 근처
const CONTRACT_ADDRESS = 'kQABC...XYZ'; // 배포된 주소로 변경
```

### Step 2: 프론트엔드 실행

```bash
# 간단한 HTTP 서버 실행
cd frontend-poc
python -m http.server 8000

# 또는
npx serve .
```

브라우저에서 `http://localhost:8000` 접속

### Step 3: PoC 테스트 시나리오

#### 3-1. 지갑 연결
1. "🔗 TON 지갑 연결" 버튼 클릭
2. QR 코드가 표시됨
3. 스마트폰의 TON 지갑 앱으로 QR 스캔
4. 연결 승인
5. 웹페이지에 지갑 주소 표시됨

#### 3-2. Claimable 금액 설정 (관리자)

**별도 터미널에서:**

```bash
npx blueprint run setClaimable --testnet --tonconnect
```

입력:
```
? 컨트랙트 주소: kQABC...XYZ (배포한 주소)
? 사용자 주소: [사용자 지갑 주소] (프론트엔드에 표시된 주소)
? 금액 (CSPIN): 100
```

#### 3-3. 토큰 인출
1. 프론트엔드에서 금액 입력 (100)
2. "💎 CSPIN 인출하기" 버튼 클릭
3. 스마트폰에서 트랜잭션 승인
4. 디버그 창에서 진행 상황 확인

### 예상 결과

```
[시간] 🔄 100 CSPIN 인출 시작...
[시간] 📤 트랜잭션 전송 중...
[시간] ✅ 트랜잭션 전송 성공!
[시간] 📋 BOC: te6cckEB...
[시간] 🎉 100 CSPIN이 곧 지갑에 도착합니다
```

---

## 4. 관리자 기능

### 4-1. 긴급 정지

#### **방법 1: PC 환경 (Blueprint)**
```bash
# 컨트랙트 일시정지
npx blueprint run pauseContract --testnet --tonconnect

# 입력
? 컨트랙트 주소: kQABC...XYZ
```

**결과**: 모든 인출이 중지됨

#### **방법 2: 모바일 환경 (Tonkeeper 앱) 📱**

PC 없이 모바일만으로 긴급 정지:

1. **Tonkeeper 앱** 열기
2. **전송(Send)** 선택
3. **수신자**: 컨트랙트 주소
4. **금액**: `0.05 TON`
5. **메시지**: `pause`
6. **전송**

**재개는 `unpause` 메시지 전송**

#### **방법 3: 모바일 웹 페이지 (권장) ⭐**

```
frontend-poc/emergency-pause.html
```

**사용법**:
- 모바일 브라우저로 접속
- Owner 지갑 연결
- 버튼 클릭

**장점**:
- ✅ Owner 자동 인증
- ✅ 실시간 상태 확인
- ✅ 간편한 제어

### 4-2. 재개

```bash
# 컨트랙트 재개
npx blueprint run unpauseContract --testnet --tonconnect

# 입력
? 컨트랙트 주소: kQABC...XYZ
```

**결과**: 인출 재개됨

### 4-3. Claimable 금액 설정

```bash
npx blueprint run setClaimable --testnet --tonconnect
```

**사용 시나리오**:
- 게임에서 사용자가 보상을 획득했을 때
- 관리자가 수동으로 금액 설정

---

## 5. 메인 프로젝트 통합

### 5-1. 필요한 파일들

PoC가 완료되면 다음 파일들을 메인 프로젝트로 이동:

```
contracts/
├── sources/
│   └── CSPINWithdrawalSecure.tact  ✅ 스마트 컨트랙트
├── build/
│   └── CSPINWithdrawalSecure/      ✅ 컴파일된 파일 + wrapper
├── scripts/
│   ├── deploySecure.ts             ✅ 배포 스크립트
│   ├── setClaimable.ts             ✅ 관리 스크립트
│   ├── pauseContract.ts            ✅ 긴급 정지
│   └── unpauseContract.ts          ✅ 재개
└── frontend-poc/
    └── index.html                   ✅ 프론트엔드 예제
```

### 5-2. 통합 체크리스트

#### 백엔드 통합
```typescript
// 게임 보상 지급 시
import { CSPINWithdrawalSecure } from './build/CSPINWithdrawalSecure/...';

async function giveReward(userAddress: string, amount: number) {
    const contract = provider.open(
        CSPINWithdrawalSecure.fromAddress(contractAddress)
    );
    
    await contract.send(
        adminSender,
        { value: toNano('0.05') },
        {
            $$type: 'SetClaimable',
            user: Address.parse(userAddress),
            amount: BigInt(amount * 1000000000)
        }
    );
}
```

#### 프론트엔드 통합
```typescript
// React/Next.js 예제
import { useTonConnect } from '@tonconnect/ui-react';

function WithdrawButton() {
    const { sendTransaction } = useTonConnect();
    
    async function handleClaim(amount: number) {
        const body = beginCell()
            .storeUint(0x2, 32)
            .storeUint(Date.now(), 64)
            .endCell();
        
        await sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{
                address: CONTRACT_ADDRESS,
                amount: '150000000',
                payload: body.toBoc().toString('base64')
            }]
        });
    }
    
    return <button onClick={() => handleClaim(100)}>인출</button>;
}
```

---

## 6. 메인넷 배포 준비

### 6-1. 메인넷 배포 전 체크리스트

- [ ] 테스트넷 PoC 완료
- [ ] 모든 시나리오 테스트 완료
- [ ] 긴급 정지 기능 테스트 완료
- [ ] 백엔드 API 구현 완료
- [ ] 프론트엔드 통합 완료
- [ ] 게임 Jetton Wallet에 충분한 CSPIN 보유 확인
- [ ] Owner 키를 안전하게 보관 (하드웨어 지갑 권장)

### 6-2. 메인넷 배포

```bash
# 메인넷 배포
npx blueprint run deploySecure --mainnet --tonconnect
```

입력 값:
```
? 관리자 주소 (Owner): 
UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd

? CSPIN Jetton Master:
EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV

? 게임 Jetton Wallet:
EQAjtIvLT_y9GNBAikrD7ThH3f4BI-h_l_mz-Bhuc4_c7wOs
```

---

## 7. 문제 해결

### Q: 지갑 연결이 안 됩니다
**A**: 
- 스마트폰과 PC가 같은 네트워크에 있는지 확인
- 지갑 앱이 최신 버전인지 확인
- 브라우저 콘솔에서 에러 확인

### Q: 트랜잭션이 실패합니다
**A**:
- 지갑에 충분한 TON이 있는지 확인 (최소 0.15 TON)
- 컨트랙트가 pause 상태가 아닌지 확인
- Claimable 금액이 설정되어 있는지 확인

### Q: 토큰이 도착하지 않습니다
**A**:
- 테스트넷에서는 실제 Jetton 전송이 작동하지 않을 수 있음
- 메인넷 배포 시에만 실제 토큰 전송 가능
- Tonscan에서 트랜잭션 상태 확인

---

## 8. 다음 단계

PoC 완료 후:

1. ✅ AI 코딩 에이전트에게 분석 요청
2. ✅ 메인 프로젝트에 통합
3. ✅ 메인넷 배포
4. ✅ 모니터링 시스템 구축
5. ✅ 사용자 가이드 작성

---

## 📞 지원

문제가 발생하면:
1. 디버그 출력 확인
2. Tonscan에서 트랜잭션 확인
3. 터미널 에러 메시지 확인

**준비되셨으면 배포를 시작하세요!** 🚀
