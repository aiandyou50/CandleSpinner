***REMOVED***🚨 긴급 진단: 주소 불일치 문제 분석

**작성일:** 2025-10-24 16:05  
**상태:** 인출 기능 실패 (HTTP 500)

---

#***REMOVED***📊 현재 상황

##***REMOVED***Debug API 출력 분석

```json
"addressMatch": {
  "match": false,
  "envAddress": "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd",      // ← 환경변수
  "calculatedAddress": "EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY",  // ← 개인키에서 계산
  "note": "❌ 경고: 개인키와 주소가 불일치!"
}
```

##***REMOVED***🔴 문제 분석

```
1. UQ vs EQ 접두사 차이
   ├─ UQ = Non-Bounceable 주소
   └─ EQ = Bounceable 주소
   
2. 주소 끝부분 다름
   ├─ envAddress: ...dptaR8Mtd
   └─ calculatedAddress: ...dptaR8JaY
   
3. 근본 원인
   └─ Cloudflare 환경변수의 GAME_WALLET_ADDRESS
      현재 개인키와 매칭되지 않음
      (이전 지갑 주소로 보임)
```

##***REMOVED***🚨 Error Log (lastError)

```json
"lastError": {
  "error": "bad secret key size",
  "timestamp": "2025-10-23T15:42:33.565Z"
}
```

**의미:**
- 가장 최근 오류: 2025-10-23 15:42 (UTC)
- 현재 배포: 2025-10-23 15:58
- ❌ 아직 수정 코드가 완전히 적용되지 않음
- 또는 구 버전의 캐시가 남아있음

---

#***REMOVED***🎯 해결 방법

##***REMOVED*****상황 분석**

```
✅ 개인키 (128자): 4e6568d1990bff34...ef7978fc
   ├─ privateKeyValid: true
   ├─ 길이: 128자 ✅
   └─ 형식: 정상

❌ 환경변수 주소 불일치
   ├─ envAddress (UQ...): 구 지갑 주소일 가능성
   └─ calculatedAddress (EQ...): 새 지갑 주소

❌ lastError still "bad secret key size"
   └─ 캐시 또는 구 버전 실행
```

##***REMOVED*****Step 1: Cloudflare 환경변수 확인 및 수정**

**당신이 해야 할 일:**

1. **Cloudflare 대시보드 접속**
   ```
   https://dash.cloudflare.com/
   → aiandyou.me (또는 Pages 프로젝트)
   → Settings → Environment variables
   → Production
   ```

2. **현재 설정 확인**
   ```
   GAME_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"
   ```

3. **수정해야 할 주소**
   ```
   새로운 주소 (개인키에서 계산됨):
   EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
   또는 Non-Bounceable:
   UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
   ```

---

#***REMOVED***📋 체크리스트

##***REMOVED***당신이 클라우드플레어에 설정할 환경변수

**Production 환경:**

```
1. GAME_WALLET_PRIVATE_KEY
   Type: Encrypted
   Value: 4e6568d1990bff34c3fc1e9243b8073262250bfab28d16a4d8c7ffd84479742d3a59677f67586df6a530023e054bfcd99e4cb2f7f134828d45905ba1ef7978fc

2. GAME_WALLET_ADDRESS  ⚠️ 수정 필요
   Type: Secret
   Value: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
   (또는 bounceable: EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY)

3. TON_RPC_API_KEY
   Type: Encrypted
   Value: [당신의 Ankr API 키]

4. CSPIN_TOKEN_ADDRESS
   Type: Secret
   Value: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
   (변경 불필요)
```

---

#***REMOVED***🔄 설정 후 진행 순서

##***REMOVED***1단계: Cloudflare 환경변수 업데이트 (당신)
```
✏️ GAME_WALLET_ADDRESS 수정
```

##***REMOVED***2단계: 배포 완료 대기 (2-3분)
```
⏳ Cloudflare Pages 자동 재배포
```

##***REMOVED***3단계: 테스트 (당신)
```
🧪 https://aiandyou.me/api/debug-withdrawal
   → addressMatch.match = true 확인
```

##***REMOVED***4단계: 실제 인출 테스트 (당신)
```
🎮 웹사이트에서 인출 시도
```

---

#***REMOVED***💡 추가 설명: UQ vs EQ 주소

```
TON 주소는 2가지 형식:

1. Bounceable (EQ...) - 기본 형식
   ├─ 트랜잭션 실패 시 반송됨
   └─ 스마트컨트랙트 사용 시 권장

2. Non-Bounceable (UQ...) - 보안 형식
   ├─ 트랜잭션 실패 시 반송 안 됨
   └─ 일반 지갑 사용 시 권장

⚠️ 중요: 둘 다 같은 지갑을 가리킴 (접두사만 다름)
   하지만 끝부분도 달라서 이상함
   
실제 문제: 주소 자체가 다른 지갑
```

---

#***REMOVED***✅ 최종 체크리스트

```
[ ] 1. Cloudflare 대시보드 접속
[ ] 2. Production 환경 → Environment variables
[ ] 3. GAME_WALLET_ADDRESS 확인
    현재: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd (❌ 구 주소)
    변경: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY (✅ 신 주소)
[ ] 4. GAME_WALLET_PRIVATE_KEY 확인 (128자)
[ ] 5. TON_RPC_API_KEY 확인
[ ] 6. 저장 후 2-3분 대기
[ ] 7. debug API 테스트
[ ] 8. 실제 인출 테스트
```

---

#***REMOVED***🎯 다음 단계

**당신이 해야 할 일:**

1. **지금 바로:** Cloudflare 환경변수 수정 (위의 주소)
2. **배포 대기:** 2-3분 기다리기
3. **테스트:** debug API에서 addressMatch.match = true 확인
4. **결과 공유:** 테스트 결과를 알려주기

**AI가 할 일:**
- RPC 환경변수 문제 분석
- 필요시 코드 수정

---

#***REMOVED***📌 중요 정보

**새로운 지갑 주소:**
```
Non-Bounceable: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
Bounceable:     EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
```

**개인키 (128자):**
```
4e6568d1990bff34c3fc1e9243b8073262250bfab28d16a4d8c7ffd84479742d3a59677f67586df6a530023e054bfcd99e4cb2f7f134828d45905ba1ef7978fc
```

⚠️ **보안:** 이 값들을 Cloudflare 대시보드에만 입력하세요!
