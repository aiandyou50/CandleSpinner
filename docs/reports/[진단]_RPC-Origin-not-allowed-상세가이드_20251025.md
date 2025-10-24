# RPC Origin not allowed (-32079) - 상세 진단 가이드

**작성일**: 2025-10-25 오전 3:07  
**상태**: 🔴 긴급 진단 필요

---

## 현재 상황

```
[오전 3:07:53] 인출 시작: 1000 CSPIN (rpc 모드)
[오전 3:07:56] API 응답 상태: 500
[오전 3:07:56] ❌ 오류: RPC Error -32079: Origin not allowed
```

---

## 🎯 Origin not allowed의 의미

### "Origin"이란?

```
웹 요청의 "출발지" 정보:

모든 웹 요청:
┌─────────────────────────────────────┐
│ GET https://rpc.ankr.com/...        │
│ ─────────────────────────────────── │
│ Host: rpc.ankr.com                  │
│ Origin: https://aiandyou.me/        │ ← 이것!
│ User-Agent: ...                     │
└─────────────────────────────────────┘

Origin = "이 요청이 어디서 왔는가?"
```

### CORS (Cross-Origin Resource Sharing)

```
목적: 악의적인 요청 방지

방어 메커니즘:
RPC 서버 (Ankr)
  ├─ 요청 받음 (Origin: https://aiandyou.me/)
  ├─ 허용 목록 확인:
  │  └─ https://aiandyou.me/ ✅ (등록됨)
  └─ 응답 반환
  
만약 Origin이 허용 목록에 없으면?
  ├─ 요청 차단
  └─ "Origin not allowed" (-32079) 오류
```

---

## 🔍 가능한 원인 분석

### 원인 1️⃣: Ankr 대시보드 설정 (60% 확률)

**가능성**:
```
1. Origin이 잘못 등록됨
   등록: https://aiandyou.me/ (슬래시 포함)
   실제: https://aiandyou.me (슬래시 없음)
   → 불일치!

2. 캐시 갱신 지연
   설정: 5분 이상 필요 (Ankr 서버 캐시)
   
3. 다른 Origin 필요
   프론트엔드: https://aiandyou.me/
   백엔드: 클라우드플레어 워커 (다른 도메인?)
```

### 원인 2️⃣: 클라우드플레어 워커의 실제 Origin (30% 확률)

**상황**:
```
프론트엔드 요청:
  Client (브라우저) 
    └─ Origin: https://aiandyou.me/
    
하지만 백엔드에서 RPC 호출:
  Cloudflare Worker (Edge server)
    └─ Origin: ??? (뭔가 다를 수 있음)

클라우드플레어 워커의 실제 Origin:
  - 클라우드플레어 도메인?
  - 워커 서브도메인?
  - 원본 도메인의 IP?
  → 알 수 없음!
```

### 원인 3️⃣: RPC 엔드포인트 문제 (10% 확률)

```
1. API Key 만료
2. Ankr 서버 문제
3. RPC URL 오타
4. 네트워크 연결 문제
```

---

## 🧪 진단 방법 5가지

### 방법 1️⃣: Ankr 대시보드에서 Origin 확인 (즉시) ⏰

**단계별 가이드**:

```
1. https://www.ankr.com/dashboard 접속
2. 계정 로그인
3. 왼쪽 메뉴에서 "RPC"
4. "TON" 프로젝트 찾기 (또는 "+ Create New")
5. 프로젝트 클릭
6. "Endpoints" 또는 "Settings" 탭
7. "Allowed Origins" 섹션 찾기
   (또는 "CORS Origins", "Access Control" 등)

보이는 것:
┌──────────────────────────────────────┐
│ Allowed Origins (또는 CORS Origins):  │
├──────────────────────────────────────┤
│ ☑ https://aiandyou.me/               │
│ ☑ https://example.com/               │
│ (또는 비어있음)                       │
└──────────────────────────────────────┘
```

**확인 포인트**:
```
[ ] https://aiandyou.me/ 정확히 등록?
    [ ] Yes - 슬래시 포함
    [ ] Yes - 슬래시 없음
    [ ] No  - 등록 안 됨
    
[ ] 다른 Origin도 등록?
    [ ] _______________
    [ ] _______________
    
[ ] 마지막 수정 시간?
    [ ] _______________
```

**만약 등록 안 되어 있으면**:
```
1. "+ Add Origin" 또는 "Add" 버튼 클릭
2. https://aiandyou.me/ 입력 (정확히!)
3. 저장
4. 알림: "캐시 갱신까지 5-10분 소요"
5. 5분 이상 대기
```

---

### 방법 2️⃣: 브라우저에서 실제 Origin 확인 (지금 가능)

**단계별 가이드**:

```
1. 게임 페이지 https://aiandyou.me/ 접속
2. F12 (개발자 도구)
3. "Console" 탭
4. 다음 코드 붙여넣기:
   console.log(window.location.origin)
5. Enter
   
결과:
https://aiandyou.me
```

**확인**:
```
[ ] 출력 값: _______________
[ ] Ankr에 이 값 등록?
    [ ] Yes
    [ ] No
```

---

### 방법 3️⃣: 백엔드에서 실제 Origin 기록 (권장)

**백엔드 수정** (functions/api/rpc-utils.ts):

```typescript
// call 메서드에 추가:

private async call<T>() {
  // ... 기존 코드 ...
  
  // ← 여기 추가:
  console.log(`[RPC] 요청 Origin: ${context.request.headers.get('Origin')}`);
  console.log(`[RPC] 요청 Host: ${context.request.headers.get('Host')}`);
  console.log(`[RPC] 요청 Referer: ${context.request.headers.get('Referer')}`);
  
  try {
    const response = await fetch(this.rpcUrl, {...});
    // ... 기존 코드 ...
  }
}
```

**그 다음**:
```
1. 게임에서 RPC 방식 인출
2. 클라우드플레어 로그 확인:
   [RPC] 요청 Origin: _______________
   [RPC] 요청 Host: _______________
   [RPC] 요청 Referer: _______________
3. 이 Origin을 Ankr에 등록
```

---

### 방법 4️⃣: 직접 RPC 호출 테스트 (기술자용)

**브라우저 Console에서 직접 테스트**:

```javascript
// 1. Ankr RPC 엔드포인트 확인
const ANKR_RPC = 'https://rpc.ankr.com/ton_api_v2/[YOUR_API_KEY]';

// 2. 직접 호출 (CORS 테스트)
fetch(ANKR_RPC, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'ton_getAccountState',
    params: ['0:ACB84911EAB37ADD8EE16210FD9C68F10642F327A70CF8B33E84EFAD148CE41AC4'],
    id: 1
  })
})
.then(r => r.json())
.then(d => {
  if (d.error) {
    console.error('RPC 오류:', d.error);
  } else {
    console.log('성공:', d.result);
  }
})
.catch(e => console.error('네트워크 오류:', e));
```

**예상 결과**:
```
성공: 계정 정보 반환
오류1: "Origin not allowed" → Ankr 설정 문제
오류2: "Invalid credentials" → API Key 문제
오류3: 다른 오류 → 네트워크 문제
```

---

### 방법 5️⃣: 다른 RPC 제공자로 테스트 (최후의 수단)

**대체 RPC 목록**:

```
1. Toncenter (무료):
   https://testnet.toncenter.com/api/v2/jsonRPC
   
2. Getblock.io (유료):
   https://go.getblock.io/[API_KEY]/
   
3. Ton.cx (무료):
   https://rpc.ton.cx/
```

**테스트 방법**:
```
1. 환경변수 변경:
   ANKR_JSON_RPC_HTTPS_ENDPOINT = https://rpc.ton.cx/
   
2. 백엔드 재배포
3. RPC 방식 인출 재테스트
4. 작동하나?
   [ ] Yes → Ankr 문제 확인됨
   [ ] No  → 다른 원인
```

---

## 📋 진단 체크리스트

### Step 1: Ankr 대시보드 확인

```
[ ] Ankr 대시보드 로그인
[ ] TON 프로젝트 찾음
[ ] Allowed Origins 섹션 위치 파악:
    ┌──────────────────────┐
    │ 메뉴 경로: _________│
    │ 탭 이름: __________│
    │ 섹션 이름: ________│
    └──────────────────────┘

[ ] 현재 등록된 Origin:
    ☑ _____________________
    ☑ _____________________
    
[ ] https://aiandyou.me/ 등록?
    [ ] Yes - 정확히 등록됨
    [ ] Yes - 약간 다름 (어떻게?: _______)
    [ ] No  - 등록 안 됨 (지금 추가할 것)
    
[ ] 마지막 수정/갱신?
    [ ] 5분 이내
    [ ] 1시간 이내
    [ ] 1시간 이상 (재갱신 필요)
```

### Step 2: 브라우저 Origin 확인

```
[ ] Console에서 확인:
    window.location.origin = _______________
    
[ ] Ankr의 Origin과 일치?
    [ ] Yes
    [ ] No (차이: _______________)
```

### Step 3: 백엔드 로그 추가 (선택)

```
[ ] functions/api/rpc-utils.ts 수정
[ ] Origin 로깅 코드 추가
[ ] 배포
[ ] RPC 호출
[ ] 로그에서 실제 Origin 확인:
    Origin: _______________
    Host: _______________
    Referer: _______________
```

### Step 4: RPC 재테스트

```
Ankr 설정 완료 후 5분 대기:
[ ] 5분 이상 대기함
[ ] RPC 방식 인출 재테스트
[ ] 결과:
    [ ] 성공! 🎉
    [ ] 실패 - 오류: _______________
```

---

## 🧬 Origin 값 가능성 분석

### 가능성 1: 프론트 Origin (정상)
```
https://aiandyou.me/
또는
https://aiandyou.me
```

### 가능성 2: 클라우드플레어 워커 Origin
```
https://workers.cloudflare.com/
또는
https://[account-id].workers.dev/
또는
[클라우드플레어 custom domain]
```

### 가능성 3: IP 주소 Origin
```
https://192.168.1.1:8080/
또는
https://52.123.45.67/
```

### 가능성 4: localhost Origin
```
http://localhost:3000/
또는
http://127.0.0.1:5173/
```

---

## 🛠️ 해결책 (우선순위)

### 해결책 A: Origin 재설정 (가장 가능성 높음)

```
1. Ankr 대시보드 확인
2. https://aiandyou.me/ 정확히 등록 (슬래시 포함/없음 일치)
3. 5-10분 대기
4. 재테스트
```

### 해결책 B: 새로운 Origin 추가

```
만약 백엔드 Origin이 다르다면:

1. Ankr 대시보드에서 "+ Add Origin"
2. 실제 Origin 추가:
   예: https://[account].workers.dev/
3. 저장
4. 5-10분 대기
5. 재테스트
```

### 해결책 C: 백엔드 프록시 (최후의 수단)

```
프론트 → 백엔드 프록시 → Ankr RPC

장점: Origin 자동 처리
단점: 성능 저하

구현:
1. initiate-withdrawal.ts에서
2. RPC 호출 시 프록시 사용
3. 클라이언트 직접 호출 제거
```

---

## 📞 다음 보고사항

테스트 후 다음을 보고해주세요:

```
1. Ankr 대시보드 상태:
   [ ] 등록된 Origin 목록:
       - _____________________
       - _____________________
   
   [ ] https://aiandyou.me/ 정확히 등록?
       [ ] Yes - 슬래시: 포함/없음
       [ ] No  - 다른 형식: ___________
   
   [ ] 마지막 갱신: ______________

2. 브라우저 Origin 확인:
   [ ] window.location.origin = _______________
   [ ] Ankr의 Origin과 일치? (Yes/No)

3. RPC 재테스트:
   [ ] 5분 이상 대기 완료
   [ ] 재테스트 결과:
       [ ] 성공! 🎉
       [ ] 실패 - 오류: _______________

4. 스크린샷:
   [ ] Ankr 대시보드 Allowed Origins 스크린샷
   [ ] 오류 메시지 스크린샷
```

---

## 💡 빠른 참고

### Origin not allowed 해결 요약

```
1. 원인: Ankr이 요청의 Origin을 인식 못함
2. 진단:
   ├─ Ankr 대시보드 확인
   ├─ 브라우저 Origin 확인
   └─ 일치하나? (Yes = 다른 원인 / No = Origin 문제)
3. 해결:
   ├─ Origin 정확히 등록
   ├─ 5-10분 대기
   └─ 재테스트
```

### 주의사항

```
⚠️ Origin 등록 시 주의:
- https:// 포함 (http:// 아님)
- 슬래시(/) 포함 여부 확인 (일관성!)
- 도메인 정확히 (오타 금지!)
- 저장 후 5-10분 필요

⚠️ 캐시 관련:
- Ankr 서버가 캐시를 사용
- 변경 후 5-10분 필요
- 즉시 반영 안 됨!
- 로컬 캐시도 지워야 할 수 있음
```

---

**다음 단계: Ankr 대시보드에서 Origin 확인하고, 5분 이상 대기 후 재테스트하세요!** 🚀

