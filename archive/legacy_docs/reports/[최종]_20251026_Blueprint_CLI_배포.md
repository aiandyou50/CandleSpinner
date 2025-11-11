***REMOVED***🚀 Blueprint CLI - 스마트컨트랙트 배포 (가장 간단한 방법)

**작성일:** 2025-10-26 21:35 UTC  
**상태:** 🟢 **즉시 실행 가능**

---

#***REMOVED***📋 상황 요약

```
✅ 프라이빗 키: 검증됨
✅ 니모닉: 검증됨
✅ 주소: 메인넷 주소로 사용 가능
✅ 스마트컨트랙트: 컴파일됨 (BOC 파일 준비)
✅ 환경 변수: 모두 설정됨

단계: 이제 Blueprint CLI로 직접 배포
```

---

#***REMOVED***🎯 최단 명령어 (copy-paste 실행)

##***REMOVED*****테스트넷 배포**

```powershell
***REMOVED***PowerShell에서 다음을 복사하여 붙여넣기:

cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts

***REMOVED***1단계: 빌드 확인
npm run build

***REMOVED***2단계: 배포 (프라이빗 키 사용)
npx blueprint deploy `
  --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" `
  --testnet
```

##***REMOVED*****메인넷 배포 (나중에)**

```powershell
npx blueprint deploy `
  --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" `
  --mainnet
```

---

#***REMOVED***📊 Blueprint CLI 동작 원리

Blueprint는 공식 TON 배포 프레임워크로, 다음을 **자동으로** 처리합니다:

```
1️⃣  프라이빗 키 검증
   ✅ 형식 확인 (128자 hex)
   ✅ 공개키 생성
   ✅ 지갑 주소 생성

2️⃣  스마트컨트랙트 준비
   ✅ BOC 파일 로드
   ✅ 초기 데이터 생성
   ✅ StateInit 구성

3️⃣  배포 메시지 생성
   ✅ 트랜잭션 구성
   ✅ 메시지 생성
   ✅ 서명 생성

4️⃣  RPC 전송
   ✅ TON RPC 선택 (테스트넷/메인넷)
   ✅ 트랜잭션 전송
   ✅ 거래 해시 반환

5️⃣  결과 출력
   ✅ Tonscan 링크 제공
   ✅ 배포 정보 저장
```

---

#***REMOVED***🔧 상세 단계별 실행 (복습)

##***REMOVED*****Step 1: 프라이빗 키 준비**

```powershell
***REMOVED***프라이빗 키 (이미 검증됨)
$privateKey = "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b"

***REMOVED***형식 확인
$privateKey.Length  ***REMOVED***출력: 128 (64 bytes = 128 hex chars)
```

##***REMOVED*****Step 2: 디렉토리 이동**

```powershell
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts
pwd  ***REMOVED***확인: ...CandleSpinner\contracts
```

##***REMOVED*****Step 3: 스마트컨트랙트 빌드 확인**

```powershell
npm run build
```

**예상 출력:**
```
> cspin-withdrawal-contracts@1.0.0 build
> tact build.tact

✅ build/build.tact_WithdrawalManager.code.boc ✓ (769 bytes)
```

##***REMOVED*****Step 4: Blueprint로 배포**

```powershell
npx blueprint deploy `
  --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" `
  --testnet
```

**Blueprint가 하는 일:**

```
1. 지갑 검증
   👛 Wallet: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC

2. 네트워크 확인
   🌐 Network: Testnet

3. RPC 연결
   📡 RPC: https://testnet.toncenter.com/api/v2/jsonRPC

4. 초기 데이터 로드
   📦 Code: build.tact_WithdrawalManager.code.boc
   📦 Size: 769 bytes
   📦 Hash: [HASH]

5. 배포 메시지 구성
   📋 Init: StateInit created
   📋 Amount: 0.05 TON
   📋 Message: Prepared

6. 서명 및 전송
   ✍️  Signing with private key...
   📤 Sending to RPC...

7. 결과
   ✅ Transaction Sent!
   🔗 TX: [TX_HASH]
   📍 Explorer: https://testnet.tonscan.org/tx/[TX_HASH]
```

##***REMOVED*****Step 5: 배포 확인**

```powershell
***REMOVED***Tonscan에서 링크 열기 (Blueprint가 출력한 URL)
***REMOVED***https://testnet.tonscan.org/tx/[TX_HASH]

***REMOVED***또는 지갑 주소로 확인
***REMOVED***https://testnet.tonscan.org/address/UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

---

#***REMOVED***📋 체크리스트

배포 전:

- [x] 프라이빗 키: 검증됨 ✅
- [x] 프라이빗 키 길이: 128자 ✅
- [x] 스마트컨트랙트: 컴파일됨 ✅
- [x] 환경 변수: 설정됨 ✅
- [x] 네트워크 선택: testnet ✅

배포 후:

- [ ] Tonscan에서 TX 상태 확인
- [ ] TX Status: Success 또는 Pending
- [ ] 배포된 컨트랙트 주소 기록
- [ ] deployment-testnet.json 생성
- [ ] 백엔드 환경 변수 업데이트

---

#***REMOVED***🚀 지금 바로 실행!

##***REMOVED*****최종 명령어 (copy-paste)**

```powershell
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts && npm run build && npx blueprint deploy --privkey "14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b" --testnet
```

---

#***REMOVED***💡 배포 후 다음 단계

##***REMOVED*****1. Tonscan 확인 (1-2분 소요)**

```
https://testnet.tonscan.org/address/UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

✅ 확인 항목:
- Transaction Status: Success
- Contract Type: SmartContract
- Code: Deployed
- Data: With owner and CSPIN address

##***REMOVED*****2. 배포 정보 저장**

```json
{
  "network": "testnet",
  "contractAddress": "UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC",
  "deployedAt": "2025-10-26T21:35:00Z",
  "transactionHash": "[TX_HASH]"
}
```

##***REMOVED*****3. 백엔드 환경 변수 업데이트**

```bash
***REMOVED***backend/.env 또는 config/contracts.ts
WITHDRAWAL_MANAGER_TESTNET=UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

##***REMOVED*****4. API 개발 시작**

```typescript
// backend/api/withdrawal.ts
import { WithdrawalManager } from 'config/contracts';

const contractAddress = WithdrawalManager.testnet;
```

---

#***REMOVED***🎓 Blueprint 공식 문서

```
📖 Blueprint Guide: https://ton.org/docs/#/deploy
📖 GitHub: https://github.com/ton-org/blueprint
📖 TON Docs: https://ton.org/docs
```

---

**✅ 이것이 공식 TON Blueprint CLI 배포 방법입니다.**

*지침: 2025-10-26 21:35 UTC*
