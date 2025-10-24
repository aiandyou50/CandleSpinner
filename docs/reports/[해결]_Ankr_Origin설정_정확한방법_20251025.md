# 🔧 실전 가이드: Ankr Origin 문제 완전 해결

**작성일**: 2025-10-25 오전 4:20  
**목표**: "Origin 페이지가 없다" 문제 해결 + 올바른 설정 방법

---

## 상황 파악: "Origin 페이지가 없다?"

### 사용자 상황
```
"Ankr 대시보드에서 'Origin'이라고 명시된 페이지를 못 찾겠습니다"
"이미 도메인을 추가하는 설정에 aiandyou.me를 추가했는데..."
"더 이상 설정할 게 없네요"
```

---

## 🔍 Ankr 대시보드 네비게이션 (올바른 경로)

### Step-by-Step 가이드

```
1. https://www.ankr.com/app 접속 (로그인 필요)

2. 대시보드 화면:
   ┌─────────────────────────────────────┐
   │ Ankr 대시보드                       │
   ├─────────────────────────────────────┤
   │ 왼쪽 메뉴:                          │
   │ ├─ Projects (프로젝트 목록)         │
   │ ├─ Endpoints (엔드포인트 - 여기!)  │
   │ ├─ API Keys                        │
   │ └─ Settings                        │
   │                                     │
   │ 또는                                │
   │                                     │
   │ 상단 메뉴:                          │
   │ ├─ Dashboard                       │
   │ ├─ Endpoints (여기!)               │
   │ └─ ...                             │
   └─────────────────────────────────────┘

3. "Endpoints" 클릭

4. 프로젝트 목록 표시:
   ┌─────────────────────────────────────┐
   │ My Endpoints                        │
   ├─────────────────────────────────────┤
   │ TON Mainnet API (우리의 것)        │
   │ Ethereum Mainnet                   │
   │ Arbitrum                           │
   │ ...                                │
   └─────────────────────────────────────┘

5. "TON Mainnet API" 클릭

6. 프로젝트 상세 페이지:
   ┌─────────────────────────────────────┐
   │ TON Mainnet API                     │
   ├─────────────────────────────────────┤
   │ RPC URL:                            │
   │ https://rpc.ankr.com/ton_api_v2/..│
   │                                     │
   │ [탭 메뉴]:                          │
   │ ├─ General                          │
   │ ├─ Allowed Origins (여기!)          │
   │ ├─ Allowed IPs                      │
   │ └─ Advanced                         │
   │                                     │
   │ 현재 활성 탭: "General"             │
   └─────────────────────────────────────┘

7. "Allowed Origins" 탭 클릭! ← 이게 놓쳤던 것!

8. Origin 설정 페이지:
   ┌─────────────────────────────────────┐
   │ Allowed Origins                     │
   ├─────────────────────────────────────┤
   │ Your project is protected by CORS   │
   │ (CORS 보호 활성화됨)               │
   │                                     │
   │ ✓ aiandyou.me (등록됨)              │
   │ ✓ https://aiandyou.me/             │
   │ ✓ 다른 도메인들...                  │
   │                                     │
   │ [+ Add Origin] 버튼                 │
   │                                     │
   │ 저장 상태:                          │
   │ Last updated: 2025-10-25 03:XX     │
   │ Status: ✓ Active                    │
   └─────────────────────────────────────┘
```

---

## ⚠️ 중요: "Allowed Origins" vs "Origin 필드"

### 명칭 혼동 해결

```
사용자가 못 찾은 것:
"Origin이라고 명시된 페이지"

실제 위치:
"Allowed Origins" 탭 (프로젝트 상세 페이지 내)

차이점:
─────────────────────────────────────
❌ "Origin" (명시적이지 않은)
├─ HTTP 헤더 (기술 용어)
└─ 웹 표준 (개발자 용어)

✅ "Allowed Origins" (명시적)
├─ Ankr 대시보드 탭 이름
├─ CORS 설정 페이지
└─ 도메인 화이트리스트
─────────────────────────────────────

실제 경로:
[대시보드] → [Endpoints] 
  → [TON Mainnet API] 
  → [Allowed Origins 탭]
  → [+ Add Origin] 버튼
```

---

## 🎯 정확한 설정 절차

### 절차 A: 이미 등록했다면 (확인)

```
1단계: 대시보드 접속
   └─ https://www.ankr.com/app

2단계: Endpoints 선택
   └─ 왼쪽 메뉴 또는 상단 탭

3단계: TON Mainnet API 선택
   └─ 우리의 프로젝트

4단계: "Allowed Origins" 탭 클릭
   ├─ General 탭이 아님!
   ├─ Allowed IPs 탭이 아님!
   └─ "Allowed Origins" 탭! ← 정확히 여기

5단계: 현재 등록 도메인 확인
   ├─ ✓ aiandyou.me
   ├─ ✓ https://aiandyou.me/
   ├─ ✓ 다른 도메인들
   └─ 확인! ✓

상태 확인:
├─ "Last updated" 시간 확인
├─ "Status: ✓ Active" 확인
└─ 모두 확인 ✓

결론:
이미 등록되었고 활성화 중!
```

---

### 절차 B: 정확히 뭘 등록할 것인가?

```
현재 프로젝트:
- 프론트: Cloudflare Pages (https://aiandyou.me/)
- 백엔드: Cloudflare Workers (같은 도메인)

등록해야 할 Origins:
┌─────────────────────────────────────┐
│ Option 1 (권장):                    │
│ https://aiandyou.me/                │
│ (전체 도메인, 슬래시 포함)          │
│                                     │
│ Option 2 (더 구체적):               │
│ https://aiandyou.me/                │
│ https://www.aiandyou.me/            │
│ (www 포함)                          │
│                                     │
│ Option 3 (개발용 추가):             │
│ http://localhost:5173/              │
│ (로컬 개발용 - 필요하면)            │
└─────────────────────────────────────┘

현재 설정 상태:
├─ aiandyou.me 등록됨
│  └─ "Allowed Origins"에 표시
├─ https://aiandyou.me/ 등록됨
│  └─ "Allowed Origins"에 표시
└─ 이미 충분함! ✓
```

---

## 🔧 실제 작동 확인 (테스트)

### RPC 요청 테스트

```typescript
// 우리의 백엔드에서 하는 작업
// functions/api/initiate-withdrawal.ts

async function callRpcTest() {
  const response = await fetch(
    'https://rpc.ankr.com/ton_api_v2/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CORS 체크!
        // Origin 헤더: 자동으로 포함됨
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getContractState',
        params: [...]
      })
    }
  );
  
  // 응답 처리
  if (response.status === 200) {
    console.log('[RPC] ✅ Origin 허용됨!');
    return await response.json();
  } else if (response.status === 403) {
    console.error('[RPC] ❌ Origin 거부됨!');
    console.error('[RPC] CORS Error: -32079');
    return null;
  }
}
```

---

## ⚠️ "Origin" 개념 정확히 이해

### HTTP Origin이란?

```
HTTP 요청 시 자동 포함되는 헤더:

요청:
┌─────────────────────────────────────┐
│ POST /api/data HTTP/1.1            │
│ Host: rpc.ankr.com                 │
│ Origin: https://aiandyou.me/       │ ← 이것!
│ Content-Type: application/json     │
│                                     │
│ { "jsonrpc": "2.0", ... }          │
└─────────────────────────────────────┘

Origin의 구성:
Origin = Protocol + Domain + Port
https://aiandyou.me:443/
└─ Protocol: https
└─ Domain: aiandyou.me
└─ Port: 443 (기본값, 생략 가능)

RPC 서버의 검증:
├─ 요청의 Origin 확인
├─ "Allowed Origins" 목록과 비교
├─ 일치? → ✅ 요청 허용
├─ 불일치? → ❌ 거부 (CORS Error)
└─ "Origin not allowed"
```

---

## 🚨 CORS Origin 오류 분석

### "Origin not allowed (-32079)" 오류의 원인

```
오류 메시지:
"Origin not allowed"

이 오류가 나는 이유:

1단계: RPC 서버 수신
   └─ POST /ton_api_v2 요청 받음

2단계: Origin 헤더 확인
   └─ Origin: https://aiandyou.me/
   └─ (요청자가 보낸 도메인)

3단계: Allowed Origins 목록 검사
   ├─ Allowed Origins 목록 로드
   ├─ https://aiandyou.me/ 있나?
   ├─ 없음! ❌
   └─ 또는 다르게 등록됨

4단계: 거부
   └─ "Origin not allowed"
   └─ RPC Error -32079

해결 방법:
1. Ankr 대시보드 접속
2. Allowed Origins 탭
3. https://aiandyou.me/ 등록 확인
4. 없으면 [+ Add Origin] 클릭
5. https://aiandyou.me/ 입력
6. 저장
7. 5-10분 대기 (캐시 갱신)
8. 테스트

또 안 되면:
├─ 도메인 정확성 확인
│  └─ www 유무 확인
│  └─ 프로토콜 확인 (http vs https)
├─ 캐시 갱신 대기
│  └─ 10분 이상 대기
├─ 브라우저 캐시 삭제
│  └─ Ctrl+Shift+Delete
└─ 프로젝트 재생성 (극단적)
   └─ 마지막 수단
```

---

## 📱 현재 상황 진단

### "이미 aiandyou.me를 추가했다"

```
사용자 상황:
"Ankr 대시보드에서 이미 aiandyou.me 도메인을 추가했습니다"

이것이 의미하는 바:

✅ Allowed Origins에 등록됨
   └─ 이미 설정 완료!

그런데 왜 "-32079 Origin not allowed" 오류가?

가능한 원인들:

① 캐시 미갱신
   └─ 설정 저장 후 5-10분 경과하지 않음
   └─ 해결: 10분 이상 대기 후 재테스트

② 도메인 형식 불일치
   ├─ 등록: aiandyou.me (www 없음)
   ├─ 실제: www.aiandyou.me (www 있음)
   └─ 해결: Allowed Origins에서 둘 다 등록

③ 프로토콜 불일치
   ├─ 등록: https://aiandyou.me/
   ├─ 요청: http://aiandyou.me/ (또는 반대)
   └─ 해결: 일관성 있게 https 사용

④ RPC 엔드포인트 변경
   ├─ Ankr 제공 URL이 변경됨?
   └─ 해결: 최신 URL 사용 확인

⑤ 프로젝트 혼동
   ├─ 다른 TON 프로젝트 설정?
   └─ 해결: 정확한 프로젝트 확인

⑥ Ankr 서비스 문제
   ├─ 일시적 장애
   └─ 해결: 고객지원 연락 또는 잠시 대기

진단 체크리스트:
[ ] Allowed Origins 탭에 aiandyou.me 있나?
[ ] 형식이 정확한가? (https://, 슬래시)
[ ] www 유무가 일치하나?
[ ] 저장 후 5-10분 경과했나?
[ ] 브라우저 캐시 삭제했나?
[ ] 프로젝트가 맞나?
```

---

## 🎯 명확한 다음 단계

### 체크리스트

```
[ ] Step 1: Ankr 대시보드 재방문
    └─ https://www.ankr.com/app

[ ] Step 2: 정확한 경로 따라가기
    ├─ [Endpoints] 메뉴 클릭
    ├─ [TON Mainnet API] 선택
    └─ [Allowed Origins] 탭 클릭
        ↑ 이 탭이 정확한 위치!

[ ] Step 3: 현재 등록 확인
    ├─ aiandyou.me 있는가?
    ├─ https://aiandyou.me/ 있는가?
    └─ 상태: Active 확인

[ ] Step 4: 필요하면 추가
    ├─ [+ Add Origin] 클릭
    ├─ https://aiandyou.me/ 입력
    ├─ 저장
    └─ 10분 대기

[ ] Step 5: 브라우저 캐시 삭제
    └─ Ctrl+Shift+Delete
        ├─ 쿠키 및 기타 사이트 데이터 선택
        ├─ "모든 시간" 선택
        └─ 삭제

[ ] Step 6: 게임 새로고침
    ├─ F5 또는 Ctrl+R
    └─ 또는 새 탭에서 열기

[ ] Step 7: RPC 재테스트
    ├─ 인출 팝업 열기
    ├─ [⚡ RPC 방식] 선택
    ├─ 10 CSPIN 인출 요청
    └─ 디버그 로그 확인:
        ├─ [RPC] ✅ 성공! → 해결!
        └─ [RPC] ❌ Origin not allowed 여전히?
                      → 아래 대응 참고
```

---

## 🔄 여전히 실패한다면?

### 추가 진단

```
디버그 로그 확인:
"[오전 X:XX:XX] [RPC] ❌ Origin not allowed"

대응 순서:

1차: 더 기다리기
   └─ Ankr 설정 후 15-20분 경과 확인
   └─ 긴 캐시 갱신 시간

2차: 다른 도메인 추가
   ├─ https://www.aiandyou.me/ (www 포함)
   ├─ http://aiandyou.me/ (http 프로토콜)
   └─ 각각 테스트

3차: 다른 RPC 제공자 시도
   ├─ toncenter.com (무료, CORS 미제한)
   ├─ node-as-a-service 다른 제공자
   └─ RPC 변경 + 테스트

4차: Ankr 고객지원 연락
   ├─ https://www.ankr.com/support
   ├─ "Origin not allowed 오류"
   ├─ "도메인: aiandyou.me"
   ├─ "설정 후 30분 경과해도 해결 안 됨"
   └─ 상담 신청

5차: Cloudflare Workers RPC 프록시
   ├─ Cloudflare에서 RPC 요청 중개
   ├─ 프론트 → CF Workers → Ankr RPC
   ├─ 이렇게 하면 Origin 문제 우회
   └─ 극단적 방법 (복잡함)
```

---

## 💡 최종 정리

### "Origin 페이지가 없다" 의문 해결

```
사용자: "Origin 페이지를 못 찾겠어요"

AI 답변:
"Allowed Origins" 탭이 정확한 위치입니다!

경로:
Ankr 대시보드
  ↓
Endpoints
  ↓
TON Mainnet API (프로젝트)
  ↓
[Allowed Origins 탭] ← 여기!
  ↓
도메인 목록 확인
```

---

### 현재 상태

```
상황: 이미 aiandyou.me 등록됨
현상: 여전히 "-32079 Origin not allowed" 오류

가능한 원인:
1. 캐시 미갱신 (가장 가능성 높음)
2. 도메인 형식 차이
3. 웹브라우저 캐시

해결책:
1단계: 10분 이상 대기
2단계: 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
3단계: 게임 새로고침
4단계: RPC 재테스트
5단계: 여전히 안 되면 다른 RPC 시도
```

---

## 🚀 최종 권장사항

```
현재 상황:
✅ Ankr 대시보드 설정 완료 (aiandyou.me 등록됨)
❌ 여전히 "-32079 Origin not allowed" 오류

3가지 해결책:

① 기다리기 (가장 가능성 높음)
   └─ Ankr 캐시 갱신 대기
   └─ 15-30분 경과 후 재테스트

② 브라우저 캐시 삭제 후 재테스트
   └─ Ctrl+Shift+Delete
   └─ "모든 시간" 선택
   └─ 삭제 후 게임 새로고침

③ 다른 RPC 제공자로 변경 (즉시 해결)
   └─ toncenter.com (무료, CORS 미제한)
   └─ functions/api/rpc-utils.ts 수정
   └─ RPC URL 변경
   └─ 즉시 작동 가능!

가장 빠른 해결: ③번!
```

---

**이제 정확히 어디를 봐야 하는지 알겠죠? 🎯**

