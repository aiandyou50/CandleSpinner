***REMOVED***중앙화 방식 - TON Connect CSPIN 표시 안 됨 (상세 분석)

**작성일**: 2025-10-25 오전 3:05  
**상태**: 🔴 긴급 진단 필요

---

#***REMOVED***📸 테스트 결과 (사진 기반)

##***REMOVED***TON Connect에 표시되는 것 (❌)

```
Confirm Action
Wallet: Tonkeeper

[↑ Sent: -0.03 TON (UQCs...KFD_)]
[⚔ Network fee: ≈0.00432 TON ($0.00934)]

Total: $0.0648
[← Confirm] [Swipe right]
```

##***REMOVED***예상했던 것 (✅)

```
Confirm Action
Wallet: Tonkeeper

[📦 스마트 계약 호출]
[↑ Sent: -0.03 TON]
[↓ Received: +1000 CSPIN]
[⚔ Network fee: ≈0.00432 TON]

또는

[↑ Sent: -1000 CSPIN (to UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_)]
[⚔ Network fee: ≈0.00432 TON]
```

---

#***REMOVED***🔍 원인 분석 (3가지 가능성)

##***REMOVED***원인 #1: `userJettonWalletAddress`가 잘못됨 (80% 확률) 🔴

**현재 로그**:
```
[오전 3:05:06] Jetton 주소: UQCsBJHqi3TtqOFiEP2c...
```

**문제점**:
```
사용자가 입력하는 "Jetton 주소"의 의미가 불명확함

가능성 1: 사용자의 CSPIN 지갑 주소? (올바름)
          → UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_
          
가능성 2: 게임 지갑의 CSPIN 지갑? (틀림!)
          → UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
          
가능성 3: 토큰 자체의 주소? (틀림!)
          → EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV (CSPIN 마스터)
```

**올바른 이해**:
```
사용자가 입력해야 하는 것:
= 사용자 지갑의 CSPIN 중간 지갑 (Jetton Wallet)
= 사용자가 이 지갑에 CSPIN을 받게 됨

찾는 방법:
1. TON Wallet 또는 Tonkeeper 열기
2. "CSPIN" 토큰 탭
3. 내 Jetton 지갑 주소 복사
4. 게임에 붙여넣기
```

---

##***REMOVED***원인 #2: Jetton 페이로드(BOC)가 손상됨 (15% 확률) 🟡

**확인 방법**:
```
백엔드 로그 확인:
[RPC] Jetton Payload 생성 완료
[RPC] 내부 메시지 생성 완료 (목적지: UQCsBJHqi3TtqOFiEP2c...)

둘 다 "완료" 로그가 있나?
→ 있음: OK
→ 없음: 페이로드 생성 실패
```

**BOC의 의미**:
```
BOC = Bag of Cells (Binary Object Composition)
= TON 블록체인에서 모든 데이터의 기본 단위

Jetton 페이로드 BOC = 
  "CSPIN 지갑에 이 작업을 실행해줘" 라는 명령어를 BOC로 인코딩한 것
```

---

##***REMOVED***원인 #3: TON Connect 또는 Tonkeeper 버그 (5% 확률) 🟠

```
가능성:
- Tonkeeper에서 Jetton 스마트 컨트랙트 호출 파싱 실패
- TON Connect SDK 버그
- 드물지만 발생 가능

확인 방법:
- 다른 지갑 (TonHub, Wallet 등)으로 테스트
- 또는 Tonkeeper 업데이트 확인
```

---

#***REMOVED***🔧 진단 필요정보

##***REMOVED***정보 1️⃣: 사용자가 입력한 Jetton 주소 확인

**질문**:
```
게임에서 입력한 Jetton 주소:
UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_

이것이 맞나요?
[ ] Yes - 정확히 복사했음
[ ] No  - 어디서 복사했는지?
[ ] 모름 - 앱에서 어떻게 찾나요?
```

**올바른 찾는 방법** (Tonkeeper):
```
1. Tonkeeper 앱 열기
2. 하단 메뉴에서 "Tokens" 클릭
3. "CSPIN" 토큰 찾기 (검색하면 쉬움)
4. CSPIN 클릭
5. "주소 복사" 또는 "Copy Address"
6. 그 주소를 게임에 붙여넣기
```

**또는 온라인 확인** (Tonviewer):
```
1. https://tonviewer.com 접속
2. 지갑 주소 입력: 0:ac0491ea8b74eda8e16210fd9c68f10642f327a70cf8b33e84efad148ce41ac4
3. "JettonsS" 탭 클릭
4. CSPIN의 Jetton 주소 복사
```

---

##***REMOVED***정보 2️⃣: 백엔드 로그 확인

**필요한 로그**:
```
API 응답에서:
✅ "message": "중앙화 방식 트랜잭션 생성 완료 (사용자 서명 필요): 1000 CSPIN"

✅ "boc": "te6cckEB..." (매우 긴 문자열)
```

**확인 포인트**:
```
[ ] message에 "1000 CSPIN" 표시?
[ ] boc가 텍스트로 반환?
[ ] boc 길이가 얼마나 김? (보통 200-500자)
```

---

##***REMOVED***정보 3️⃣: 브라우저 개발자 도구 - Network 탭

**확인 방법**:
```
1. 게임 페이지에서 F12 (개발자 도구)
2. Network 탭
3. 인출 요청 실행
4. "initiate-withdrawal" POST 요청 찾기
5. Response 탭에서 전체 응답 복사
```

**확인 포인트**:
```
응답에서:
- success: true 또는 false?
- boc 필드 있나?
- message에 "CSPIN" 텍스트 있나?
- error 필드 있나?
```

**예상 정상 응답**:
```json
{
  "success": true,
  "message": "중앙화 방식 트랜잭션 생성 완료 (사용자 서명 필요): 1000 CSPIN",
  "boc": "te6cckEBAQEAWAAArA+KfqU...",
  "tonAmount": "30000000",
  "newCredit": 0,
  "withdrawalAmount": 1000,
  "mode": "centralized"
}
```

---

#***REMOVED***🧪 테스트 시나리오

##***REMOVED***시나리오 A: Jetton 주소 재확인 후 재테스트 (추천)

```
1. Tonkeeper 열기
2. CSPIN 토큰 찾기
3. Jetton 주소 복사 (정확히!)
4. 게임에 붙여넣기
5. 다시 인출 시도
6. TON Connect 팝업에서:
   ✅ CSPIN 토큰 표시되나?
   ✅ 금액 1000 표시되나?
```

**예상 결과**:
```
성공: TON Connect에서 "1000 CSPIN 전송" 표시
실패: 여전히 "0.03 TON 전송" 표시 → 다른 원인
```

---

##***REMOVED***시나리오 B: 온라인 도구로 Jetton 주소 찾기

**Tonviewer 사용**:
```
1. https://tonviewer.com
2. 지갑 주소 입력:
   0:ac0491ea8b74eda8e16210fd9c68f10642f327a70cf8b33e84efad148ce41ac4
   (checksum format에서 user-friendly로 변환)
   또는
   UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_
3. "Jettons" 탭
4. CSPIN 찾기 (또는 여기서 검색)
5. CSPIN 마스터 주소: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
6. 클릭해서 내 Jetton 주소 확인
```

---

##***REMOVED***시나리오 C: 백엔드 로그 상세 기록

**백엔드에 추가할 로그** (임시):

```typescript
// initiate-withdrawal.ts 수정
console.log(`[중앙화] Jetton 주소 (입력): ${userJettonWalletAddress}`);
console.log(`[중앙화] Jetton 주소 (파싱): ${Address.parse(userJettonWalletAddress).toString()}`);
console.log(`[중앙화] BOC 생성 전 페이로드:
  - 전송량: ${toNano(withdrawalAmount.toString())} nano
  - 목적지: ${Address.parse(walletAddress).toString()}
  - 응답처: ${gameWalletAddress}
`);
```

---

#***REMOVED***📋 체크리스트

##***REMOVED***중앙화 방식 - TON Connect CSPIN 표시 문제

```
정보 수집:
[ ] 사용자가 입력한 Jetton 주소: _______________
    (올바른지 Tonkeeper에서 재확인?)
    
[ ] 백엔드 API 응답 (Network 탭):
    ```json
    (여기에 응는 JSON 붙여넣기)
    ```
    
[ ] 지갑에 CSPIN 잔액 있나?
    [ ] Yes - 잔액: _____ CSPIN
    [ ] No  - 먼저 입금 필요

[ ] 톤 잔액 충분?
    [ ] Yes - 잔액: _____ TON
    [ ] No  - 최소 0.1 TON 필요

테스트:
[ ] 올바른 Jetton 주소로 재테스트했나?
[ ] 그 결과: _____________________

진단:
[ ] BOC 생성됨? (API 응답 확인)
[ ] TON Connect 팝업에 CSPIN 표시? (Yes/No)
[ ] 여전히 "0.03 TON"만 표시? (Yes/No)
```

---

#***REMOVED***📞 다음 보고사항

테스트 후 다음을 보고해주세요:

```
1. Jetton 주소 확인:
   게임에 입력한 주소: UQCsBJHqi3TtqOFiEP2caPEGQvMnpwz4sz6E760UjOQaKFD_
   [ ] 이게 맞습니다
   [ ] 틀렸습니다. 올바른 주소: _______________
   
2. Tonkeeper 팝업 변화:
   [ ] CSPIN 관련 텍스트 보임
   [ ] 여전히 "0.03 TON"만 보임
   [ ] 다른 오류 메시지: _______________
   
3. API 응답 (Network 탭):
   ```json
   (응답 전체 붙여넣기)
   ```
```

---

#***REMOVED***💡 핵심 정리

##***REMOVED***Jetton 시스템 이해

```
[게임 지갑의 CSPIN]
   ↓ (소유)
[게임 지갑의 Jetton 중간 지갑: UQBFPDdSlPgqPr...]
   ↓ (1000 CSPIN 전송 메시지)
[사용자의 Jetton 중간 지갑: UQCsBJHqi3TtqOFiEP2c...] ← 여기!
   ↓ (최종적으로)
[사용자가 1000 CSPIN 수령!]
```

##***REMOVED***TON Connect에서 보이는 것

**올바른 경우**:
```
[↑ 메시지 1: -0.03 TON → 사용자의 Jetton 지갑]
[↓ 결과: +1000 CSPIN in 사용자의 Jetton 지갑]
```

**현재 경우 (❌)**:
```
[↑ Sent: -0.03 TON]  ← 이것만 보임
[= CSPIN 정보 없음]    ← 이것이 문제!
```

##***REMOVED***가능한 해결책 (우선순위)

1. **Jetton 주소 재확인** (지금 시작!)
2. **백엔드 로그 상세 기록** (필요시)
3. **다른 지갑으로 테스트** (다른 원인 배제)

---

**다음 단계: Jetton 주소를 다시 확인하고 재테스트해주세요!** 🚀

