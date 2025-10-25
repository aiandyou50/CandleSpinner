***REMOVED***⚠️ 환경 변수 수정 안내 (2025-10-26)

#***REMOVED***문제 상황

##***REMOVED***1️⃣ 문제 발견
- **Tonkeeper QR 코드에서**: "Manifest is not valid" 오류
- **환경 변수 확인**: 지갑 주소가 올바르게 설정되어 있음
- **프라이빗 키**: 니모닉과 일치하지 않을 가능성

##***REMOVED***2️⃣ 원인 분석

**제공하신 정보 (올바름)**:
```
테스트넷: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
메인넷: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
니모닉: bamboo release expand income shiver gift bounce cargo course kiss goat cram pledge relax rib furnace squirrel sugar find daughter load proof please speed
```

**현재 프라이빗 키 문제**:
- 저장된 프라이빗 키가 제공된 니모닉과 일치하지 않을 수 있음
- 이로 인해 TonConnect가 지갑 인증을 실패할 수 있음

---

#***REMOVED***해결 방법

##***REMOVED***🎯 2가지 선택지

###***REMOVED*****옵션 A: 올바른 프라이빗 키 파생 (권장)**

**Step 1**: 니모닉에서 올바른 프라이빗 키 생성

```bash
cd contracts
npm run generate-private-key
```

출력에서 **"프라이빗 키 (Private Key)"** 값을 복사합니다.

**Step 2**: .env.local 파일에서 `DEPLOYER_PRIVATE_KEY` 업데이트

```bash
DEPLOYER_PRIVATE_KEY=<복사한 프라이빗 키 값>
```

**Step 3**: 환경 검증

```bash
npm run check-env
```

---

###***REMOVED*****옵션 B: 대체 배포 방법 (Tonkeeper 직접 사용)**

Tonkeeper 앱에서 직접 배포하기:

1. **Tonkeeper 앱 설치**
   - 모바일: iOS/Android
   - 또는 웹: https://tonkeeper.com

2. **지갑 복구**
   - 니모닉으로 지갑 복구
   - 테스트넷 모드 활성화

3. **배포 수동 실행**
   - Blueprint 스크립트를 통해 트랜잭션 생성
   - Tonkeeper에서 서명

---

#***REMOVED***🚨 TonConnect "Manifest is not valid" 오류 해결

##***REMOVED***원인
- Blueprint의 배포 스크립트에서 생성하는 Manifest가 유효하지 않음
- 또는 Tonkeeper 앱이 이를 인식하지 못함

##***REMOVED***해결책

**방법 1: Blueprint 배포 대신 직접 API 사용**

```bash
***REMOVED***기존 (문제 있음)
npm run deploy

***REMOVED***대신 사용 (권장)
npx ts-node scripts/deployDirect.ts --testnet
```

**방법 2: 프라이빗 키로 직접 배포**

```bash
npx ts-node scripts/deployWithPrivateKey.ts --testnet
```

---

#***REMOVED***📋 지금 필요한 작업

##***REMOVED***1단계: 프라이빗 키 확인 및 수정

```bash
***REMOVED***올바른 프라이빗 키 생성
cd c:\Users\x0051\Desktop\DEV\CandleSpinner\contracts
npm run generate-private-key
```

##***REMOVED***2단계: .env.local 업데이트

생성된 프라이빗 키를 `DEPLOYER_PRIVATE_KEY`에 붙여넣기

##***REMOVED***3단계: 환경 검증

```bash
npm run check-env
```

모든 항목이 ✅ 표시되면 성공

##***REMOVED***4단계: 배포 실행

```bash
***REMOVED***방법 A: Blueprint (Tonkeeper 필요)
npm run deploy

***REMOVED***방법 B: 직접 배포 (프라이빗 키 사용)
npx ts-node scripts/deployWithPrivateKey.ts --testnet
```

---

#***REMOVED***✅ 점검 항목

- [ ] .env.local의 `DEPLOYER_PRIVATE_KEY` 값이 올바른 니모닉과 일치하는가?
- [ ] `npm run check-env` 모두 ✅인가?
- [ ] 지갑 주소가 다음과 맞는가?
  - 테스트넷: `0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g`
  - 메인넷: `UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC`

---

#***REMOVED***📞 다음 단계

**선택 필요**:

1. **프라이빗 키 재생성 후 TonConnect 사용**
   ```bash
   npm run generate-private-key
   ***REMOVED***(프라이빗 키 복사)
   ***REMOVED***.env.local 업데이트
   npm run deploy
   ```

2. **프라이빗 키로 직접 배포**
   ```bash
   npm run generate-private-key
   ***REMOVED***(프라이빗 키 복사)
   ***REMOVED***.env.local 업데이트
   npx ts-node scripts/deployWithPrivateKey.ts --testnet
   ```

---

**작성일**: 2025-10-26  
**상태**: 🔄 프라이빗 키 수정 대기 중  
**다음 단계**: npm run generate-private-key 실행
