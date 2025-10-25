***REMOVED***🎯 배포 시뮬레이션 및 트러블슈팅 가이드

**목표**: Tonkeeper 지갑 연결 문제 해결 및 배포 성공

---

#***REMOVED***🔴 문제 상황 분석

##***REMOVED***사용자 상황
```
1. Tonkeeper에서 새 지갑 생성
2. 프라이빗 키를 얻을 수 없음
3. 테스트넷이 활성화 안됨
4. 배포를 진행해야 함
```

##***REMOVED***해결 방법
```
✅ 니모닉 코드 → 프라이빗 키 변환 완료
✅ 테스트넷 주소 자동 생성
✅ .env.local에 저장 완료
✅ 배포 스크립트 업데이트 완료
```

---

#***REMOVED***📋 현재 설정 상태

##***REMOVED***1. 지갑 정보 ✅
```
테스트넷 주소: 0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
메인넷 주소: UQC2DJ8yOisLaWh7J7xHAx6yppyZCoyf5cR5vbOVJcwVQZdC
프라이빗 키: 저장됨 (.env.local)
공개 키: 생성됨
Wallet.ton.org: pfqEVQ06rKlEY9sX
```

##***REMOVED***2. 환경 변수 ✅
```
.env.local에 모든 환경 변수 저장됨:
- DEPLOYER_WALLET_ADDRESS_TESTNET
- DEPLOYER_WALLET_ADDRESS_MAINNET
- DEPLOYER_PRIVATE_KEY
- CSPIN_JETTON
- GAME_JETTON_WALLET
```

##***REMOVED***3. 배포 스크립트 ✅
```
deployWithdrawalManager.ts 업데이트:
- 환경 변수 자동 로드
- 배포자 정보 검증
- 테스트넷/메인넷 자동 선택
```

---

#***REMOVED***🚀 배포 프로세스 (단계별)

##***REMOVED***1단계: 환경 확인 (사전 점검)

```bash
cd contracts
npm run check-env
```

**예상 출력**:
```
✅ CSPIN_JETTON: 0QBynBO...
✅ GAME_JETTON_WALLET: 0QA_rjh...
✅ DEPLOYER_PRIVATE_KEY: 14ebd4...
✅ DEPLOYER_WALLET_ADDRESS_TESTNET: 0QAGRIZPt...
✅ DEPLOYER_WALLET_ADDRESS_MAINNET: UQAGRIZPt...
✅ 모든 환경이 준비되었습니다!
```

##***REMOVED***2단계: 배포 명령 실행

```bash
npm run deploy -- --testnet
```

**예상 동작**:
```
> cspin-withdrawal-contracts@1.0.0 deploy
> blueprint run deployWithdrawalManager --testnet

🚀 WithdrawalManager 배포 시작

📡 네트워크: TESTNET
🔗 RPC 엔드포인트: https://testnet.toncenter.com/api/v2/jsonRPC

✅ 환경 변수 확인:
   CSPIN_JETTON: EQBZ6nHf...
   GAME_JETTON_WALLET: UQBFPDdS...
   배포자 지갑: 0QB_yGkO...

✅ 배포자 지갑 설정 완료: 0QB_yGkO...

🔌 RPC 클라이언트 초기화 완료

📝 컨트랙트 생성 중...

📍 컨트랙트 주소: EQA1234567890abcdef...
```

##***REMOVED***3단계: Tonkeeper 지갑 연결

**화면에 표시되는 것**:
```
? Which network do you want to use? testnet
? Which wallet are you using? TON Connect compatible mobile wallet (example: Tonkeeper)
? Choose your wallet Tonkeeper

[QR 코드 표시]
Scan the QR code in your wallet or open the link...
https://app.tonkeeper.com/ton-connect?v=2&...
```

**이때 해야 할 일**:
1. Tonkeeper 앱 열기
2. QR 코드 스캔 또는 링크 열기
3. "Connect" 버튼 클릭
4. 배포 트랜잭션 확인
5. "Approve" 버튼 클릭

##***REMOVED***4단계: 배포 완료

**완료 메시지**:
```
✅ 배포 작업 완료!

📍 컨트랙트 주소: EQA1234567890abcdef...

📋 다음 단계:
   1. wrangler.toml에 컨트랙트 주소 저장:
      WITHDRAWAL_MANAGER = "EQA1234567890..."
   
   2. 게임 Jetton 지갑에 CSPIN 토큰 예치
   
   3. 백엔드에서 스마트컨트랙트 호출 시작
```

---

#***REMOVED***⚠️ Tonkeeper 연결 문제 해결

##***REMOVED***문제 1: "App manifest content error"

**증상**:
```
ManifestContentErrorError: [TON_CONNECT_SDK_ERROR]...
Passed `tonconnect-manifest.json` contains errors
```

**원인**: Blueprint의 manifest 파일 오류

**해결책**:
```bash
***REMOVED***1. Tonkeeper 앱 최신 버전 업데이트
***REMOVED***2. 앱 종료 후 재시작
***REMOVED***3. 배포 다시 시도
npm run deploy -- --testnet
```

##***REMOVED***문제 2: "Unable to connect to wallet"

**증상**:
```
Unable to connect to wallet after timeout
```

**원인**: 네트워크 불안정 또는 지갑 연결 불가

**해결책**:
```bash
***REMOVED***1. 인터넷 연결 확인
ping testnet.toncenter.com

***REMOVED***2. Tonkeeper 앱 재시작
***REMOVED***3. 배포 다시 시도
npm run deploy -- --testnet

***REMOVED***4. 테스트넷 연결 확인
curl https://testnet.toncenter.com/api/v2/getStatus
```

##***REMOVED***문제 3: "Wallet not found"

**증상**:
```
Error: Wallet not found in response
```

**원인**: Tonkeeper에서 지갑이 선택되지 않음

**해결책**:
```bash
***REMOVED***1. Tonkeeper 앱 오픈
***REMOVED***2. 기본 계정 확인 (지갑이 표시되는지 확인)
***REMOVED***3. 필요시 지갑 추가
***REMOVED***4. 배포 재시도
npm run deploy -- --testnet
```

##***REMOVED***문제 4: "Insufficient balance"

**증상**:
```
Error: Not enough TON to pay for deployment
Balance: 0 TON
Required: ~0.05 TON
```

**원인**: 지갑에 테스트 토큰 없음

**해결책**:
```bash
***REMOVED***1. https://testnet-faucet.ton.org/ 접속
***REMOVED***2. 지갑 주소 입력:
***REMOVED***   0QB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic87g
***REMOVED***3. "Request" 버튼 클릭
***REMOVED***4. 테스트 TON 수령 (최소 0.05 TON)
***REMOVED***5. 배포 재시도
npm run deploy -- --testnet
```

---

#***REMOVED***🧪 배포 전 테스트 (로컬)

##***REMOVED***테스트 1: 환경 변수 로드 테스트

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
console.log('DEPLOYER_PRIVATE_KEY:', process.env.DEPLOYER_PRIVATE_KEY ? '✅' : '❌');
console.log('DEPLOYER_WALLET_ADDRESS_TESTNET:', process.env.DEPLOYER_WALLET_ADDRESS_TESTNET);
"
```

##***REMOVED***테스트 2: RPC 연결 테스트

```bash
curl -X POST "https://testnet.toncenter.com/api/v2/jsonRPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getStatus","params":{}}'

***REMOVED***성공 응답:
***REMOVED***{"ok":true,"result":{"block_id":"...","state_root_hash":"..."}}
```

##***REMOVED***테스트 3: 지갑 주소 검증 테스트

```bash
node -e "
const { Address } = require('@ton/core');
const addr = '0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA';
try {
  const parsed = Address.parse(addr);
  console.log('✅ 주소 유효:', parsed.toString());
} catch (e) {
  console.log('❌ 주소 오류:', e.message);
}
"
```

---

#***REMOVED***📊 배포 체크리스트

배포 전 확인사항:

```
환경 설정:
- [ ] npm install 완료 (285개 패키지)
- [ ] .env.local 파일 존재
- [ ] 모든 환경 변수 설정됨
- [ ] npm run check-env ✅ 통과

지갑 준비:
- [ ] Tonkeeper 앱 설치
- [ ] 테스트넷 지갑 생성
- [ ] 테스트 TON 요청 (Faucet)
- [ ] 지갑에 최소 0.05 TON 있음

배포 준비:
- [ ] WithdrawalManager.tact 컴파일 가능
- [ ] 배포 스크립트 수정됨
- [ ] RPC 엔드포인트 정상 (curl 테스트)
- [ ] 인터넷 연결 안정적

배포 실행:
- [ ] npm run deploy -- --testnet 실행
- [ ] QR 코드 Tonkeeper에서 스캔
- [ ] 트랜잭션 승인
- [ ] 배포 완료 메시지 확인
```

---

#***REMOVED***🎯 배포 성공 기준

##***REMOVED***✅ 성공 표시
```
✅ 배포 작업 완료!
✅ 컨트랙트 주소: EQA...
✅ 다음 단계 메시지 표시
```

##***REMOVED***❌ 실패 표시
```
❌ 배포 오류: ...
❌ 지갑 연결 실패
❌ 환경 변수 부족
```

---

#***REMOVED***📝 배포 후 기록

배포 완료 후 저장할 정보:

```
배포 날짜: 2025-10-25
네트워크: TESTNET
배포자 지갑: 0QAGRIZPtyLweOXMya_lkisdEENVZsaFeFpKbIy9zF7h89XA
컨트랙트 주소: [배포 후 저장]
배포 트랜잭션 해시: [배포 후 저장]
가스 비용: [배포 후 저장]
```

---

#***REMOVED***🚀 다음 단계

##***REMOVED***배포 완료 후
1. 컨트랙트 주소 wrangler.toml에 저장
2. tonscan.org에서 컨트랙트 확인
3. Getter 함수 테스트
4. 백엔드 통합 시작

##***REMOVED***메인넷 배포 (나중)
1. 테스트넷에서 충분히 검증
2. 메인넷 환경 변수 준비
3. `npm run deploy -- --mainnet` 실행
4. 메인넷 컨트랙트 주소 저장

---

**준비 완료! 🚀**  
이제 배포를 시작할 수 있습니다.

질문이나 문제가 있으면 이 가이드의 트러블슈팅 섹션을 참고하세요.
