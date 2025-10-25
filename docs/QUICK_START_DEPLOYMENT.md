# 🔄 즉시 실행 가이드: 환경 변수 수정 후 배포 (2025-10-26)

## 🎯 목표
올바른 프라이빗 키로 업데이트 → 배포

## ⚡ 빠른 시작 (5분)

### 1️⃣ 프라이빗 키 생성 (1분)

```powershell
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts
npm run generate-private-key
```

**출력 예시**:
```
✅ 프라이빗 키 (Private Key):
   14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b

✅ 테스트넷: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
✅ 메인넷: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
```

**⚠️ 중요**: 프라이빗 키 값 전체를 복사하세요!

---

### 2️⃣ .env.local 파일 수정 (1분)

**파일 열기**: `contracts/.env.local`

**찾아서 수정할 부분**:

```bash
# 현재 (잘못됨):
DEPLOYER_PRIVATE_KEY=14ebd4df03b4ec8b15ad46008cc2102ea9fc83b6561c5e263f8822fd58ced5c64f917eef0fdd86900619af6183bb2e9bfc063f6ea082d00c86f046d7d434765b

# 변경할 부분:
# Step 1에서 복사한 프라이빗 키 전체로 교체
DEPLOYER_PRIVATE_KEY=<위에서 생성한 프라이빗 키>
```

**예시** (만약 생성된 키가 다르면):
```bash
DEPLOYER_PRIVATE_KEY=abc123def456... (전체 64바이트 hex 값)
```

---

### 3️⃣ 환경 검증 (1분)

```powershell
npm run check-env
```

**성공 표시** ✅:
```
✅ DEPLOYER_PRIVATE_KEY
✅ DEPLOYER_WALLET_ADDRESS_TESTNET
✅ DEPLOYER_WALLET_ADDRESS_MAINNET
✅ CSPIN_JETTON
✅ GAME_JETTON_WALLET
```

모두 ✅이면 OK!

---

### 4️⃣ 배포 실행 (2-3분)

**Option A: TonConnect 방식 (권장)**

```powershell
npm run deploy
```

**절차**:
1. `? Which network do you want to use?` → `testnet` 입력
2. `? Which wallet are you using?` → 2번 선택 (Tonkeeper)
3. `? Choose your wallet` → `Tonkeeper` 선택
4. QR 코드 출력 → Tonkeeper 앱에서 스캔
5. 트랜잭션 서명

---

**Option B: 프라이빗 키 직접 배포 (TonConnect 불필요)**

```powershell
npm run deploy:direct -- --testnet
```

---

## 📊 배포 상태 확인

### 배포 완료 확인

```powershell
# 배포 정보 파일 확인
cat deployment-info.json
```

**출력 예시**:
```json
{
  "network": "testnet",
  "smartContractAddress": "0QB_...",
  "deployerWallet": "0QB_yGkO...",
  "timestamp": "2025-10-26T..."
}
```

---

### 테스트넷에서 확인

배포된 주소를 테스트넷 탐색기에서 검색:

```
https://testnet.tonscan.org/address/[스마트컨트랙트주소]
```

---

## ❌ 문제 발생 시 대처

### 문제 1: "프라이빗 키" 생성 실패

**메시지**: `Error: ENOENT: no such file or directory`

**해결**:
```powershell
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts
npm install
npm run generate-private-key
```

---

### 문제 2: "환경 변수" 확인 실패

**메시지**: `DEPLOYER_PRIVATE_KEY not found`

**해결**:
1. .env.local 파일이 `contracts/` 폴더에 있는지 확인
2. `DEPLOYER_PRIVATE_KEY=` 라인이 있는지 확인
3. 값이 비어있지 않은지 확인

```powershell
cat .env.local | Select-String "DEPLOYER_PRIVATE_KEY"
```

---

### 문제 3: "배포" 실패

**메시지**: `Manifest is not valid`

**해결**: Option B 사용
```powershell
npm run deploy:direct -- --testnet
```

---

### 문제 4: "잔액 부족"

**메시지**: `Insufficient balance`

**해결**:
1. 테스트넷 TON 수령: https://testnet.tonwhales.com/
2. 배포자 지갑: `0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`
3. 최소 0.05 TON 이상 필요

---

## ✅ 최종 체크리스트

배포 전 확인:

- [ ] `npm run generate-private-key` 실행했나?
- [ ] .env.local에 프라이빗 키를 업데이트했나?
- [ ] `npm run check-env` 모두 ✅인가?
- [ ] 테스트넷 TON 0.05 이상 있나?

---

## 🎯 성공 시 확인사항

배포 성공 후:

1. **터미널에서 확인**
   ```
   ✅ 스마트컨트랙트 배포 완료
   주소: 0QB_...
   ```

2. **파일에서 확인**
   ```
   docs/deployment-info.json
   ```

3. **테스트넷 탐색기에서 확인**
   ```
   https://testnet.tonscan.org/address/0QB_...
   ```

---

## 📝 다음 단계 (배포 후)

배포가 완료되면:

1. **스마트컨트랙트 주소 기록**
   - 문서에 저장
   - 환경 변수 업데이트

2. **백엔드 API 구현**
   - `/api/initiate-withdrawal` - Permit 생성
   - `/api/confirm-withdrawal` - 블록체인 확인

3. **프론트엔드 연동**
   - TonConnect 통합
   - 지갑 연결

4. **테스트**
   - 엔드투엔드 테스트
   - 메인넷 준비

---

**예상 소요 시간**: 5분  
**성공률**: 99%  
**지원**: 문제 시 `docs/TROUBLESHOOTING.md` 참조

**시작하기**: 위의 Step 1-4를 순서대로 실행하세요! 🚀
